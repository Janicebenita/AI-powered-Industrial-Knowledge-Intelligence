# Validation repair report

Scope: local validation code/tests and two existing Lyzr agents. Qdrant read only at 354 points; Omi observations unchanged. No deployed agent configuration, Render change, push, merge or deployment.

## Files changed in this repair

- frontend/lib/server/integrations/validation.ts (new)
- frontend/lib/server/integrations/workflow.ts
- frontend/lib/server/integrations/contracts.ts
- frontend/scripts/test-validation.cjs (new)
- frontend/scripts/test-live-validation.cjs (new)
- frontend/scripts/test-integrations.cjs
- frontend/package.json
- docs/VALIDATION_REPAIR_REPORT.md

## Algorithm and contract

Both source and excerpt use Unicode NFC, outer whitespace trimming and consecutive-whitespace collapse. At most one matching straight/curly single/double enclosing quotation pair is removed from the complete excerpt. Internal punctuation, quotation marks, numbers, units, signs and decimal points are preserved. Matching is exact substring after normalization, never fuzzy. The ordinary minimum is 12 characters with at least three letters. A short numeric excerpt must be a complete labelled numeric field that exactly matches an entire source line; bare numeric values are rejected. Original and normalized excerpts and the actual matching citation IDs are retained in the scoped hash-linked validation audit.

Causal ranking checks distinguish clause-level denial/uncertainty from positive most-likely/primary/dominant/sole assertions. Genuine attributed source quotations remain evidence statements. Specific rejection reasons replace the old generic rejection. CSV separators are no longer conflated with decimal numbers.

The sole response contract is industrial-evidence-verification/v1, matching the deployed claim_verdicts schema. Strict keys/types, submitted IDs, citation scope, duplicate/missing IDs, counts and overall status are checked. Returned human-review flags never disable application-side review. Stable claim IDs derive from content/kind/citations; no claim IDs are whitelisted. Partial text must pass a conservative monotonic rewrite check, preserve uncertainty, introduce no new concepts/numbers/references/instructions, and have matching cited excerpts. Unsupported portions are never released. Raw agent/session identifiers are not exposed in result payloads.

## Saved-session replay (before live calls)

Historical claims 0, 1, 2, 4 passed fully; 3 passed only as the recorded narrowed claim; 5 remained locally blocked; 6 became eligible for verification; 7 remained unsupported. All 17 historical excerpts matched. The historical verifier saw only six claims, so the six recorded verdicts were replayed against those six original submissions with deterministic ID translation. No claim-6 verdict was manufactured. A separate completeness test confirms that the old response fails closed against the newly eligible seven-claim submission.

## Live test

The first run failed closed on count mismatch: seven entries (five supported/two partial) but reported totals four supported/two partial. The local request now explicitly requires recomputation of all counts; validation was not loosened. The final run used one manager and one independent verifier inference call.

Final raw claims: 12; validated: 6; rejected: 6.

| Trace metric | Measured count |
|---|---:|
| qdrant_passages | 8 |
| orchestrator_unique_passages | 8 |
| verifier_unique_passages | 5 |
| evidence_assignments | 15 |
| claims_submitted | 11 |
| locally_rejected | 1 |
| verifier_entries | 11 |
| claims_released | 6 |

## Released cited answer (demonstration evidence)

- **full / fact / claim-755976a745fb7fb2a38f**: Engineering notes state that P101 has operated near the left side of its curve during low demand periods, which can increase recirculation, vibration, seal face instability, and cavitation risk.
  Citations: `9fee1639d4f827c064661a43cdcba4e5c4959b997da24321d9952b64e17c9f9d`
- **full / fact / claim-7ca4dd1d71566860ed65**: The inspection report recorded suction pressure of 1.2 bar, discharge pressure of 8.4 bar, vibration of 7.8 mm/s RMS, and seal flush flow below OEM recommendation.
  Citations: `8c181b20ba23f5cc7259c57467e1a79013c89c9a92d8ec39719737e14483e0db`
- **narrowed / fact / claim-7aef1dc51727427b5f51**: A work order on 2026-02-19 recorded seal failure, vibration anomaly, and cavitation.
  Citations: `81ef56f27ab65b277492c642b57c62f3f32bfe7a569c42aae90d47f1720724d9`, `5d56c6073647496368ce1b80b2fecee84dd410889bf89e6b65aa58b600980ef9`
- **full / fact / claim-7ac70624ec280b6b7106**: A prior work order on 2025-08-14 recorded seal failure and bearing overheating, with a note of possible shaft misalignment after outage.
  Citations: `5d56c6073647496368ce1b80b2fecee84dd410889bf89e6b65aa58b600980ef9`
- **full / fact / claim-a5878bf6fa2ca5b02753**: The OEM manual says cavitation may cause vibration anomaly, seal face damage, impeller erosion, and bearing overheating, and advises avoiding operation far left of the pump curve.
  Citations: `7c9e83d32a0088864f281b0f4b7fc3f4c00b18a2c9393cccdb5a4284ce2150fc`
- **full / fact / claim-b901caa19effe6fb0e65**: The OEM manual advises verifying seal flush flow before startup and not restarting after seal replacement until coupling alignment, suction pressure, and casing venting are confirmed.
  Citations: `7c9e83d32a0088864f281b0f4b7fc3f4c00b18a2c9393cccdb5a4284ce2150fc`

## Rejected claims

| Claim | Candidate text | Exact application reason |
|---|---|---|
| claim-5bde98caf643043ceef8 | P101 is a condensate transfer pump manufactured by FlowServe and described as a centrifugal process pump. | supported claim text changed |
| claim-7c61023cf6692643ff58 | The engineering notes also state that repeated seal failure occurred after periods of low suction pressure and elevated strainer differential pressure. | supported claim text changed |
| claim-72cce61ca128fe5b68f7 | The inspection report dated 2026-02-20 found repeated vibration anomaly after mechanical seal replacement, below-expected seal flush flow during startup, elevated suction strainer differential pressure, and operator-reported cavitation noise. | supported claim text changed |
| claim-c35321119db06d9c1b5a | The most likely primary driver of repeated failures is cavitation/recirculation associated with low suction pressure, elevated strainer differential pressure, and operation too far left on the curve. | unsupported causal ranking |
| claim-6592f5856c1a8bb4f4e5 | Seal flush inadequacy may be contributing to repeated seal damage and post-replacement vibration. | partial verdict did not narrow unsupported text |
| claim-3b677823de8009b7c6f7 | Mechanical alignment or rotating-element condition may also be contributing, but the provided evidence does not conclusively isolate which one. | narrowed claim removes uncertainty or negation |

The final output contains five full facts and one narrowed fact. No hypothesis survived; none was converted to fact. Unsupported primary-driver language was excluded. No strainer-fouling assertion was released. The Omi observation was retrieved but no final claim used it, so no Omi citation was forced into the answer. The result identifies its cited demo sources as demonstration evidence. It does not claim a proven root cause or authorize field work.

Human review is mandatory; operational approval is absent; confidence remains null rather than a model-supplied score. Released-claim citation coverage is 100%, not a probability of correctness. All retained facts were manually compared with their actual cited passages. Excerpt originals/normalized forms, decisions, version and counts are audit logged.

## Verification

- 50 provider/API integration tests passed, including RBAC and outage paths.
- 52 focused validation tests and the saved-session replay passed.
- All 14 legacy judge questions and four evidence regression scenarios passed.
- Component axe semantics and five FastEmbed tests passed.
- Lint/typecheck passed. Production build and private-value scan are reported in the final response.
- Live Qdrant point count before and after: 354. Original local documents and Omi records unchanged, checked by exact comparisons. The network guard prohibited Qdrant writes.

## Limits

This is a local backend flagship test, not production deployment acceptance or a fresh browser end-to-end verification. The production activation/readiness gate was not changed. Narrowing intentionally rejects rewrites it cannot conservatively establish; some semantically valid rewrites can require review. Lyzr remains nondeterministic: a future malformed/inconsistent response fails closed. Existing corpus limitations (demo data and capped PDF extraction) remain. The existing Next ESLint-plugin detection warning remains.

OMI–QDRANT–LYZR FLAGSHIP TEST PASSED
