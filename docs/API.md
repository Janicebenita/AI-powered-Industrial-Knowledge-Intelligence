# API Documentation

Base URL: `http://127.0.0.1:8000`

## Health

`GET /api/health`

Returns backend status, database path, and seeded document count.

## Documents

`GET /api/documents`

Lists indexed documents.

`POST /api/documents/upload`

Multipart fields:

- `file`: PDF, TXT, MD, LOG, CSV, XLS, or XLSX.
- `owner_role`: role string, default `operations`.

Returns document id, type, chunks, and extracted entities.

`GET /api/documents/{document_id}/download`

Downloads the original stored file.

## Entities

`GET /api/entities`

Returns structured industrial entities:

- Asset
- WorkOrder
- FailureMode
- MaintenanceAction
- InspectionFinding
- Regulation
- Procedure
- SparePart
- Location
- AlarmCode
- PersonnelRole
- SafetyHazard
- QualityIssue

## Knowledge Graph

`GET /api/graph`

Returns:

```json
{
  "nodes": [],
  "edges": []
}
```

`GET /api/graph/{asset_tag}`

Returns the graph neighborhood for an asset.

## Copilot

`POST /api/copilot/ask`

Request:

```json
{
  "question": "Why has Pump P-101 failed repeatedly?",
  "user_role": "maintenance"
}
```

Response:

```json
{
  "direct_answer": "...",
  "confidence": 0.84,
  "citations": [],
  "related_assets": [],
  "related_documents": [],
  "suggested_next_actions": [],
  "evidence_strength": "strong"
}
```

If evidence is weak, the copilot says it does not know and returns no unsupported operational advice.

## Assets and Maintenance

`GET /api/assets`

Lists assets by risk score.

`GET /api/assets/{asset_tag}`

Returns Asset 360:

- asset metadata
- failures
- work orders
- inspections
- documents
- failure mode counts
- risk drivers

`GET /api/maintenance`

Returns high-risk assets, repeated failure patterns, and incomplete maintenance history.

`GET /api/rca/{asset_tag}`

Returns an RCA draft report.

## Compliance

`GET /api/compliance`

Returns covered requirements, gaps, missing documents, and mapped evidence.

`GET /api/compliance/evidence-package`

Returns an audit evidence package summary.

## Evaluation

`GET /api/evaluation`

Returns:

- documents processed
- entity extraction precision estimate
- entity extraction recall estimate
- chunk retrieval quality
- citation coverage
- unanswered questions due to insufficient evidence
- compliance gaps found
- repeated failure patterns detected
