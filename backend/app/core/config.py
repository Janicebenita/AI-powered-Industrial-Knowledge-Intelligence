from __future__ import annotations

from functools import lru_cache
from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "Industrial Brain AI"
    environment: str = "development"
    database_url: str = "sqlite:///./app/data/industrial_brain.db"
    postgres_url: str = "postgresql+psycopg://industrial:industrial@postgres:5432/industrial_brain"
    redis_url: str = "redis://redis:6379/0"
    chroma_url: str = "http://chromadb:8000"
    jwt_secret: str = "change-me-for-production"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 480
    ai_provider: str = "local"
    openai_api_key: str | None = None
    gemini_api_key: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()
