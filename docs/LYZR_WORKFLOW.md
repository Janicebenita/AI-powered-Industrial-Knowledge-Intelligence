# Lyzr direct agent and optional workflow configuration

## Current direct managerial agent mode

Set `LYZR_API_MODE=agent`, `LYZR_AGENT_ID` and `LYZR_API_KEY`. `LYZR_WORKFLOW_ID` may remain empty. The adapter calls `POST /v3/inference/chat/` with the actual agent ID, a scoped hashed user identity and a unique session per application execution. Sessions are stored as `provider_session_id`, never as workflow or provider execution IDs. No callbacks/public local tunnel are needed for this mode.

The application first retrieves evidence with server-side Qdrant filters, then sends the scoped passages to the agent. Only those two observed steps are shown: application evidence retrieval and managerial agent. The supplied agent's authenticated configuration had zero managed agents and zero tools. A live no-evidence probe returned `insufficient_evidence` and zero validated claims. This proves direct inference, not specialist orchestration or a complete RCA.

The account's native response schema is supported: `confirmed_facts[].claim/citation_ids` and `hypotheses[].hypothesis/supporting_citation_ids`. Facts must still be exact cited quotations. Unknown citations fail closed. Uncited summary, self-reported confidence and recommended actions are not promoted into verified conclusions. Human review stays mandatory. The alternative `claims` schema below is also supported.

## Optional native specialist workflow

No agents, workflows or tools have been created in an external account. Obtain owner approval before creating them. This document is the integration contract, **not** an exported or verified Lyzr workflow.

Use the Lyzr Studio builder for the account's API version and export its native workflow JSON after configuration. Keep credentials in Lyzr's credential manager. Configure six real specialist agents and deterministic HTTP nodes; never ask a language model to invent execution events.

| Ordered agent | Boundary |
| --- | --- |
| Query Understanding Agent | Identify intent, explicit asset/time constraints and safety-sensitive requests; never change caller scope. |
| Evidence Retrieval Agent | Invoke the supplied retrieval callback. It uses the server's original question and session scope; model output cannot widen access. |
| Asset Intelligence Agent | Assemble only cited history and open issues; do not imply completeness without source coverage. |
| RCA Agent | Separate quoted observations from possible causes. Correlation is not causation. |
| Compliance and Safety Agent | Identify missing authoritative SOP/permit evidence. Never approve field work. |
| Evidence Verification Agent | Return exact-quote facts and explicitly labelled inferences with the supplied evidence IDs. |

Input fields: `question`, `execution_id`, `retrieval_url`, `trace_url`, `capability`, `output_contract`, `evidence_policy`. The capability is a short-lived secret held by deterministic HTTP nodes only. Do not include it, callback URLs, API keys or other secrets in agent prompts, final outputs or logs.

Before and after each real agent node, HTTP POST to `trace_url` with `Authorization: Bearer <capability>` and JSON `{ "name": "exact agent name", "status": "running" }` / `complete` / `failed`. Do not emit complete on a failed node. Receipt times are measured by the app. The retrieval HTTP node POSTs `{}` to `retrieval_url` with the same header. Do not allow the model to choose the destination URL or headers. It receives only the returned evidence data.

The final output must map to this object in `outputs` for SuperFlow, or `output` for v3:

```json
{
  "claims": [
    { "kind": "fact", "text": "An exact passage copied from retrieved evidence", "citations": ["supplied-evidence-id"] },
    { "kind": "inference", "text": "An explicitly uncertain causal hypothesis", "citations": ["supplied-evidence-id"] }
  ],
  "human_review_required": true
}
```

All output claims are independently validated by the application. Configure the native final-output mapping so claims are directly under the result object; nested node output envelopes must be mapped in Studio. Empty/incorrect output fails closed. No automatic human-approval resolver exists. Application review records evidence review after completion and never grants operational authority.

Set `LYZR_WORKFLOW_ID`, `LYZR_API_KEY`, `LYZR_API_BASE_URL`, `LYZR_API_MODE` and the externally reachable staging `APP_BASE_URL`. `LYZR_AGENT_ID` is reserved for account configuration; selecting a single chat agent does not satisfy this multi-agent contract. SuperFlow default origin is `https://inference.studio.lyzr.ai`; v3 uses `https://agent-prod.studio.lyzr.ai`.

Localhost is not reachable from Lyzr. Validate callbacks in an approved staging environment; do not create a public tunnel or staging resource without permission. Keep execution under the application's bounded wait (45 seconds after SuperFlow submission, plus bounded HTTP calls); otherwise configure and verify a durable asynchronous execution worker before production. Current restart/resumption limitations remain a production blocker.
