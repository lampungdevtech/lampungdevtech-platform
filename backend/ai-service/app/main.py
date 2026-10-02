import logging
import uvicorn
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.schemas.ai_schemas import (
    AIProgressRequest, AIProgressResponse,
    DemandForecastRequest, DemandForecastResponse,
    SemanticSearchRequest, SemanticSearchResponse
)
from app.services.gemini_service import gemini_service
from app.services.forecast_service import forecast_service
from app.services.rag_service import rag_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_service.main")

app = FastAPI(
    title="LampungDevTech AI & ML Microservice",
    description="High-performance AI engine for EdTech Progress Summarization, POS Demand Forecasting, and Vector Search",
    version="1.0.0"
)

cors_origins_env = settings.dict().get("CORS_ALLOWED_ORIGINS", "") if hasattr(settings, "CORS_ALLOWED_ORIGINS") else ""
if cors_origins_env:
    allowed_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]
elif settings.APP_ENV == "production":
    allowed_origins = [
        "https://lampungdevtech.my.id",
        "https://www.lampungdevtech.my.id",
        "https://lampungdev.tech",
        "https://www.lampungdev.tech"
    ]
else:
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz", tags=["Health"])
async def healthz():
    return {
        "status": "healthy",
        "service": "ai-engine",
        "timestamp": datetime.now().isoformat(),
        "gemini_api_configured": bool(settings.GEMINI_API_KEY),
        "environment": settings.APP_ENV
    }

@app.post("/api/v1/ai/summarize", response_model=AIProgressResponse, tags=["EdTech AI"])
async def summarize_student_progress(req: AIProgressRequest):
    """
    Transforms raw teacher observation notes and homework metrics into
    an encouraging, child-friendly weekly evaluation for parents.
    """
    try:
        return await gemini_service.generate_weekly_summary(req)
    except Exception as e:
        logger.error(f"Error in summarize_student_progress: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ai/forecast", response_model=DemandForecastResponse, tags=["POS AI"])
async def predict_demand(req: DemandForecastRequest):
    """
    Predicts raw material and ingredient consumption for Cafe POS branches
    using moving average heuristics and weekend seasonality multipliers.
    """
    try:
        return forecast_service.predict_demand(req)
    except Exception as e:
        logger.error(f"Error in predict_demand: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ai/search", response_model=SemanticSearchResponse, tags=["Semantic Search & RAG"])
async def semantic_search(req: SemanticSearchRequest):
    """
    Retrieves most relevant curriculum modules or SOP documents via semantic vector search.
    """
    try:
        return rag_service.search_curriculum(req)
    except Exception as e:
        logger.error(f"Error in semantic_search: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    logger.info(f"Starting LampungDevTech AI Engine on port {settings.PORT}...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=False)
