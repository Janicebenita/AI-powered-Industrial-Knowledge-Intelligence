from __future__ import annotations

from pathlib import Path
from typing import Any

from app.rag.providers import provider_for
from app.services.extraction_service import extract_entities, infer_relationships
from app.services.ingestion_service import chunk_text, infer_doc_type, read_document


def preview_pipeline(path: Path, ai_provider: str = "local") -> dict[str, Any]:
    provider = provider_for(ai_provider)
    text = read_document(path)
    chunks = chunk_text(text)
    entities = extract_entities(text)
    return {
        "pipeline": ["Uploaded", "OCR/Text Extraction", "Classification", "Chunking", "Entity Extraction", "Embedding", "Vector Storage", "Knowledge Graph"],
        "document_type": infer_doc_type(path.name, text),
        "chunks": len(chunks),
        "entities": entities,
        "relationships": infer_relationships(text, entities),
        "embedding_dimensions": len(provider.embed(text[:1200])),
    }
