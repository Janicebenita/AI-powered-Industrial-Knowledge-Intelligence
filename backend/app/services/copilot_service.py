from __future__ import annotations

import re
import uuid
from typing import Any

from app.database import connect, query
from app.services.maintenance_service import asset_360, rca_for_asset
from app.services.retrieval_service import evidence_is_sufficient, retrieve

ASSET_RE = re.compile(r"\b(?:P|C|B|HX|V|EP)-?\d{3}\b")
DOMAIN_TERMS = {
    "asset",
    "audit",
    "boiler",
    "cavitation",
    "checklist",
    "compliance",
    "compressor",
    "document",
    "evidence",
    "failure",
    "inspection",
    "maintenance",
    "manual",
    "permit",
    "plant",
    "pump",
    "rca",
    "regulatory",
    "risk",
    "safety",
    "seal",
    "sop",
    "vessel",
    "work",
    "workorder",
}


def _insufficient_answer(answer_id: str, reason: str = "No sufficiently relevant source chunk was found.") -> dict[str, Any]:
    return {
        "answer_id": answer_id,
        "direct_answer": f"I can only answer from the uploaded Industrial Brain AI plant documents. {reason} I will not guess or use unrelated general knowledge.",
        "confidence": 0.12,
        "citations": [],
        "related_assets": [],
        "related_documents": [],
        "suggested_next_actions": ["Ask about an indexed asset, SOP, work order, inspection, RCA, compliance item, or uploaded document.", "Upload the missing plant evidence if this question should be answerable."],
        "evidence_strength": "insufficient",
    }


def _citations(answer_id: str, evidence: list[dict[str, Any]]) -> list[dict[str, Any]]:
    citations = []
    with connect() as conn:
        for item in evidence[:4]:
            quote = item["text"][:260].replace("\n", " ")
            confidence = _citation_confidence(item)
            conn.execute(
                "INSERT INTO citations(answer_id, document_id, chunk_id, quote, page_number, confidence) VALUES (?, ?, ?, ?, ?, ?)",
                (answer_id, item["document_id"], item["chunk_id"], quote, item["page_number"], confidence),
            )
            citations.append(
                {
                    "document_id": item["document_id"],
                    "chunk_id": item["chunk_id"],
                    "filename": item["filename"],
                    "page_number": item["page_number"],
                    "section": item["section"],
                    "quote": quote,
                    "confidence": confidence,
                }
            )
        conn.commit()
    return citations


def _citation_confidence(item: dict[str, Any]) -> float:
    keyword_score = min(1.0, item.get("keyword_overlap", 0) / 0.65)
    raw_score = min(1.0, item.get("score", 0) / 0.35)
    confidence = 0.5 + (0.35 * keyword_score) + (0.15 * raw_score)
    return round(min(0.96, max(0.5, confidence)), 2)


def _clean_sentence(text: str) -> str:
    clean = re.sub(r"\s+", " ", text.replace("\u2022", " ")).strip(" -.;:")
    sentences = re.split(r"(?<=[.!?])\s+", clean)
    preferred_terms = ("correct application", "proper installation", "periodic inspection", "careful maintenance", "suction", "cavitation", "seal", "alignment", "inspection", "maintenance")
    for sentence in sentences:
        sentence = sentence.strip(" -.;:")
        if 45 <= len(sentence) <= 240 and any(term in sentence.lower() for term in preferred_terms):
            return sentence
    for sentence in sentences:
        sentence = sentence.strip(" -.;:")
        if 45 <= len(sentence) <= 240 and not sentence.lower().startswith(("pumps makes", "this instructio")):
            return sentence
    for index, sentence in enumerate(sentences[:-1]):
        if sentence.lower().strip().startswith("pumps makes"):
            return sentences[index + 1].strip(" -.;:")[:240]
    return clean[:220].strip(" -.;:")


def _evidence_summary(evidence: list[dict[str, Any]]) -> str:
    points = []
    seen: set[str] = set()
    for item in evidence[:3]:
        point = _clean_sentence(item["text"])
        key = point.lower()[:90]
        if point and key not in seen:
            seen.add(key)
            points.append(f"- {point} ({item['filename']}, p.{item['page_number']})")

    if not points:
        return "The retrieved documents do not contain a clean, answerable passage for this question."

    return "Based on the strongest cited plant records:\n" + "\n".join(points)


def _focused_evidence(evidence: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not evidence:
        return []
    top_score = evidence[0]["score"]
    cutoff = max(0.28, top_score * 0.8)
    focused = [item for item in evidence if item["score"] >= cutoff and item["keyword_overlap"] >= 0.35]
    return focused[:4] or evidence[:1]


def _answer_confidence(evidence: list[dict[str, Any]], document_id: int | None = None) -> float:
    if not evidence:
        return 0.12
    top = evidence[0]
    keyword_score = min(1.0, top.get("keyword_overlap", 0) / 0.65)
    citation_score = min(1.0, len(evidence) / 3)
    raw_score = min(1.0, top.get("score", 0) / 0.35)
    confidence = 0.52 + (0.28 * keyword_score) + (0.12 * raw_score) + (0.08 * citation_score)
    if document_id:
        confidence += 0.05
    return round(min(0.96, max(0.52, confidence)), 2)


def ask_copilot(question: str, user_role: str = "maintenance", document_id: int | None = None) -> dict[str, Any]:
    answer_id = str(uuid.uuid4())
    question_lower = question.lower()
    asset_tags = sorted({_normalize_asset_tag(tag) for tag in ASSET_RE.findall(question)})
    domain_question = bool(asset_tags) or bool(document_id) or any(term in question_lower for term in DOMAIN_TERMS)

    if not domain_question:
        return _insufficient_answer(answer_id, "That question is outside the uploaded industrial operations knowledge base.")

    evidence = retrieve(question, document_id=document_id)
    if not evidence_is_sufficient(evidence, document_id=document_id):
        return _insufficient_answer(answer_id)
    evidence = _focused_evidence(evidence)

    direct = "Based on cited plant records, "
    actions = ["Review cited documents before field execution.", "Confirm current asset condition in the CMMS before approving work."]

    if "why" in question_lower or "root cause" in question_lower or "rca" in question_lower:
        asset = asset_tags[0] if asset_tags else _first_asset_from_evidence(evidence)
        rca = rca_for_asset(asset) if asset else None
        if rca:
            direct += f"{asset} shows repeated {', '.join(rca['repeated_failure_modes']) or 'failure'} signals. Likely contributors are {', '.join(rca['likely_root_causes'])}. {rca['summary']}"
            actions = rca["recommended_actions"]
        else:
            direct += "the strongest evidence points to repeated maintenance and inspection findings, but the source set is not enough for a confident RCA."
    elif "history" in question_lower and asset_tags:
        asset = asset_360(asset_tags[0])
        direct += f"{asset_tags[0]} has {len(asset['work_orders'])} work orders, {len(asset['failures'])} failures, and {len(asset['inspections'])} inspections in the indexed record."
    elif "compliance" in question_lower or "regulatory" in question_lower or "covered" in question_lower:
        gaps = query("SELECT clause, requirement FROM regulations WHERE evidence_status != 'covered' LIMIT 5")
        if gaps:
            direct += "the compliance map has uncovered or partial requirements: " + "; ".join(f"{gap['clause']} - {gap['requirement']}" for gap in gaps)
            actions = ["Assign owners for each uncovered clause.", "Attach current inspection or procedure evidence to the audit package."]
        else:
            direct += "all seeded checklist clauses currently have mapped evidence."
    else:
        direct = _evidence_summary(evidence)

    citations = _citations(answer_id, evidence)
    related_assets = asset_tags or sorted({_normalize_asset_tag(tag) for tag in ASSET_RE.findall(" ".join(item["text"] for item in evidence))})[:5]
    related_documents = sorted({item["filename"] for item in evidence[:5]})
    confidence = _answer_confidence(evidence, document_id=document_id)

    return {
        "answer_id": answer_id,
        "direct_answer": direct,
        "confidence": confidence,
        "citations": citations,
        "related_assets": related_assets,
        "related_documents": related_documents,
        "suggested_next_actions": actions,
        "evidence_strength": "strong" if confidence >= 0.72 else "moderate",
    }


def _first_asset_from_evidence(evidence: list[dict[str, Any]]) -> str | None:
    for item in evidence:
        found = ASSET_RE.findall(item["text"])
        if found:
            return _normalize_asset_tag(found[0])
    return None


def _normalize_asset_tag(tag: str) -> str:
    match = re.match(r"^(P|C|B|HX|V|EP)-?(\d{3})$", tag)
    if not match:
        return tag
    return f"{match.group(1)}-{match.group(2)}"
