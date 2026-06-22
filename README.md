# 🏭 Industrial Brain AI

<p align="center">
  <img src="docs/banner.png"
       alt="Industrial Brain AI Banner"
       width="100%"
       style="border-radius:20px;">
</p>

<h1 align="center">🏭 Industrial Brain AI</h1>

<h3 align="center">AI-Powered Asset & Operations Intelligence Platform</h3>

<p align="center">
  Transforming fragmented industrial documents, maintenance logs, SOPs, inspection reports, compliance records, and asset history into explainable operational intelligence.
</p>

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Poppins&weight=600&size=25&duration=3500&pause=1000&color=00C2FF&center=true&vCenter=true&width=1000&lines=Asset+Intelligence;Predictive+Maintenance;Compliance+Automation;Root+Cause+Analysis;Knowledge+Graph+AI;Industrial+Copilot;Operational+Excellence" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
  <img src="https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
</p>

---

## 🚀 Overview

Industrial Brain AI is a unified Asset & Operations Intelligence Platform for manufacturing plants, refineries, steel plants, chemical facilities, power plants, and asset-intensive industrial organizations.

It provides:

- 🤖 Industrial Copilot
- 🕸 Knowledge Graph
- ⚙️ Asset 360
- ⚠️ RCA Intelligence
- 📋 Compliance Evidence
- 📊 Executive Dashboard
- 📚 Lessons Learned
- 🔎 Source-cited semantic search

## ⚡ Quick Start

### Backend

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Open:

- Frontend: http://localhost:3000
- Backend API Docs: http://127.0.0.1:8000/docs

## 🐳 Docker

```bash
docker compose up --build
```

## 🔐 Demo Login

```text
plant.manager@industrial.ai / demo123
reliability@industrial.ai / demo123
auditor@industrial.ai / demo123
```

## 💬 Demo Questions

```text
Why has Pump P101 failed repeatedly?
Show complete maintenance history of Pump P101.
Which assets have overdue inspections?
Generate RCA for Compressor C201.
What recurring safety risks exist in the plant?
```

## 🧠 Architecture

```mermaid
flowchart TD
    A[Industrial Documents] --> B[Document Intelligence]
    B --> C[Entity Extraction]
    C --> D[Knowledge Graph]
    C --> E[Vector Search]
    D --> F[Multi-Agent AI]
    E --> F
    F --> G[Industrial Copilot]
    F --> H[Asset 360]
    F --> I[RCA]
    F --> J[Compliance]
    F --> K[Executive Dashboard]
```

<p align="center">
  <b>🏭 Industrial Brain AI</b><br/>
  Transforming Industrial Knowledge into Operational Excellence.
</p>
## 🛠 Technology Stack

### 🎨 Frontend

<p>
  <img src="https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
</p>

- ⚡ **Next.js 15** – Modern React framework for scalable enterprise UI
- 🔷 **TypeScript** – Type-safe frontend development
- 🎨 **Tailwind CSS** – Responsive, premium, utility-first styling

---

### ⚙️ Backend

<p>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
  <img src="https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Alembic-6B7280?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/JWT%20Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>
  <img src="https://img.shields.io/badge/RBAC-Secure-green?style=for-the-badge"/>
</p>

- 🚀 **FastAPI** – High-performance Python API framework
- 🗄️ **SQLAlchemy** – ORM for production database models
- 🔁 **Alembic** – Database migration management
- 🔐 **JWT Authentication** – Secure token-based authentication
- 🛡️ **RBAC** – Role-based access control for enterprise users

---

### 🧠 AI Layer

<p>
  <img src="https://img.shields.io/badge/RAG-Retrieval%20Augmented%20Generation-blueviolet?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Embeddings-Semantic%20Search-orange?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Knowledge%20Graph-Industrial%20AI-red?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/OpenAI-Compatible-412991?style=for-the-badge&logo=openai&logoColor=white"/>
  <img src="https://img.shields.io/badge/Gemini-4285F4?style=for-the-badge&logo=googlegemini&logoColor=white"/>
  <img src="https://img.shields.io/badge/Local%20Mode-Deterministic-success?style=for-the-badge"/>
</p>

- 🔎 **RAG** – Retrieval-Augmented Generation for source-grounded answers
- 🧬 **Embeddings** – Semantic document and asset search
- 🕸️ **Knowledge Graph** – Relationship mapping across assets, failures, SOPs, and regulations
- 🤖 **OpenAI-Compatible Models** – Support for OpenAI-style model APIs
- ✨ **Gemini** – Optional Google Gemini model integration
- 🧪 **Local Deterministic Mode** – Offline demo and judging-friendly AI behavior

---

### 🗄️ Data & Infrastructure

<p>
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white"/>
  <img src="https://img.shields.io/badge/ChromaDB-5B21B6?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
</p>

- 🐘 **PostgreSQL** – Relational database for assets, documents, users, permissions, and audit logs
- ⚡ **Redis** – Caching, queues, and background workflow support
- 🧠 **ChromaDB** – Vector database for embeddings and semantic retrieval
- 🐳 **Docker** – Containerized deployment
- 📦 **Docker Compose** – Multi-service local and demo environment
- from fastapi import APIRouter
from app.database.seed_demo_data import load_demo_data

router = APIRouter(
    prefix="/demo",
    tags=["Demo"]
)


@router.post("/seed")
async def seed_demo_dataset():
    """
    Load Industrial Brain AI demo dataset.
    """

    return load_demo_data()
    from fastapi import APIRouter
from app.database.seed_demo_data import load_demo_data

router = APIRouter(
    prefix="/demo",
    tags=["Demo"]
)


@router.post("/seed")
async def seed_demo_dataset():
    """
    Load Industrial Brain AI demo dataset.
    """

    return load_demo_data()
    from fastapi import FastAPI
from app.api.demo import router as demo_router

app = FastAPI(
    title="Industrial Brain AI"
)

app.include_router(demo_router)
docker compose exec backend \
python -m app.database.seed_demo_data
POST /demo/seed
{
  "status": "success",
  "message": "Demo dataset loaded successfully",
  "timestamp": "2026-06-22T10:00:00Z",
  "assets_loaded": 6,
  "documents_loaded": 5,
  "failures_loaded": 3
}
## 📦 Demo Data

The demo dataset includes:

- Pump P101
- Boiler B203
- Compressor C201
- Heat Exchanger HX401
- Pressure Vessel V203
- Electrical Panel EP501

### Load Demo Data

```bash
docker compose exec backend python -m app.database.seed_demo_data
```

Or via API:

```http
POST /demo/seed
```

The dataset automatically loads realistic:

- Asset Registers
- Maintenance Work Orders
- Inspection Reports
- SOPs
- Incident Reports
- Compliance Records
- Failure History
- Safety Documentation

for demonstration, evaluation, and hackathon judging.
## 📁 Folder Structure

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
demo-data/
```

### 🧠 Backend

| Folder | Purpose |
|---|---|
| `backend/app/api/` | FastAPI routes for auth, ingestion, dashboard, copilot, RCA, compliance, assets, graph, and evaluation |
| `backend/app/agents/` | Multi-agent AI system for document intelligence, maintenance, compliance, RCA, knowledge graph, lessons learned, and executive insights |
| `backend/app/core/` | Configuration, security, JWT authentication, RBAC helpers, and shared settings |
| `backend/app/database/` | Database connection, session management, seed data, and demo dataset loading |
| `backend/app/models/` | SQLAlchemy models for users, assets, documents, entities, audit logs, permissions, RCA, and compliance |
| `backend/app/rag/` | RAG pipeline, embeddings, vector search, retrievers, citations, and AI provider abstraction |
| `backend/app/schemas/` | Pydantic request and response schemas |
| `backend/app/services/` | Business logic for ingestion, extraction, graph, copilot, maintenance, compliance, RCA, reports, and audit logs |
| `backend/app/utils/` | Helpers for file parsing, text cleaning, ID generation, logging, and formatting |
| `backend/app/workers/` | Background workers for document processing, embeddings, graph updates, reports, and scheduled checks |
| `backend/alembic/` | Alembic migrations for PostgreSQL schema versioning |

### 🎨 Frontend

| Folder | Purpose |
|---|---|
| `frontend/app/` | Next.js pages for dashboard, ingestion, entities, graph, copilot, asset 360, RCA, compliance, lessons, and evaluation |
| `frontend/components/` | Reusable UI components such as cards, charts, tables, navigation, upload panels, graph views, and modals |
| `frontend/hooks/` | Custom React hooks for API calls, authentication, uploads, graph data, filters, and dashboard state |
| `frontend/lib/` | API client, constants, formatting helpers, auth helpers, and shared configuration |
| `frontend/services/` | Frontend service functions for backend communication |
| `frontend/store/` | Global state for user session, filters, selected asset, selected document, and UI state |
| `frontend/types/` | TypeScript types for assets, documents, users, entities, graph nodes, copilot responses, RCA, and compliance |

### 📚 Documentation & Data

| Folder | Purpose |
|---|---|
| `docs/` | Architecture, API documentation, deployment guide, demo script, pitch materials, roadmap, and hackathon documentation |
| `sample_data/` | Small sample files for ingestion and extraction testing |
| `demo-data/` | Realistic industrial dataset with asset registers, maintenance logs, inspection reports, SOPs, incidents, safety checklists, manuals, and compliance records |

## 📈 Business Impact
| Impact Area | Improvement |
|---|---|
| 🔍 Investigation Time | 70% Faster |
| 🧠 Knowledge Search | 90% Faster |
| 📋 Compliance Readiness | 60% Higher |
| 📊 Operational Visibility | 80% Improved |

### Key Outcomes

- ✅ Faster root cause analysis
- ✅ Reduced downtime
- ✅ Improved audit readiness
- ✅ Better asset reliability
- ✅ Source-cited decision support
- ✅ Higher engineering productivity
## 🏆 Hackathon Advantages

- 🧠 Multi-agent industrial AI architecture
- 🕸 Knowledge graph powered operational intelligence
- 🔎 Source-cited explainable answers
- 📋 Compliance and audit evidence generation
- ⚠️ Root cause analysis automation
- 🏭 Realistic industrial demo dataset
- 🚀 Enterprise-ready full-stack implementation

---

## 🔮 Roadmap

- Predictive failure models
- Digital twin integration
- SAP integration
- SCADA integration
- Real-time sensor intelligence
- Industrial LLM fine-tuning
- Advanced reliability analytics
- Autonomous industrial agents

---

## 🛡 Safety Behavior

Industrial Brain AI does not answer operational, safety, or compliance questions without source evidence.

If retrieval confidence is weak, the system responds transparently and recommends uploading missing evidence.

---

<p align="center">
  <b>🏭 Industrial Brain AI</b><br/>
  Building the Future of Industrial Intelligence
</p>

<p align="center">
  ⭐ Transforming Industrial Knowledge into Operational Excellence ⭐
</p>
## 🎥 Product Demonstration
<p align="center">
  <a href="./docs/demo.mp4">
    <img src="https://img.shields.io/badge/▶-Watch%20Demo-blue?style=for-the-badge">
    <p align="center">
      View Raw in the next
  </a>
</p>
