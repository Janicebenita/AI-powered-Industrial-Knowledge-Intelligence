from __future__ import annotations

from pathlib import Path

from app.rag.pipeline import preview_pipeline
from app.services.ingestion_service import ingest_path


def process_document_async(path: str) -> dict:
    """Background-worker compatible task body for Celery/RQ/Arq integration."""
    preview = preview_pipeline(Path(path))
    result = ingest_path(Path(path))
    return {"timeline": preview["pipeline"], "result": result}
