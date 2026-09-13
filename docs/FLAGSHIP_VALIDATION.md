# Bounded Omi–Qdrant–Lyzr validation

## Scope and persisted state

User authorized approval and indexing of only the simulated Omi conversation `edb3…d763`. Exactly one record is now approved as demonstration evidence, not as authorization for field work. Its approval audit event identifies the explicitly authorized local review actor. No Omi Memory or action item was created. No full migration, push, merge or deployment occurred.

Qdrant `industrial_brain_evidence_v1` count was 3, became 4 after one upsert, and remained 4 after the duplicate upsert. FastEmbed BAAI/bge-small-en-v1.5 generated 384 finite values; an outbound guard verified dimension and single-record scope before each write. No old evidence points were overwritten. Original transcript and source IDs, segment IDs, timing offsets, application organization/plant, P101 asset tag, classification and approval metadata are retained. Timing offsets round-trip within 1e-12 seconds due to JSON floating-point conversion.

P101 retrieval returned the Omi observation and disclaimer. Wrong organization and wrong plant returned zero results. Operator retrieval excluded manager-only evidence. The demonstration evidence is labelled simulated and is not promoted to authoritative maintenance history or SOP. Operational authorization remains false.

## Real direct-agent execution

Execution `2a396488-148a-4a87-a125-18d23988073f` completed the application Qdrant retrieval and real Lyzr managerial-agent call with four scoped evidence chunks. A server-side validation-only allowlist limited evidence to the four test IDs; full migration readiness was not enabled.

The application removed five unsupported/non-exact claims. Three cited hypotheses remain, but zero confirmed facts passed exact-source validation. None of the retained hypotheses cites the Omi observation. Consequently the application returns insufficient verified evidence, despite successful provider execution. Confidence remains null (uncalibrated); citation coverage of the retained hypotheses is 100%, which is not a factual-confidence score. Human engineering review remains mandatory. Retrieval, validation and execution events are audit logged.

This does not pass the flagship acceptance requirement for a cited RCA incorporating the simulated Omi observation. The managerial output must supply exact evidence quotations with valid IDs and explicitly distinguish demonstration observations before this test can pass. No source text or citation was invented to repair its output.

## Local verification

47 mocked adapter/API tests passed, including provenance preservation, vector rejection before writes, unsupported-claim removal and bounded validation behavior. Lint and type checks passed. The full private execution report remains ignored under frontend/.integration-data/flagship-validation.local.json.

FLAGSHIP TEST FAILED
