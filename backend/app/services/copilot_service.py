from __future__ import annotations

import re
import uuid
from datetime import date
from typing import Any

from app.database import connect, query
from app.services.maintenance_service import asset_360, rca_for_asset
from app.services.retrieval_service import evidence_is_sufficient, retrieve, signal_terms

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
    question_lower = question.lower()
    asset_tags = sorted({_normalize_asset_tag(tag) for tag in ASSET_RE.findall(question)})

    if _asks_overdue_inspections(question_lower):
        return _overdue_inspection_answer(answer_id)

    evidence = retrieve(question, limit=24 if asset_tags else 6)
    if asset_tags:
        evidence = _asset_specific_evidence(evidence, asset_tags)
    refusal = _refusal_if_weak(question, evidence, asset_tags)
    if refusal:
        refusal["answer_id"] = answer_id
        return refusal

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



def _overdue_inspection_answer(answer_id: str) -> dict[str, Any]:
    today = date.today().isoformat()
    rows = query(
        """
        SELECT i.inspection_id, i.asset_tag, i.finding, i.severity, i.next_due, i.document_id,
               d.filename, d.doc_type
        FROM inspections i
        LEFT JOIN documents d ON d.id = i.document_id
        WHERE i.next_due <= ?
           OR lower(i.finding) LIKE '%overdue%'
           OR lower(i.finding) LIKE '%missing%'
           OR lower(i.finding) LIKE '%required%'
        ORDER BY i.next_due ASC, i.severity DESC
        LIMIT 8
        """,
        (today,),
    )
    if not rows:
        refusal = _insufficient_response("The inspection register has no overdue, due, missing, or required inspection evidence.")
        refusal["answer_id"] = answer_id
        return refusal

    citations: list[dict[str, Any]] = []
    cited_documents: set[str] = set()
    assets: list[str] = []
    findings: list[str] = []
    for row in rows:
        asset = _normalize_asset_tag(row["asset_tag"])
        assets.append(asset)
        status = "overdue" if row["next_due"] and row["next_due"] < today else "due now"
        if "missing" in row["finding"].lower():
            status = "missing evidence"
        findings.append(f"{asset}: {status}; {row['severity']} severity; {row['finding']} (next due {row['next_due']}).")
        filename = row["filename"] or "Inspection Register"
        cited_documents.add(filename)
        citations.append(
            {
                "document_id": row["document_id"] or 0,
                "chunk_id": 0,
                "filename": filename,
                "page_number": 1,
                "section": row["inspection_id"],
                "quote": f"{row['inspection_id']} | Asset {asset} | Finding: {row['finding']} | Next due: {row['next_due']} | Severity: {row['severity']}",
                "confidence": 0.91 if row["document_id"] else 0.84,
            }
        )

    direct = "Based on cited inspection-register evidence, the assets with overdue, due-now, or missing inspection evidence are: " + " ".join(findings)
    return {
        "answer_id": answer_id,
        "direct_answer": direct,
        "confidence": 0.84,
        "citations": citations[:4],
        "related_assets": sorted(set(assets)),
        "related_documents": sorted(cited_documents),
        "suggested_next_actions": [
            "Attach the missing inspection certificates or pressure-test evidence to the asset record.",
            "Assign an inspection owner and due date for each high-severity asset.",
            "Rerun compliance mapping after evidence is uploaded.",
        ],
        "evidence_strength": "strong" if any(c["filename"] != "Inspection Register" for c in citations) else "moderate",
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

def _asks_overdue_inspections(question_lower: str) -> bool:
    return ("overdue" in question_lower or "due" in question_lower or "expired" in question_lower or "missing" in question_lower) and ("inspection" in question_lower or "inspections" in question_lower or "assets" in question_lower)


def _overdue_inspection_evidence(evidence: list[dict[str, Any]]) -> list[dict[str, Any]]:
    filtered = []
    for item in evidence:
        text = f"{item.get('filename', '')} {item.get('section', '')} {item.get('text', '')}".lower()
        has_inspection_context = any(term in text for term in ["inspection", "checklist", "evidence", "certificate", "pressure test"])
        has_gap_context = any(term in text for term in ["overdue", "missing", "partial", "due", "gap", "not covered"])
        has_asset = bool(ASSET_RE.search(text))
        if has_inspection_context and has_gap_context and has_asset:
            filtered.append(item)
    return filtered


def _refusal_if_weak(question: str, evidence: list[dict[str, Any]], asset_tags: list[str]) -> dict[str, Any] | None:
    if not evidence_is_sufficient(evidence):
        return _insufficient_response("No sufficiently relevant source chunk was found.")

    q_terms = signal_terms(question)
    if asset_tags and not evidence:
        return _insufficient_response("No citation mentions the requested asset tag.")

    if q_terms:
        top_matches = set()
        for item in evidence[:4]:
            top_matches.update(item.get("matched_terms", []))
        required = {term for term in q_terms if term not in {"asset", "assets", "plant", "show", "generate"}}
        matched_required = required & top_matches
        if len(required) >= 3 and len(matched_required) < 2:
            return _insufficient_response("The retrieved citations do not match enough of the question-specific terms.")
        if "overdue" in required and "overdue" not in matched_required and "missing" not in top_matches and "due" not in top_matches:
            return _insufficient_response("No citation supports an overdue or missing inspection finding.")

    return None


def _insufficient_response(reason: str) -> dict[str, Any]:
    return {
        "answer_id": "",
        "direct_answer": f"I don't know from the available cited evidence. {reason} I will not infer an operational, safety, quality, or compliance answer without matching source documents.",
        "confidence": 0.12,
        "citations": [],
        "related_assets": [],
        "related_documents": [],
        "suggested_next_actions": ["Upload or select the exact SOP, inspection record, NCR, QA/QC manual section, tender clause, or work order evidence.", "Ask a narrower question with an asset tag, document name, or compliance clause."],
        "evidence_strength": "insufficient",
    }

