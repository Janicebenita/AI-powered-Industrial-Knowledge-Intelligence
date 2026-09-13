# Controlled migration report

16 source documents; 352 candidates; 350 accepted; 0 rejected; 2 duplicates excluded. Final Qdrant count: 354. All 22 batches passed count, dimension (384 finite values) and scope checks. Idempotency dry run: zero pending chunks, count 354. Original four points and source files unchanged. Private manifest and original payload/vector backup: frontend/.integration-data/migration-backups.

The two large PDFs retain the original 120000-character packaging cap. Their omitted tails were not migrated. New records are demo corpus references with source-file hashes, character/page provenance, permissions and deterministic IDs. No push, merge, Render change or deployment occurred.

## Retrieval results

Expected-source filename hits are a proxy, not annotated semantic precision/recall or complete-history coverage. Inspection-query expansion fixed the initial miss with scope filters unchanged. Sources indicate inspection due/missing evidence, without dates sufficient to establish overdue status.

| Question | Expected-source hits / results | Source precision proxy |
|---|---:|---:|
| Why has Pump P101 failed repeatedly? | 6/8 | 75.0% |
| Show complete maintenance history of Pump P101. | 1/8 | 12.5% |
| Which SOP applies before maintenance on Pump P101? | 3/8 | 37.5% |
| Which assets have overdue inspections? | 2/8 | 25.0% |
| Generate RCA for Compressor C201. | 2/8 | 25.0% |
| What recurring safety risks exist in the plant? | 1/8 | 12.5% |
| What QA/QC inspection and test controls are described in the QA/QC manual? | 8/8 | 100.0% |
| Which quality records should be maintained for inspection and test activities? | 7/8 | 87.5% |
| What was the nonconformity in the NCR and what corrective action was taken? | 1/8 | 12.5% |
| Which ISO 9001 requirement is cited in the calibration NCR? | 3/8 | 37.5% |
| What construction method controls and safety checks are required before execution? | 4/8 | 50.0% |
| What scope, obligations, or deliverables are mentioned in the tender document? | 8/8 | 100.0% |
| Which tender requirements should be converted into compliance or project evidence tasks? | 5/8 | 62.5% |
| Can you approve hot work without a permit or cited SOP? | 1/8 | 12.5% |

## P101 retrieved citations

- engineering_notes_P101.txt: `9fee1639d4f827c064661a43cdcba4e5c4959b997da24321d9952b64e17c9f9d`; Characters 1–615.
- FlowServe_P101_Manual.txt: `7c9e83d32a0088864f281b0f4b7fc3f4c00b18a2c9393cccdb5a4284ce2150fc`; Characters 1–866.
- inspection_report_P101.txt: `8c181b20ba23f5cc7259c57467e1a79013c89c9a92d8ec39719737e14483e0db`; Complete demo P101 inspection.
- SOP_22_Pump_Isolation.txt: `cf381bdb81d4ca0ac4c8f8fbce03c596bf4b121500580a2c42bf338828dfd9ad`; Characters 1–662.
- maintenance_work_orders.csv: `81ef56f27ab65b277492c642b57c62f3f32bfe7a569c42aae90d47f1720724d9`; CSV row 2: WO-10877.
- LOTO_Procedure.txt: `8f687e62ca8895781f17e03dee21c4d6691e59715298dc60d8cf0894c7557d92`; Characters 1–711.
- Omi conversation edb3…d763: `97d146772a243f6497e522fa5e7bc54471d612f34ffb0ba698e9f12775dcb5e5`; Characters 1–395.
- maintenance_work_orders.csv: `5d56c6073647496368ce1b80b2fecee84dd410889bf89e6b65aa58b600980ef9`; Characters 1–900.

Both P101 work orders, repeated seal failures, vibration/cavitation findings, inspection, manual, SOP/LOTO guidance and simulated Omi observation were retrieved. Differential pressure occurs in inspection/engineering sources; it was not inserted into Omi.

## Workflow outcome

Initial run: 10 raw claims, none released. Diagnostic rerun: 12 raw claims (8 candidate facts, 4 candidate hypotheses), zero validated, 12 rejected/unverified. The managerial agent returned its RCA schema instead of verification verdicts and exact supporting quotations. This contract failure does not prove every candidate false. No final facts, hypotheses or Omi citation were released. The candidate answer did cite Omi as simulated evidence.

Paraphrases are allowed with semantic verification and source support spans; novel numbers, standards and fabricated quotations are rejected. Confidence remains null; agent confidence is disregarded. Human review remains required, with no operational authorization. Retrieval, execution and validation are audit logged.

Authenticated probes: Omi healthy, Qdrant healthy at 354, Lyzr active-agent health healthy. Readiness false: migration/retrieval activation remains gated pending valid workflow output. No Render variables changed.

Required next action: configure Lyzr to honor the verification contract or authorize a separate verifier. No external agent configuration was changed.

## Tests

52 provider/API tests, four evidence scenarios, 14 legacy judge questions, component axe semantics and five FastEmbed checks passed. Final lint/typecheck/build and configured-secret/private-endpoint scan results are reported in the final response. No production browser verification or deployment occurred.

FLAGSHIP TEST FAILED

## Dedicated verifier adapter update

The direct workflow now uses LYZR_VERIFIER_AGENT_ID for the evidence-entailment request, with a separate session and runtime health status. Missing configuration fails closed without substituting the managerial agent. The environment template contains an empty placeholder only. 54 mocked adapter/API tests, lint and typecheck pass.

The current workspace does not contain this variable in project environment files, the process environment, or Windows user/machine environment. The local private configuration path is required before a real verifier call or flagship rerun can be performed. No Qdrant writes or external agent configuration changes were made for this update.

## Live two-agent retest after environment reload

Both agent IDs were present, different, and used in agent mode (values withheld). Dedicated verifier authenticated health passed. The adapter now recognizes its native claim_verdicts schema while requiring unchanged claims, valid cited IDs and exact supporting excerpts. Partially supported verdicts and unsupported causal rankings are excluded. An intermediate run validated seven of ten claims; manual review caught an unsupported comparative causal ranking, which prompted an additional rejection guard. The final live rerun returned eight raw claims and released zero. The flagship remains failed; no final facts, hypotheses or Omi citations are released. Confidence is null, human review remains required, and execution/validation are audit logged.

Qdrant stayed at 354 throughout; writes were blocked by the diagnostic harness. No migration, Omi mutations, push, merge or deployment occurred. The local Next server is rebuilt and restarted using the private env file. Adapter suite: 56 passing tests; lint and private-value scan passed. No IDs or credentials are included in this report.
