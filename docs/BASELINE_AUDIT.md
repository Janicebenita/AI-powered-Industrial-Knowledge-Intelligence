# Baseline audit — 2026-09-13

Baseline: `40584d47904884a4b4349bd4d2de0e00ef0625a0`. Branch: `feat/omi-qdrant-lyzr-integration`.

## Actual architecture

Render uses the root Dockerfile: Node 22, Next.js 15 App Router, React 18, TypeScript, Tailwind. FastAPI is NOT launched by that image. Next.js owns Copilot, document upload/list/delete and RCA report routes. Other API paths rewrite to localhost:8000. Most dashboard, asset, graph, maintenance, compliance, lessons and report views use static demo fixtures. Evidence metrics and demo seeding depend on FastAPI.

Next.js retrieval scans packaged/uploaded text with keyword scoring and template answers. Uploads use `.uploads/documents/index.json` and original files. PDF text extraction uses pdf-parse. Docker generates `.copilot-index.json` from 16 demo documents. FastAPI uses sqlite3 with normalized token-frequency vectors stored as JSON, not ChromaDB or FAISS. Chroma is listed in Compose but neither active retriever calls it. SQLAlchemy/Alembic enterprise models exist alongside the active SQLite schema.

FastAPI has demo JWT login and role permissions. Its current_user returns a plant-manager demo identity when no token is supplied. Many API handlers do not require authentication. Next.js routes have no authentication. No tenant filtering exists in the active retrievers. Audit tables exist in Python; Next.js upload/Copilot do not persist execution audits. Settings are Pydantic BaseModel defaults, not environment-loaded settings.

## Verification before edits

- pnpm install --frozen-lockfile: PASS (212 packages).
- pnpm exec tsc --noEmit: PASS.
- pnpm build: PASS, 22 pages, Next 15.5.19 from lockfile.
- node scripts/test-evidence.cjs: initial packaged failure (missing generated index). After Docker's indexing step, PASS empty/upload/packaged/corrupt. Index generation: 16 documents.
- No lint script, ESLint configuration, backend unit suite or browser test suite supplied.
- Local Next production server started on port 3000. All 13 navigation routes reached by browser; Copilot needed a subsequent hydrated-state inspection. Other views rendered expected headings. No console errors captured during navigation. This is route smoke coverage, not complete functional regression.
- Python 3.10 virtual environment installation and FastAPI startup initiated separately; results recorded in TEST_REPORT.md.

## Pre-existing issues

- Unsupported README platform integration claims.
- Static AI online/health/confidence/document totals; fabricated page numbers in legacy chunking and synthetic citations in demo views.
- Production evidence metrics/demo seeding depend on absent FastAPI.
- Uploads ephemeral on Render free plan; no durable execution/approval storage.
- Missing backend auth enforcement and tenant isolation; hardcoded demo credentials/JWT default.
- No upload size limit in Next route; fixed embedding/entity/relationship estimates.

## Implementation plan

1. Extend the deployed Node server with provider contracts, strict configuration and runtime health.
2. Add authenticated, scoped integration routes and durable single-instance state, approvals and audit.
3. Implement supported Omi conversation reads and reviewed provenance-preserving ingestion.
4. Add Qdrant dense-vector adapter with explicit embedding dimensions, filters and non-destructive migration/evaluation gate.
5. Execute configured Lyzr workflow with scoped retrieval capability and validated outputs; expose only operational trace.
6. Wire Copilot, upload, integrations and admin controls; retain and label deterministic demo mode.
7. Verify contracts, failures, authorization, citations, regression, builds and browser flows. Document unverified external checks honestly.
8. Prepare deployment and rollback. Do not push, provision or deploy before explicit user approval.
