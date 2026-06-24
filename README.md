# Industrial Brain AI

Unified Asset & Operations Intelligence Platform for manufacturing plants, refineries, steel plants, chemical facilities, power plants, and other asset-intensive industrial organizations.

Industrial Brain AI converts fragmented industrial knowledge from documents, drawings, inspection reports, maintenance logs, SOPs, safety manuals, compliance records, emails, spreadsheets, and equipment history into a searchable, explainable, AI-powered operational intelligence system.

## Included

- FastAPI backend with modular services for ingestion, extraction, embeddings, retrieval, graph, copilot, maintenance, compliance, RCA, reports, and audit logging.
- Multi-agent AI system: Document Intelligence, Knowledge Graph, Maintenance, Compliance, RCA, Lessons Learned, and Executive Insights agents.
- Next.js 15 TypeScript frontend with premium landing page and enterprise platform UI.
- Pages: Executive Dashboard, Ingestion Center, Entity Extraction, Knowledge Graph, Copilot, Asset 360, RCA, Compliance, Lessons Learned, and Evaluation.
- SQLAlchemy model layer and Alembic migration scaffold for production PostgreSQL.
- JWT authentication, RBAC helpers, document permissions fields, and audit logs.
- AI provider abstraction for local deterministic mode, OpenAI-compatible models, and Gemini.
- Docker Compose for frontend, backend, Postgres, Redis, and ChromaDB.
- Seeded industrial dataset and hackathon materials.

## Quick Start

Backend:

```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend:

```powershell
cd frontend
pnpm install
pnpm dev
```

Open:

- Landing and platform: `http://localhost:3000`
- API docs: `http://127.0.0.1:8000/docs`

## Demo Login

The app allows demo access without a token for local judging. JWT login endpoint:

- `plant.manager@industrial.ai` / `demo123`
- `reliability@industrial.ai` / `demo123`
- `auditor@industrial.ai` / `demo123`

## Demo Flow

1. Open the landing page and click Launch Platform.
2. Show Executive Dashboard KPIs: documents, assets, compliance score, citation coverage, repeated failures, and high-risk assets.
3. Open Ingestion and upload a maintenance log, SOP, inspection report, CSV, Excel, or PDF.
4. Open Entities to show structured extraction with confidence scores and sources.
5. Open Graph to show assets, documents, failures, procedures, regulations, findings, and relationships.
6. Open Copilot and ask: `Why has Pump P101 failed repeatedly?`
7. Show source-cited answer, confidence, related assets, related documents, and next actions.
8. Open Asset 360 for `P-101`.
9. Open RCA and export the PDF report.
10. Open Compliance and generate the audit evidence package.
11. Open Lessons for multi-agent insights.
12. Open Evaluation for precision, recall, retrieval quality, citation coverage, compliance gaps, and repeated patterns.

## Demo Data Loading

The `demo-data/` folder contains realistic source files for:

- Pump P101
- Boiler B203
- Compressor C201
- Heat Exchanger HX401
- Pressure Vessel V203
- Electrical Panel EP501

Files include asset register, maintenance work orders, inspection report, SOP, incident report, engineering notes, OISD checklist, LOTO procedure, quality issue, near-miss report, Factory Act requirements, and FlowServe P101 manual.

Manual upload:

Upload files from `demo-data/` through the Document Ingestion Center.

One-click seed:

```powershell
docker compose exec backend python -m app.database.seed_demo_data
```

Or call:

```http
POST /demo/seed
```

In the UI:

Admin Console → Load Demo Dataset

Demo questions:

- Why has Pump P101 failed repeatedly?
- Show complete maintenance history of Pump P101.
- Which SOP applies before maintenance on Pump P101?
- Which assets have overdue inspections?
- Generate RCA for Compressor C201.
- What recurring safety risks exist in the plant?

## Safety Behavior

Industrial Brain AI never answers operational, safety, or compliance questions without source evidence. If retrieval confidence is weak, it says it does not know and recommends uploading missing evidence.

## Folder Structure

```text
backend/
  app/
    api/
    agents/
    core/
    database/
    models/
    rag/
    schemas/
    services/
    utils/
    workers/
  alembic/
frontend/
  app/
  components/
  hooks/
  lib/
  services/
  store/
  types/
docs/
sample_data/
```

## Docker

```powershell
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Postgres: `localhost:5432`
- Redis: `localhost:6379`
- ChromaDB: `http://localhost:8001`

## Hackathon Materials

- Architecture: `docs/ARCHITECTURE.md`
- System design: `docs/SYSTEM_DESIGN.md`
- Database diagram: `docs/DATABASE_DIAGRAM.md`
- API docs: `docs/API.md`
- Deployment guide: `docs/DEPLOYMENT_GUIDE.md`
- Demo script: `docs/DEMO_SCRIPT.md`
- Pitch deck content: `docs/hackathon/PITCH_DECK_CONTENT.md`
- ROI: `docs/hackathon/ROI_CALCULATION.md`
- Judging alignment: `docs/hackathon/JUDGING_ALIGNMENT.md`
- Innovation highlights: `docs/hackathon/INNOVATION_HIGHLIGHTS.md`
- Roadmap: `docs/hackathon/RISK_AND_ROADMAP.md`
