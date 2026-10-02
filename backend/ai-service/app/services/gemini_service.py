import hashlib
import json
import logging
import httpx
from typing import Tuple, List
from app.core.config import settings
from app.schemas.ai_schemas import AIProgressRequest, AIProgressResponse

logger = logging.getLogger("ai_service.gemini")

class GeminiAIService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.redis_client = None
        self._init_redis()

    def _init_redis(self):
        if settings.REDIS_URL:
            try:
                import redis
                self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
            except Exception as e:
                logger.warning(f"Redis cache connection failed: {e}. Running without Redis cache.")

    async def generate_weekly_summary(self, req: AIProgressRequest) -> AIProgressResponse:
        cache_key = self._get_cache_key(req)
        
        # 1. Check Redis Cache
        if self.redis_client:
            try:
                cached = self.redis_client.get(cache_key)
                if cached:
                    data = json.loads(cached)
                    return AIProgressResponse(
                        student_id=req.student_id,
                        summary=data["summary"],
                        concepts_mastered=data["concepts_mastered"],
                        encouragement_tip=data["encouragement_tip"],
                        is_cached=True,
                        model_used="redis-cache"
                    )
            except Exception as e:
                logger.warning(f"Cache lookup failed: {e}")

        # 2. Try Calling Gemini API if configured
        if self.api_key:
            try:
                resp = await self._call_gemini_api(req)
                if resp:
                    # Cache in Redis (TTL: 24 hours)
                    if self.redis_client:
                        try:
                            self.redis_client.setex(
                                cache_key, 
                                86400, 
                                json.dumps({
                                    "summary": resp.summary,
                                    "concepts_mastered": resp.concepts_mastered,
                                    "encouragement_tip": resp.encouragement_tip
                                })
                            )
                        except Exception as cache_err:
                            logger.warning(f"Failed to persist cache: {cache_err}")
                    return resp
            except Exception as e:
                logger.error(f"Gemini API invocation error: {e}. Switching to deterministic fallback synthesizer.")

        # 3. Deterministic High-Quality Fallback
        summary, tip, concepts = self._synthesize_fallback(req)
        return AIProgressResponse(
            student_id=req.student_id,
            summary=summary,
            concepts_mastered=concepts,
            encouragement_tip=tip,
            is_cached=False,
            model_used="deterministic-fallback"
        )

    def _get_cache_key(self, req: AIProgressRequest) -> str:
        raw_key = f"ai:summary:{req.student_id}:{req.week_number}:{req.homework_score}:{req.teacher_notes}"
        return f"cache:summary:{hashlib.sha256(raw_key.encode()).hexdigest()[:16]}"

    async def _call_gemini_api(self, req: AIProgressRequest) -> AIProgressResponse:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
        
        system_instruction = (
            "You are an expert child educational psychologist and STEM mentor at LampungDevTech Platform.\n"
            "Convert raw teacher evaluation notes and homework metrics into an encouraging, warm, and constructive "
            "weekly progress evaluation for the student's parents.\n"
            "Respond strictly in JSON format with keys:\n"
            "- summary: string (2-3 warm sentences in Indonesian praising effort and highlighting progress)\n"
            "- conceptsMastered: array of strings (key STEM concepts mastered)\n"
            "- encouragementTip: string (1 practical and fun recommendation for parents to practice at home)"
        )
        
        user_content = (
            f"Nama Siswa: {req.student_name}\n"
            f"Minggu Ke: {req.week_number}\n"
            f"Skor Tugas/Kuis: {req.homework_score}/100\n"
            f"Catatan Guru: {req.teacher_notes}\n"
            f"Konsep: {', '.join(req.concepts) if req.concepts else 'Computational Thinking'}"
        )

        payload = {
            "contents": [{
                "parts": [{"text": f"{system_instruction}\n\n{user_content}"}]
            }],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.7
            }
        }

        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                raise Exception(f"Gemini API responded with HTTP {resp.status_code}: {resp.text}")
            
            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise Exception("Empty candidates returned from Gemini")
            
            raw_text = candidates[0]["content"]["parts"][0]["text"]
            parsed = json.loads(raw_text)
            
            return AIProgressResponse(
                student_id=req.student_id,
                summary=parsed.get("summary", ""),
                concepts_mastered=parsed.get("conceptsMastered", req.concepts or ["Computational Thinking"]),
                encouragement_tip=parsed.get("encouragementTip", "Diskusikan proyek ananda selama 10 menit."),
                is_cached=False,
                model_used="gemini-1.5-flash"
            )

    def _synthesize_fallback(self, req: AIProgressRequest) -> Tuple[str, str, List[str]]:
        concepts = req.concepts if req.concepts else ["Computational Thinking", "Problem Solving", "Visual Collaboration"]
        name = req.student_name if req.student_name else "Siswa"
        
        summary = (
            f"🌟 Evaluasi Mingguan {name} (Minggu {req.week_number}): Ananda menunjukkan dedikasi dan antusiasme "
            f"yang mengagumkan dengan perolehan skor tugas {req.homework_score}/100. {req.teacher_notes} "
            f"Daya nalar analitis dan kerja samanya di kelas berkembang secara sangat memuaskan!"
        )
        
        tip = (
            f"💡 Tips Ayah Bunda: Berikan apresiasi kepada {name} atas usahanya minggu ini, dan ajak menceritakan "
            f"kembali tantangan logika yang ia selesaikan di sesi kelas selama 10 menit saat santai keluarga."
        )
        
        return summary, tip, concepts

gemini_service = GeminiAIService()
