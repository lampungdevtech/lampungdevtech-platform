from typing import List, Optional
from pydantic import BaseModel, Field

# --- EdTech Progress Summarizer ---
class AIProgressRequest(BaseModel):
    student_id: str = Field(default="", description="ID Siswa")
    student_name: str = Field(default="Siswa", description="Nama lengkap siswa")
    week_number: int = Field(default=1, ge=1, description="Nomor minggu evaluasi")
    homework_score: int = Field(default=80, ge=0, le=100, description="Skor nilai tugas/kuis")
    teacher_notes: str = Field(default="", description="Catatan observasi dari pengajar")
    concepts: List[str] = Field(default_factory=list, description="Daftar topik konsep STEM yang diajarkan")

class AIProgressResponse(BaseModel):
    student_id: str
    summary: str
    concepts_mastered: List[str]
    encouragement_tip: str
    is_cached: bool = False
    model_used: str = "gemini-1.5-flash"

# --- POS AI Smart Restock & Demand Forecasting ---
class DemandForecastRequest(BaseModel):
    branch_id: str = Field(..., description="ID Cabang")
    ingredient_id: str = Field(..., description="ID Bahan Baku")
    ingredient_name: str = Field(..., description="Nama Bahan Baku (e.g. Susu Fresh Milk)")
    current_stock: float = Field(..., ge=0, description="Stok fisik gudang saat ini")
    min_threshold: float = Field(..., ge=0, description="Ambang batas minimum aman")
    unit: str = Field(default="kg", description="Satuan bahan baku (kg, liter, pcs)")
    forecast_days: int = Field(default=3, ge=1, le=14, description="Cakupan proyeksi hari")

class DemandForecastResponse(BaseModel):
    ingredient_id: str
    ingredient_name: str
    branch_id: str
    current_stock: float
    predicted_consumption: float
    unit: str
    confidence_score: float
    recommendation_type: str # NORMAL, UPCOMING_DEPLETION, CRITICAL_RESTOCK
    rationale: str
    recommended_order_quantity: float

# --- Semantic Search & RAG ---
class SemanticSearchRequest(BaseModel):
    query: str = Field(..., min_length=2, description="Pertanyaan atau kata kunci makna")
    program_id: Optional[str] = Field(default=None, description="Filter program kurikulum tertentu")
    top_k: int = Field(default=3, ge=1, le=10, description="Jumlah hasil chunk paling mirip")

class SearchResultItem(BaseModel):
    id: str
    module_title: str
    content_chunk: str
    score: float

class SemanticSearchResponse(BaseModel):
    query: str
    total_found: int
    results: List[SearchResultItem]
