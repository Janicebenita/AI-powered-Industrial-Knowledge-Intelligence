# Omi preview validation

Authenticated Omi listing matched the exact title **Simulated Pump 101 Inspection Findings**, source timestamp `2026-09-13T19:21:19.471152Z`, redacted conversation ID `edb3…d763`, and simulated Pump inspection transcript. Earlier empty-list results are superseded by this successful read.

## Normalized pending preview

- Provider: Omi. Complete source and conversation IDs remain preserved in private application state.
- Application organization: `industrial-brain-ai`; plant: `plant-a` (application assignment, not native Omi identifiers).
- Asset: `P101`, normalized from the source words “pump one zero one”. Original transcript unchanged.
- Reported symptoms: abnormal vibration and recurring seal leakage. These are simulated observations, not a confirmed causal diagnosis.
- Proposed review passage: “The suction condition, the suction strainer, pressure, and the seal flush arrangement require engineering review.” The transcript does not explicitly say differential pressure; no missing words were inserted.
- Classification: `simulated_hackathon_demonstration`; demonstration disclaimer retained verbatim.
- Authorization disclaimer: “No maintenance or safety critical action is authorized.”
- Status: `pending`; indexing: `not_indexed`; operational authorization: false; confidence: null.
- Provenance: Omi conversation ID, original transcript, three segment IDs and original timing offsets, source timestamp and SHA-256 content hash. A tiny negative initial segment offset returned by Omi is preserved unchanged.

## Verified checks

The real import API was invoked twice using an ephemeral local reliability-engineer account with application authorization enforced. Both returned the same record ID; exactly one source record exists. No approval was made. Local document and execution stores were unchanged. Qdrant point counts before and after were both 3. A runtime network guard allowed GET requests only: two conversation retrievals and two Qdrant collection reads. No Omi Memory or action item was created, and no external write occurred.

44 mocked adapter/API tests passed, including source normalization, duplicate protection and redaction. Type checking and lint passed. Live duplicate import was additionally verified against the real source. These checks do not constitute production deployment verification.

The private full preview report is ignored at `frontend/.integration-data/omi-preview-validation.local.json`. No push, merge, migration or deployment occurred.

OMI PREVIEW READY FOR REVIEW
