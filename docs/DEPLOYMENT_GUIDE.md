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
