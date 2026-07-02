from __future__ import annotations

import re
import uuid
from typing import Any

from app.database import connect, query
from app.services.maintenance_service import asset_360, rca_for_asset
from app.services.retrieval_service import evidence_is_sufficient, retrieve

ASSET_RE = re.compile(r"\b(?:P|C|B|HX|V|EP)-?\d{3}\b")


def _citations(answer_id: str, evidence: list[dict[str, Any]]) -> list[dict[str, Any]]:
    citations = []
    with connect() as conn:
        for item in evidence[:4]:
            quote = item["text"][:260].replace("\n", " ")
            conn.execute(
                "INSERT INTO citations(answer_id, document_id, chunk_id, quote, page_number, confidence) VALUES (?, ?, ?, ?, ?, ?)",
                (answer_id, item["document_id"], item["chunk_id"], quote, item["page_number"], item["score"]),
            )
            citations.append(
                {
                    "document_id": item["document_id"],
                    "chunk_id": item["chunk_id"],
                    "filename": item["filename"],
                    "page_number": item["page_number"],
                    "section": item["section"],
                    "quote": quote,
                    "confidence": item["score"],
                }
            )
        conn.commit()
    return citations


def ask_copilot(question: str, user_role: str = "maintenance") -> dict[str, Any]:
    answer_id = str(uuid.uuid4())
    asset_tags = sorted({_normalize_asset_tag(tag) for tag in ASSET_RE.findall(question)})
    evidence = retrieve(question, limit=24 if asset_tags else 6)
    if asset_tags:
        evidence = _asset_specific_evidence(evidence, asset_tags)
    if not evidence_is_sufficient(evidence):
        return {
            "answer_id": answer_id,
            "direct_answer": "I don't know from the available evidence. No sufficiently relevant source chunk was found, so I will not infer an operational or compliance answer.",
            "confidence": 0.12,
            "citations": [],
            "related_assets": [],
            "related_documents": [],
            "suggested_next_actions": ["Upload the missing SOP, inspection record, work order, or checklist evidence.", "Ask a narrower question with an asset tag or document type."],
            "evidence_strength": "insufficient",
        }

    question_lower = question.lower()
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
        snippets = " ".join(item["text"][:180].replace("\n", " ") for item in evidence[:3])
        direct += snippets

    citations = _citations(answer_id, evidence)
    related_assets = asset_tags or sorted({_normalize_asset_tag(tag) for tag in ASSET_RE.findall(" ".join(item["text"] for item in evidence))})[:5]
    related_documents = sorted({item["filename"] for item in evidence[:5]})
    confidence = min(0.94, max(0.42, round(sum(item["score"] for item in evidence[:3]) / min(len(evidence), 3) + 0.45, 2)))

    return {
        "answer_id": answer_id,
        "direct_answer": direct,
        "confidence": confidence,
        "citations": citations,
        "related_assets": related_assets,
        "related_documents": related_documents,
        "suggested_next_actions": actions,
        "evidence_strength": "strong" if confidence > 0.72 else "moderate",
    }


def _first_asset_from_evidence(evidence: list[dict[str, Any]]) -> str | None:
    for item in evidence:
        found = ASSET_RE.findall(item["text"])
        if found:
            return _normalize_asset_tag(found[0])
    return None


def _asset_specific_evidence(evidence: list[dict[str, Any]], asset_tags: list[str]) -> list[dict[str, Any]]:
    variants = set()
    for tag in asset_tags:
        variants.add(tag.lower())
        variants.add(tag.replace("-", "").lower())

    filtered = []
    for item in evidence:
        source_text = f"{item.get('filename', '')} {item.get('text', '')}".lower()
        compact_source_text = source_text.replace("-", "")
        if any(variant in source_text or variant in compact_source_text for variant in variants):
            filtered.append(item)
    return filtered


def _normalize_asset_tag(tag: str) -> str:
    match = re.match(r"^(P|C|B|HX|V|EP)-?(\d{3})$", tag)
    if not match:
        return tag
    return f"{match.group(1)}-{match.group(2)}"
