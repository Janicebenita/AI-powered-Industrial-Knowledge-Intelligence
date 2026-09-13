# Review diff summary

Working-tree changes against `40584d47904884a4b4349bd4d2de0e00ef0625a0` on `feat/omi-qdrant-lyzr-integration`. Updated 2026-09-14; no commit, push or deployment.

## Tracked added/deleted lines

```text
40	0	.env.example
5	0	.gitignore
11	3	Dockerfile
51	474	README.md
34	52	frontend/app/api/copilot/ask/route.ts
17	9	frontend/app/api/documents/upload/route.ts
8	3	frontend/app/api/reports/rca/[assetTag]/route.ts
7	2	frontend/app/local-api/reports/rca/[assetTag]/route.ts
6	4	frontend/app/platform/admin/page.tsx
36	120	frontend/app/platform/copilot/page.tsx
2	2	frontend/app/platform/dashboard/page.tsx
24	25	frontend/app/platform/evaluation/page.tsx
1	1	frontend/app/platform/maintenance/page.tsx
6	6	frontend/components/platform/app-shell.tsx
3	2	frontend/components/platform/citation-card.tsx
2	2	frontend/next.config.mjs
12	2	frontend/package.json
1389	6	frontend/pnpm-lock.yaml
```

## Changed and new files

```text
M .env.example
 M .gitignore
 M Dockerfile
 M README.md
 M frontend/app/api/copilot/ask/route.ts
 M frontend/app/api/documents/upload/route.ts
 M frontend/app/api/reports/rca/[assetTag]/route.ts
 M frontend/app/local-api/reports/rca/[assetTag]/route.ts
 M frontend/app/platform/admin/page.tsx
 M frontend/app/platform/copilot/page.tsx
 M frontend/app/platform/dashboard/page.tsx
 M frontend/app/platform/evaluation/page.tsx
 M frontend/app/platform/maintenance/page.tsx
 M frontend/components/platform/app-shell.tsx
 M frontend/components/platform/citation-card.tsx
 M frontend/next.config.mjs
 M frontend/package.json
 M frontend/pnpm-lock.yaml
?? .dockerignore
?? .github/workflows/integration-ci.yml
?? docs/BASELINE_AUDIT.md
?? docs/CHANGE_SUMMARY.md
?? docs/DEMO_RUNBOOK.md
?? docs/DEPLOYMENT.md
?? docs/FASTEMBED.md
?? docs/INTEGRATION_ARCHITECTURE.md
?? docs/LIVE_PROVIDER_CHECKS.md
?? docs/LYZR_WORKFLOW.md
?? docs/ROLLBACK.md
?? docs/SECURITY.md
?? docs/TEST_REPORT.md
?? docs/screenshots/admin-live-mobile.png
?? docs/screenshots/admin-live-probes.png
?? docs/screenshots/admin-local-default.png
?? docs/screenshots/admin-local-desktop.png
?? frontend/app/api/evaluation/route.ts
?? frontend/app/api/health/[provider]/route.ts
?? frontend/app/api/health/route.ts
?? frontend/app/api/integrations/[...parts]/route.ts
?? frontend/app/api/readiness/route.ts
?? frontend/components/platform/agentic-integrations.tsx
?? frontend/eslint.config.mjs
?? frontend/instrumentation.ts
?? frontend/lib/server/integrations/api.ts
?? frontend/lib/server/integrations/auth.ts
?? frontend/lib/server/integrations/config.ts
?? frontend/lib/server/integrations/contracts.ts
?? frontend/lib/server/integrations/embedding.ts
?? frontend/lib/server/integrations/factory.ts
?? frontend/lib/server/integrations/fastembed.ts
?? frontend/lib/server/integrations/http.ts
?? frontend/lib/server/integrations/ingestion.ts
?? frontend/lib/server/integrations/lyzr.ts
?? frontend/lib/server/integrations/omi.ts
?? frontend/lib/server/integrations/provider-health.ts
?? frontend/lib/server/integrations/qdrant.ts
?? frontend/lib/server/integrations/state.ts
?? frontend/lib/server/integrations/upload.ts
?? frontend/lib/server/integrations/workflow.ts
?? frontend/scripts/create-local-account.cjs
?? frontend/scripts/evaluate-retrieval.cjs
?? frontend/scripts/fastembed-worker.py
?? frontend/scripts/migrate-evidence.cjs
?? frontend/scripts/register-typescript.cjs
?? frontend/scripts/requirements-fastembed.txt
?? frontend/scripts/smoke-http.cjs
?? frontend/scripts/test-components.cjs
?? frontend/scripts/test-fastembed.cjs
?? frontend/scripts/test-integrations.cjs
?? frontend/scripts/test-judge-questions.cjs
```

Private environment files are ignored and excluded. See LIVE_PROVIDER_CHECKS.md for current verification.
