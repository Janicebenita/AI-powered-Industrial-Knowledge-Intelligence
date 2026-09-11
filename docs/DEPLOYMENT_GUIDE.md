# Deployment Guide

## Local Development

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

Open `http://localhost:3000`.

## Docker

```powershell
docker compose up --build
```

Services:

- frontend: `http://localhost:3000`
- backend: `http://localhost:8000`
- postgres: `localhost:5432`
- redis: `localhost:6379`
- chromadb: `http://localhost:8001`

## Production Notes

- Replace demo JWT secret.
- Use managed Postgres with pgvector.
- Use managed Redis for background jobs and caching.
- Store documents in S3/Azure Blob/GCS with signed URLs.
- Enforce tenant isolation and document-level retrieval filters.
- Add SSO/SAML/OIDC.
- Run OCR as a queue-backed worker.
- Use Neo4j or managed graph database for large-scale graph traversal.

## Render frontend deployment

The root Dockerfile runs Next.js only. Its local copilot and upload routes use
a filesystem evidence index, not the Python RAG service. The Docker build copies
`demo-data` and extracts its text/PDF evidence before building Next.js.
A missing or unreadable evidence pack now fails the image build rather than
silently shipping an empty copilot.

After deploying, check `GET /api/copilot/ask`: `status` must be `ready` and
`documents_indexed` must be greater than zero. Ask a question supported by a
packaged record, then upload a small TXT file and ask about its exact contents.
Bundled demo evidence and user uploads are separate; an empty uploaded library
does not mean bundled evidence is missing.

PDF extraction uses the installed Node pdf-parse dependency; Python is not
required by these routes. Scanned PDFs require OCR first. Unsupported file
formats and empty extraction return explicit errors instead of indexing filenames
as evidence. Existing filename-only uploads must be uploaded again.

Uploads default to `/app/frontend/.uploads/documents` in this container.
Render's free filesystem is ephemeral: uploads can disappear on restart or
redeploy. To retain uploads on a paid service, attach a persistent disk at
`/var/data` and set `COPILOT_UPLOAD_DIR=/var/data/documents`. Both routes use
that same setting. Merely setting the variable does not create a persistent disk.
For multiple instances, replace the local JSON index with shared durable storage.
No paid plan or disk is provisioned by this change.

`COPILOT_DEMO_DATA_DIR` optionally overrides the demo evidence directory.
Local development can use TXT/CSV records without prebuilding; run
`node scripts/index-demo-evidence.mjs` from `frontend` to include PDF records.
The current answer generator remains template-based, with keyword retrieval;
these fixes do not turn it into the Python RAG backend or an LLM integration.

