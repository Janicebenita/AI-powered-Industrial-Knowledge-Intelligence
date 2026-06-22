# Architecture

```mermaid
flowchart LR
  U["Plant users: maintenance, engineering, quality, safety, audit"] --> UI["React field-friendly web app"]
  UI --> API["FastAPI API gateway"]
  API --> ING["ingestion_service"]
  API --> COP["copilot_service"]
  API --> MI["maintenance_intelligence_service"]
  API --> CI["compliance_service"]
  ING --> DOC["Original document store"]
  ING --> TXT["Text extraction and OCR hook"]
  TXT --> CHK["Intelligent chunking"]
  CHK --> EMB["embedding_service"]
  CHK --> EXT["extraction_service"]
  EXT --> ENT["Entities JSON"]
  EXT --> GRA["graph_service"]
  EMB --> VEC["SQLite embeddings JSON now, pgvector later"]
  GRA --> KG["Knowledge graph nodes and relationships"]
  COP --> RET["retrieval_service"]
  RET --> VEC
  RET --> KG
  COP --> CITE["Citation builder and no-evidence guardrail"]
  MI --> RCA["RCA drafts and PM recommendations"]
  CI --> GAP["Compliance gap and audit package"]
  API --> DB["SQLite prototype database"]
  DB --> AUD["Audit logs and document permissions"]
```

## Service Responsibilities

- `ingestion_service`: stores original files, extracts text, chunks content, embeds chunks, extracts entities, creates graph relationships, and records audit events.
- `extraction_service`: regex and dictionary-based industrial entity extraction. Built to be replaced by a structured LLM extractor.
- `embedding_service`: deterministic token-vector embedding for offline demo retrieval.
- `retrieval_service`: similarity search across chunks with score thresholds.
- `graph_service`: creates graph payloads for UI and asset neighborhoods.
- `copilot_service`: answer synthesis with citations and refusal when evidence is insufficient.
- `maintenance_service`: Asset 360, repeated failure detection, RCA draft reports, and PM recommendations.
- `compliance_service`: requirement-to-evidence mapping, gap detection, and audit package summaries.

## Data Model

Core tables:

- `documents`
- `chunks`
- `entities`
- `entity_relationships`
- `assets`
- `work_orders`
- `inspections`
- `failures`
- `regulations`
- `procedures`
- `chat_sessions`
- `citations`
- `audit_logs`

## Security Model

Prototype security fields are included in the data model:

- `documents.owner_role`
- `documents.permission_level`
- `audit_logs.actor`
- `audit_logs.action`
- `audit_logs.target`

Production hardening should add SSO, row-level security, signed document URLs, encryption at rest, and scoped retrieval filters.
