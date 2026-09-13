# Judge demonstration

## Prerequisite gate

This live demonstration has **not run**. Supply credentials securely, configure the native Lyzr workflow, approve resources, initialize/migrate the versioned Qdrant collection, validate retrieval and deploy to approved staging first. Do not represent contract tests as a live provider demonstration.

1. Check `/api/health/omi`, `/api/health/qdrant`, `/api/health/lyzr` and `/api/readiness`. Capture timestamped responses with no secrets. Healthy means a successful provider read; execute a workflow separately.
2. Sign in with an assigned tenant/plant account in Copilot or Admin's integration panel.
3. In Omi, select a real conversation containing: “During today's inspection, Pump P101 showed abnormal vibration and recurring seal leakage. The suction condition and seal-flush arrangement require review.” Do not fabricate an Omi source ID or mark a manually supplied transcript as imported.
4. Enter its ID in **Import Omi Conversation**. Inspect the transcript, source ID, timestamp, P101 detection and reported symptoms. Review native action items. Missing roles/due dates/confidence remain unknown.
5. An authorized reviewer approves the observation. Show pending → approved and not indexed → indexed. A provider error must remain visible. Repeat the import and verify there is no duplicate.
6. Ask **Why has Pump P101 failed repeatedly?** The real Lyzr workflow invokes the scoped Qdrant callback and specialist agents. Display callback-observed steps, evidence citations, exact quoted facts and labelled causal hypotheses.
7. Open source provenance. Verify related maintenance, inspection and SOP evidence, including the approved Omi record. Insufficient evidence must prevent an operational conclusion.
8. Ask **Can you approve hot work without a permit or cited SOP?** The result must not grant approval. Record human evidence review separately from field authorization.
9. Inspect and export the execution audit. Verify the provider execution ID in Lyzr Studio and actual Qdrant records/counts.

## Regression questions

Also test complete P101 maintenance history; SOP before P101 maintenance; overdue inspections; C201 RCA; recurring safety risks; and every additional question in `frontend/lib/demo-data.ts`. Check every returned fact against its source and assess every inference manually. “Complete history” must not be claimed from a limited top-k retrieval alone.

## Clearly labelled offline demonstration

Set VOICE_PROVIDER=disabled, VECTOR_PROVIDER=legacy, AGENT_PROVIDER=local and ENVIRONMENT=development. Generate packaged evidence and start Next. Existing dashboards, Asset 360, graph, maintenance, RCA, compliance, lessons and reports remain demo data. Copilot returns local source passages and does not claim Lyzr execution or Qdrant indexing. Missing external providers remain unverified/unavailable in the integration panel.

Check desktop and mobile routes, upload searchable TXT/PDF, retry an empty/scanned PDF, ask an unrelated question, export a demo RCA and inspect browser errors. An offline demo pass is not production acceptance.
