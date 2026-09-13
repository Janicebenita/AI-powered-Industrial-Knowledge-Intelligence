# Industrial Brain AI

Industrial knowledge application for documents, Copilot, knowledge graphs, Asset 360, maintenance, RCA, compliance, lessons, reports and evidence metrics.

**Release status: BLOCKED for production acceptance.** Omi, Qdrant and Lyzr adapters and governance controls are implemented locally. Omi authenticated reads, direct Lyzr agent inference and local FastEmbed inference have passed probes. Qdrant DNS, migration evaluation, specialist orchestration and Render deployment remain blocked. See [test report](docs/TEST_REPORT.md) and [baseline audit](docs/BASELINE_AUDIT.md). Do not treat offline tests or the existing public URL as proof of these integrations.

## Actual architecture

The Render Docker image runs Next.js 15 with server-side TypeScript API handlers. The separate FastAPI application retains its original prototype/demo APIs. Most existing dashboard and asset views are static demo data and are labelled accordingly.

The integration path is Omi conversation retrieval → pending observation → authorized review → FastEmbed or embedding API → versioned Qdrant collection → scoped Qdrant retrieval → Lyzr managerial agent (or optional native specialist workflow) → citation validation → human evidence review → audit trail. See [architecture](docs/INTEGRATION_ARCHITECTURE.md).

- **Omi:** supported developer conversation/transcript reads and native action items; provenance and duplicate prevention. No microphone or personal-memory workaround.
- **Qdrant:** dense Cosine indexing/search, metadata filters, authorized deletion and versioned migration. It becomes primary only after real retrieval evaluation and review.
- **Lyzr:** `LYZR_API_MODE=agent` invokes the existing Agent ID through `/v3/inference/chat/`; workflow ID is optional and never replaced with a session ID. Optional native workflows retain SuperFlow/v3 support. Direct mode does not claim six-agent orchestration; [configuration contract](docs/LYZR_WORKFLOW.md).
- **Legacy fallback:** existing Next keyword retrieval and Python SQLite token vectors remain. ChromaDB is only present in the legacy Compose configuration; no working Chroma/FAISS retrieval was found in the baseline.

## Local demo

Use Node 22. From `frontend`:

```sh
pnpm install --frozen-lockfile
pnpm index:demo
pnpm build
pnpm start
```

For deterministic demo mode set ENVIRONMENT=development, VOICE_PROVIDER=disabled, VECTOR_PROVIDER=legacy, AGENT_PROVIDER=local. Open http://localhost:3000. Demo Copilot returns source passages, not calibrated confidence or confirmed causal conclusions. External providers remain unavailable/unverified without successful runtime checks.

The optional original backend starts separately:

```sh
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Its original development logins remain plant.manager@industrial.ai, reliability@industrial.ai and auditor@industrial.ai with password demo123. These are **demo credentials**. The original Python service is not a production-secured multi-tenant backend; see [security limitations](docs/SECURITY.md). The mobile Expo application remains in `mobile`; see its README.

## Integration setup

Use `.env.example` as the variable-name template. Keep actual credentials in an ignored `frontend/.env.local` or secret manager, never source or screenshots. Configure Omi account tenant/plant binding, Qdrant URL/key/collection, FastEmbed or an embedding API/model/dimension, Lyzr API key/agent ID (or workflow), APP_BASE_URL for workflow callbacks, private account file and persistent integration storage. Production requires explicit provider modes and startup validation.

Set VOICE_PROVIDER=omi, VECTOR_PROVIDER=qdrant, AGENT_PROVIDER=lyzr and ALLOW_DEMO_FALLBACK=false for the live path. Missing services fail explicitly. Setting environment variables alone never marks a provider healthy.

Create an approved versioned collection through the authenticated initialization endpoint only after resource approval; it is never created on startup. Migrate without deleting old sources:

```sh
node scripts/migrate-evidence.cjs ../demo-data/.copilot-index.json
# After approving the target and scope:
node scripts/migrate-evidence.cjs ../demo-data/.copilot-index.json --apply
node scripts/evaluate-retrieval.cjs ../demo-data/.copilot-index.json
```

These CLI tools require inherited MIGRATION_TENANT, MIGRATION_PLANT, explicit source permission scope and provider configuration. Dry run is the default. Checkpoints are retained under INTEGRATION_DATA_DIR. The retrieval evaluation is a topic-recall smoke test; human source relevance and complete-history review remain required before setting QDRANT_MIGRATION_VERIFIED=true.

## Health and tests

- `/api/health`: diagnostic provider report.
- `/api/health/omi`, `/api/health/qdrant`, `/api/health/lyzr`: runtime read probes with explicit states.
- `/api/readiness`: fails when required configuration/providers are unavailable and fallback is disabled.
- Copilot/Admin: integration sign-in, Omi import/preview/review, status, execution trace and evidence-review controls.

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Tests include legacy upload/retrieval regression, provider HTTP contracts, RBAC, duplicate import, citation rules, failure/retry behavior, a mocked full workflow, component rendering and axe semantics. Mocked tests are not live integration verification. See [test report](docs/TEST_REPORT.md) for exact results and missing checks.

Verified local Admin after authenticated provider probes (Qdrant remains unavailable):

![Local integration health panel](docs/screenshots/admin-live-probes.png)

## Deployment and judging

Preserve the existing [Render application](https://intelligence-brain.onrender.com/). Nothing has been pushed, merged, provisioned or deployed by this change. [Deployment instructions](docs/DEPLOYMENT.md) cover the approval gates, persistent storage, staging and readiness. [Rollback](docs/ROLLBACK.md) requires the actual last stable Render deployment ID and backup before release.

Use the [demo runbook](docs/DEMO_RUNBOOK.md) for the P101 flagship and judge questions. Live acceptance requires a genuine Omi conversation, approved Qdrant evidence and verified Lyzr agent execution in the deployed application.

## Limitations

Single-instance disk-backed integration state; no horizontal scaling or durable asynchronous worker. Omi sync is manual and supports one account-bound tenant/plant. The supplied managerial agent had zero managed agents/tools at the read probe; six-agent orchestration is unverified. No calibrated model confidence. Facts are exact source quotations; inferences require review. Existing dashboard/report examples remain demo data. AI supports—not replaces—authorized engineering judgment and never authorizes field work.
