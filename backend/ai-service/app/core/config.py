import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "LampungDevTech AI Engine"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    PORT: int = int(os.getenv("PORT", "8000"))
    GRPC_PORT: int = int(os.getenv("GRPC_PORT", "50051"))
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgres://pos_user:pos_password@localhost:5432/pos_db?sslmode=disable")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
