from __future__ import annotations

import re
from typing import Any

from app.database import loads, query
from app.services.embedding_service import cosine, embed_text, tokenize

STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "have",
    "how",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "show",
    "the",
    "to",
    "what",
    "when",
    "where",
    "which",
    "who",
    "why",
    "with",
}


def retrieve(question: str, limit: int = 6, document_id: int | None = None) -> list[dict[str, Any]]:
    q_emb = embed_text(question)
    q_tokens = set(tokenize(question))
    q_keywords = {token for token in q_tokens if token not in STOPWORDS and len(token) > 2}
    sql = """
        SELECT c.id AS chunk_id, c.document_id, c.page_number, c.section, c.text, c.embedding,
               d.filename, d.doc_type, d.created_at
        FROM chunks c
        JOIN documents d ON d.id = c.document_id
    """
    params: tuple[int, ...] = ()
    if document_id:
        sql += " WHERE d.id = ?"
        params = (document_id,)
    rows = query(sql, params)
    scored = []
    for row in rows:
        searchable_text = f"{row['filename']} {row['doc_type']} {row['section']} {row['text']}"
        emb_score = max(cosine(q_emb, loads(row["embedding"], {})), cosine(q_emb, embed_text(searchable_text[:1200])))
        text_tokens = set(tokenize(searchable_text))
        keyword_overlap = len(q_keywords & text_tokens) / max(len(q_keywords), 1)
        filename_match = bool(q_keywords & set(tokenize(row["filename"])))
        filename_bonus = 0.08 if filename_match else 0
        overlap = keyword_overlap if q_keywords else 0
        score = round((0.68 * emb_score) + (0.24 * overlap) + filename_bonus, 4)
        row["score"] = score
        row["keyword_overlap"] = round(keyword_overlap, 4)
        row["filename_match"] = filename_match
        row.pop("embedding", None)
        scored.append(row)

    deduped = []
    seen_documents: set[str] = set()
    seen_text: set[str] = set()
    for item in sorted(scored, key=lambda candidate: candidate["score"], reverse=True):
        document_key = _canonical_filename(item["filename"])
        text_key = _text_fingerprint(item["text"])
        if document_key in seen_documents or text_key in seen_text:
            continue
        seen_documents.add(document_key)
        seen_text.add(text_key)
        deduped.append(item)
        if len(deduped) >= limit:
            break
    return deduped


def evidence_is_sufficient(results: list[dict[str, Any]], threshold: float = 0.28, document_id: int | None = None) -> bool:
    if not results:
        return False
    if document_id:
        return results[0]["keyword_overlap"] >= 0.18 or results[0]["score"] >= 0.18
    return results[0]["score"] >= threshold and (results[0]["keyword_overlap"] >= 0.35 or results[0]["filename_match"])


def _canonical_filename(filename: str) -> str:
    clean = filename.lower()
    clean = re.sub(r"\.[a-z0-9]+$", "", clean)
    clean = re.sub(r"[^a-z0-9]+", " ", clean)
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean


def _text_fingerprint(text: str) -> str:
    tokens = tokenize(text[:700])
    return " ".join(tokens[:50])
