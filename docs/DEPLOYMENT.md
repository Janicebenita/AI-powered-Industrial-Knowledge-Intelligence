# Render deployment preparation — NOT deployed

Target remains `https://intelligence-brain.onrender.com/`. Repository `render.yaml` describes one Docker web service named `intelligence-brain`, free plan, auto-deploy enabled and `/` health path. Actual dashboard settings, deployment ID, disk and secrets have not been inspected through an authenticated Render account. No external configuration has been changed.

## Build and start

Root Dockerfile: Node 22 Debian with a Python FastEmbed environment and prebuilt public model cache, frozen pnpm lockfile, package demo evidence, Next production build, `npm run start`. Next honors Render's `PORT`. `ENVIRONMENT=production` enables startup variable validation. The image will intentionally refuse to start without mandatory production configuration. Docker engine was unavailable locally; image verification remains required.

For a local demo use development environment and explicit disabled/legacy/local modes. For integration verification set the environment values before starting Next; Next supports ignored `.env.local` in `frontend`. CLI migration/test tools use inherited process environment.

## Required configuration

See root `.env.example` for every variable name; templates contain no real credentials.

Leave `NEXT_PUBLIC_API_URL` unset for the Node production deployment. Setting it can send existing browser requests directly to the legacy backend. That backend is for local demo use until its authentication and persistence are hardened.

- Omi developer API key, API base origin, OMI_ORGANIZATION_ID, OMI_PLANT_ID and descriptive names. These are application assignments. Imports remain manual.
- QDRANT_URL, QDRANT_API_KEY, versioned QDRANT_COLLECTION.
- EMBEDDING_PROVIDER=fastembed, EMBEDDING_MODEL=BAAI/bge-small-en-v1.5, EMBEDDING_DIMENSION=384; see FASTEMBED.md. OpenAI-compatible embedding API remains optional.
- LYZR_API_KEY, LYZR_API_BASE_URL, LYZR_AGENT_ID, LYZR_API_MODE=agent for direct mode. LYZR_WORKFLOW_ID is optional; required only for native workflow mode described in LYZR_WORKFLOW.md.
- VOICE_PROVIDER=omi, VECTOR_PROVIDER=qdrant, AGENT_PROVIDER=lyzr, ALLOW_DEMO_FALLBACK=false.
- APP_BASE_URL for the actual staging/production callback origin.
- JWT_SECRET (random, >=32 characters), INTEGRATION_USERS_FILE (private account file), INTEGRATION_DATA_DIR (persistent private directory).
- QDRANT_MIGRATION_VERIFIED=true **only after evaluation and human relevance review**. Do not set this to bypass a failing test.

## Accounts and persistence

Use a private Render secret file for account records. Each record contains sub, email, role, tenant, plant, salt and scrypt password_hash; no plaintext passwords. `scripts/create-local-account.cjs` creates a local file from ACCOUNT_EMAIL, ACCOUNT_PASSWORD, ACCOUNT_TENANT, ACCOUNT_PLANT, ACCOUNT_ROLE and INTEGRATION_USERS_FILE. Supply secrets through a secure environment, never command-line arguments or shell history. Supported roles are in auth.ts.

The free ephemeral filesystem is insufficient for retained approvals, audits and uploads. Obtain approval for a persistent disk on the existing service or implement/verify a shared database/object store before production. For one instance, proposed directory `/var/data/industrial-brain`; retain legacy uploads separately with COPILOT_UPLOAD_DIR. Do not create a duplicate production service. Never scale this JSON-backed adapter to multiple instances.

## Migration and rollout

1. Identify and record the last healthy Render deploy ID and commit; back up persistent data and configuration securely. Confirm restore access before changing anything.
2. Run local lint, typecheck, all tests, production build, Docker build and route/browser regression.
3. Obtain explicit approval before pushing the feature branch. Run CI on that branch.
4. Obtain approval for any needed external collection/workflow/staging resource. Initialize only the new versioned Qdrant collection (explicit API action, never startup).
5. Export legacy text with filename/provenance. Assign tenant/plant explicitly. Preserve each source's `permission_scope`; when absent, explicitly set `MIGRATION_PERMISSION_SCOPE` after reviewing access requirements. The utility refuses missing permissions or conflicting ownership. Run migration dry run, then approved apply; repeat to verify checkpoints. Never delete legacy sources.
6. Run live retrieval evaluation and inspect each cited passage for all judge questions. Verify embedding dimensions, duplicates, permission filters and failure behavior. Only then approve Qdrant activation.
7. Deploy to an existing approved staging target if available; verify the complete Omi → review → Qdrant → Lyzr → citations → human review → audit path. If no staging exists, ask before provisioning one.
8. Present exact code/config diff and test report. Ask separately for final approval before merging main, changing Render production configuration or deploying production.
9. After approval, update health path to `/api/readiness`, apply approved configuration, deploy and monitor readiness and the application itself. Do not consider a successful build sufficient.
10. Run the complete post-deployment checklist and use ROLLBACK.md immediately if critical verification fails.

`/api/health` is diagnostic. `/api/readiness` returns 503 for unavailable required integrations with fallback disabled or invalid configuration. Individual health endpoints expose probe states without secrets. Public provider reads validate connectivity, not successful agent execution. Requests use bounded timeouts and safe retries; Lyzr execution submits once.

## Unresolved production prerequisites

Correctly resolving Qdrant endpoint, specialist orchestration verification, real collection migration/evaluation, durable storage approval, Render deployment identity/backup, container test, staging execution and final approvals. Existing Python prototype auth/RBAC must be hardened before exposing it as a production backend. Do not route public production traffic to it under the assumption the new Node integration auth protects it.
