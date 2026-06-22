from __future__ import annotations

from typing import Any

from app.database import loads, query
from app.services.embedding_service import cosine, embed_text, tokenize


def retrieve(question: str, limit: int = 6) -> list[dict[str, Any]]:
    q_emb = embed_text(question)
    q_tokens = set(tokenize(question))
    rows = query(
        """
        SELECT c.id AS chunk_id, c.document_id, c.page_number, c.section, c.text, c.embedding,
               d.filename, d.doc_type, d.created_at
        FROM chunks c
        JOIN documents d ON d.id = c.document_id
        """
    )
    scored = []
    for row in rows:
        emb_score = cosine(q_emb, loads(row["embedding"], {}))
        text_tokens = set(tokenize(row["text"]))
        overlap = len(q_tokens & text_tokens) / max(len(q_tokens), 1)
        score = round((0.72 * emb_score) + (0.28 * overlap), 4)
        row["score"] = score
        row.pop("embedding", None)
        scored.append(row)
    return sorted(scored, key=lambda item: item["score"], reverse=True)[:limit]


def evidence_is_sufficient(results: list[dict[str, Any]], threshold: float = 0.08) -> bool:
    return bool(results) and results[0]["score"] >= threshold
