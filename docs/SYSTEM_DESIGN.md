# Industrial Brain AI System Design

## Product Goal

Industrial Brain AI converts fragmented plant knowledge into cited, graph-connected operational intelligence for plant managers, maintenance engineers, reliability engineers, operators, safety officers, quality managers, compliance auditors, and executives.

## Architecture Principles

- Evidence first: no operational, safety, or compliance answer without citations.
- Modular services: ingestion, extraction, embedding, retrieval, graph, copilot, maintenance, compliance, RCA, and audit logging.
- Provider abstraction: local deterministic demo mode plus OpenAI/Gemini extension points.
- Enterprise-ready boundaries: JWT auth, RBAC, document permissions, audit logs, migrations, Docker services.
- Hackathon reliability: seeded data and offline embeddings keep the demo working even without API keys.

## Request Flow

1. User uploads file.
2. Backend stores original document.
3. Text extraction or OCR hook runs.
4. Document type is classified.
5. Chunks are generated with source metadata.
6. Embeddings are created.
7. Entities and relationships are extracted.
8. Knowledge graph updates.
9. Copilot retrieves evidence.
10. Answer is generated only when citations exist.

## Multi-Agent System

- Document Intelligence Agent
- Knowledge Graph Agent
- Maintenance Intelligence Agent
- Compliance Agent
- RCA Agent
- Lessons Learned Agent
- Executive Insights Agent

Each agent returns findings, confidence, and citations when available.
