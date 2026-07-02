"use client";

import { useState } from "react";
import { AlertTriangle, Bot, Loader2, Radio, Send, ShieldCheck } from "lucide-react";
import { GlassCard, MetricCard } from "@/components/platform/cards";
import { CitationCard } from "@/components/platform/citation-card";

const suggested = [
  "Why has Pump P101 failed repeatedly?",
  "Which SOP applies before opening vessel V203?",
  "What should a field technician check first?",
  "Which regulatory requirements are not covered?"
];

type StaticAnswer = {
  match: string[];
  confidence: string;
  evidence: string;
  answer: string;
  context: string[];
  citations: { title: string; page: string; confidence: number; quote: string }[];
};

type CopilotCitation = {
  document_id: number;
  chunk_id: number;
  filename: string;
  page_number: number;
  section: string;
  quote: string;
  confidence: number;
};

type CopilotResponse = {
  answer_id: string;
  direct_answer: string;
  confidence: number;
  citations: CopilotCitation[];
  related_assets: string[];
  related_documents: string[];
  suggested_next_actions: string[];
  evidence_strength: string;
};

type AnswerSection = {
  recommendedSop: string;
  reason: string;
  evidence: string[];
  relatedAssets: string[];
  confidence: string;
};

const answers: Record<string, StaticAnswer> = {
  pump: {
    match: ["pump p101", "failed repeatedly", "seal failure"],
    confidence: "86%",
    evidence: "High",
    answer:
      "Pump P101 shows repeated seal failure and vibration anomaly patterns. The strongest cited contributors are low suction pressure, suction strainer fouling, cavitation, and possible shaft misalignment after prior maintenance. Field technicians should first verify suction strainer differential pressure, seal flush flow, coupling alignment, and vibration trend history before replacing the seal again.",
    context: ["P101 - Condensate Transfer Pump", "Risk score 88", "Open RCA requested", "ISO-14224 partial evidence"],
    citations: [
      { title: "WO-10877_P101_vibration_repeat.pdf", page: "p.1", confidence: 92, quote: "Repeated vibration and seal failure observed. Operator reported intermittent cavitation noise and suction strainer fouling." },
      { title: "WO-10421_mechanical_seal.pdf", page: "p.2", confidence: 88, quote: "Root cause note: possible shaft misalignment after prior outage and low suction pressure causing cavitation." },
      { title: "FlowServe_P101_Manual.txt", page: "Troubleshooting", confidence: 94, quote: "High vibration may be caused by cavitation, misalignment, bearing wear, impeller imbalance, suction restriction, or operation outside preferred operating range." }
    ]
  },
  vessel: {
    match: ["v203", "vessel", "opening"],
    confidence: "91%",
    evidence: "High",
    answer:
      "Before opening Pressure Vessel V203, the applicable procedure is SOP-VES-203 Vessel Opening and Confined Space Entry, supported by the plant LOTO procedure and permit-to-work requirements. The work pack must include isolation blinds, zero pressure verification, gas test, confined space permit, rescue plan, and safety officer approval. The evidence also shows an OISD/API pressure vessel inspection gap, so the inspection certificate should be attached before release.",
    context: ["V203 - Knockout Drum", "Permit required", "Confined space controls", "Pressure test evidence partial"],
    citations: [
      { title: "SOP-VES-203_pressure_vessel_entry.txt", page: "Revision 4", confidence: 94, quote: "Before opening vessel V-203, safety officer must verify isolation blinds, gas test, confined space permit, rescue plan, and zero pressure." },
      { title: "near_miss_report.txt", page: "NM-2026-07", confidence: 86, quote: "Maintenance crew approached V203 for opening activity before rescue plan evidence was attached to the permit-to-work package." },
      { title: "OISD_Checklist.csv", page: "OISD-STD-118", confidence: 89, quote: "Pressure vessel inspection and test evidence must be current. Applies to V203. Evidence status: Missing." }
    ]
  },
  technician: {
    match: ["field technician", "check first", "technician"],
    confidence: "84%",
    evidence: "Medium-High",
    answer:
      "For a field technician responding to Pump P101, the first checks should be safety isolation readiness, suction strainer differential pressure, suction pressure/NPSH condition, seal flush flow, visible leakage around the mechanical seal, and vibration trend. Do not open the casing until lockout tagout, valve isolation, drain verification, zero pressure, and permit-to-work evidence are complete.",
    context: ["P101 first-response checklist", "LOTO mandatory", "Seal flush and suction checks", "Technician sign-off required"],
    citations: [
      { title: "SOP_22_Pump_Isolation.txt", page: "Steps 1-7", confidence: 96, quote: "Apply lockout tagout, close suction and discharge isolation valves, drain casing, verify zero pressure, and isolate seal flush line." },
      { title: "inspection_report_P101.txt", page: "Process parameters", confidence: 87, quote: "Suction pressure was 1.2 bar, vibration was 7.8 mm/s RMS, and seal flush flow was below OEM recommendation." },
      { title: "FlowServe_P101_Manual.txt", page: "Preventive maintenance", confidence: 91, quote: "Inspect suction strainer differential pressure, verify mechanical seal flush, inspect impeller wear, and trend vibration monthly." }
    ]
  },
  compliance: {
    match: ["regulatory", "requirements", "not covered", "compliance"],
    confidence: "79%",
    evidence: "Moderate",
    answer:
      "The uncovered or partially covered regulatory requirements are OISD-STD-118 for V203 pressure vessel inspection/test evidence, OISD-244-ELECT for EP501 energized electrical work and arc flash evidence, OISD-INS-HX for HX401 heat exchanger corrosion closure, and partial OISD-105-PTW evidence for P101 permit-to-work. These should be treated as audit readiness gaps until source documents are attached.",
    context: ["4 compliance gaps", "V203, EP501, HX401, P101", "Audit readiness partial", "Evidence package required"],
    citations: [
      { title: "OISD_Checklist.csv", page: "Checklist rows", confidence: 90, quote: "V203 pressure vessel inspection evidence missing, EP501 electrical controls missing, HX401 inspection closure partial, and P101 permit-to-work partial." },
      { title: "Factory_Act_Requirements.txt", page: "Detected gaps", confidence: 82, quote: "V203 pressure test evidence missing. EP501 arc flash evidence missing. HX401 quality non-conformance QA12 remains open." },
      { title: "quality_issue_QA12.txt", page: "QA12", confidence: 78, quote: "Inspection non-conformance remains open. Pressure test documentation and coating repair photographs are required." }
    ]
  }
};

function getFallbackAnswer(question: string) {
  const normalized = question.toLowerCase();
  return Object.values(answers).find((answer) => answer.match.some((term) => normalized.includes(term))) || answers.pump;
}

function confidencePercent(value: number) {
  return Math.round(value <= 1 ? value * 100 : value);
}

function inferRecommendedSop(question: string, answer: string, documents: string[]) {
  const sourceText = `${question} ${answer} ${documents.join(" ")}`.toLowerCase();
  const sopDocument = documents.find((document) => /sop|procedure|loto|isolation|permit/i.test(document));

  if (sopDocument) {
    return sopDocument;
  }
  if (sourceText.includes("v203") || sourceText.includes("v-203") || sourceText.includes("vessel")) {
    return "SOP-VES-203 Pressure Vessel Opening and Confined Space Entry";
  }
  if (sourceText.includes("p101") || sourceText.includes("p-101") || sourceText.includes("pump")) {
    return "SOP_22_Pump_Isolation.txt";
  }
  if (sourceText.includes("electrical") || sourceText.includes("arc flash") || sourceText.includes("ep501")) {
    return "LOTO_Procedure.txt";
  }
  return "No specific SOP identified from cited evidence";
}

function buildAnswerSection({
  question,
  answerText,
  citations,
  confidence,
  response,
  fallback
}: {
  question: string;
  answerText: string;
  citations: Array<{ title: string; quote: string }>;
  confidence: string;
  response: CopilotResponse | null;
  fallback: StaticAnswer;
}): AnswerSection {
  const insufficient = response?.evidence_strength === "insufficient" || citations.length === 0;
  const relatedAssets = insufficient
    ? []
    : response?.related_assets?.length
    ? response.related_assets
    : fallback.context.filter((item) => /\b(P|C|B|HX|V|EP)-?\d{3}\b|P101|V203|EP501|HX401|C201|B203/i.test(item));
  const evidence = citations.length
    ? citations.slice(0, 4).map((citation) => `${citation.title}: ${citation.quote}`)
    : ["No source citation was returned. Ask a narrower question or upload the missing evidence document."];

  return {
    recommendedSop: insufficient ? "Not available from cited evidence" : inferRecommendedSop(question, answerText, citations.map((citation) => citation.title)),
    reason: answerText,
    evidence,
    relatedAssets: relatedAssets.length ? relatedAssets : ["No specific related asset detected"],
    confidence
  };
}

function StructuredAnswer({ section }: { section: AnswerSection }) {
  const rows = [
    { label: "Recommended SOP", body: section.recommendedSop },
    { label: "Reason", body: section.reason },
    { label: "Evidence", list: section.evidence },
    { label: "Related Assets", list: section.relatedAssets },
    { label: "Confidence", body: section.confidence }
  ];

  return (
    <div className="grid gap-4">
      {rows.map((row) => (
        <div key={row.label} className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-normal text-cyan-200">{row.label}:</h3>
          {row.list ? (
            <div className="grid gap-2">
              {row.list.map((item, index) => (
                <p key={`${row.label}-${index}`} className="break-words text-sm leading-6 text-slate-100">
                  {item}
                </p>
              ))}
            </div>
          ) : (
            <p className="break-words text-base leading-7 text-slate-100">{row.body}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function CopilotPage() {
  const [question, setQuestion] = useState("Why has Pump P101 failed repeatedly?");
  const [asked, setAsked] = useState(false);
  const [response, setResponse] = useState<CopilotResponse | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState("");

  async function askCopilot(nextQuestion = question) {
    const trimmed = nextQuestion.trim();
    if (!trimmed) {
      setError("Enter a question before asking the copilot.");
      return;
    }

    setQuestion(trimmed);
    setAsked(true);
    setIsAsking(true);
    setError("");

    try {
      const result = await fetch("/api/copilot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, user_role: "maintenance" })
      });

      if (!result.ok) {
        const detail = await result.text();
        throw new Error(detail || `Copilot request failed with HTTP ${result.status}`);
      }

      setResponse(await result.json());
    } catch (requestError) {
      setResponse(null);
      setError(requestError instanceof Error ? requestError.message : "Copilot request failed. Check the backend server.");
    } finally {
      setIsAsking(false);
    }
  }

  const answerText = response?.direct_answer ?? "";
  const citations = response?.citations?.length
    ? response.citations.map((citation, index) => ({
        id: `${citation.document_id}-${citation.chunk_id}-${index}`,
        title: citation.filename,
        page: `${citation.section || "Source"} - p.${citation.page_number}`,
        confidence: confidencePercent(citation.confidence),
        quote: citation.quote
      }))
    : [];
  const confidence = response ? `${confidencePercent(response.confidence)}%` : "0%";
  const evidence = response ? response.evidence_strength : "No question asked";
  const structuredAnswer = response
    ? buildAnswerSection({ question, answerText, citations, confidence, response, fallback: getFallbackAnswer(question) })
    : null;
  const context = response
    ? [
        ...(response.related_assets.length ? response.related_assets.map((asset) => `Asset ${asset}`) : ["No specific asset detected"]),
        ...(response.related_documents.length ? response.related_documents.slice(0, 4) : ["No related documents returned"]),
        ...response.suggested_next_actions.slice(0, 3)
      ]
    : ["Ask a question to retrieve cited plant evidence."];

  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[260px_minmax(0,1fr)] 2xl:grid-cols-[260px_minmax(0,1fr)_300px]">
      <GlassCard>
        <h2 className="mb-4 font-semibold">Conversation History</h2>
        {suggested.map((item) => (
          <button
            key={item}
            onClick={() => {
              void askCopilot(item);
            }}
            className="mb-2 w-full rounded-xl border border-white/10 bg-white/[0.05] p-3 text-left text-sm text-slate-300 transition hover:bg-white/[0.09]"
          >
            {item}
          </button>
        ))}
      </GlassCard>
      <section className="grid min-w-0 gap-4">
        <GlassCard className="min-h-[560px]">
          <div className="mb-5 flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-500/20 text-cyan-200"><Bot /></div>
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-black">AI Knowledge Copilot</h1>
              <p className="break-words text-sm text-slate-400">Cited industrial answers with uncertainty handling.</p>
            </div>
          </div>
          <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void askCopilot();
                  }
                }}
                className="min-h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.07] px-4 outline-none focus:border-cyan-300"
              />
              <button
                onClick={() => void askCopilot()}
                disabled={isAsking}
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 font-bold hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAsking ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Ask
              </button>
            </div>
          </div>
          {asked ? (
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm text-emerald-200">
                {isAsking ? <Loader2 className="animate-spin" size={16} /> : <Radio size={16} />}
                {isAsking ? "Searching indexed documents and citations..." : "Evidence-backed answer complete"}
              </div>
              {error ? (
                <div className="flex gap-3 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
                  <AlertTriangle className="shrink-0" size={18} />
                  <span>{error}</span>
                </div>
              ) : isAsking ? (
                <p className="break-words text-lg leading-8 text-slate-100">Retrieving relevant uploaded document chunks...</p>
              ) : structuredAnswer ? (
                <StructuredAnswer section={structuredAnswer} />
              ) : (
                <p className="break-words text-lg leading-8 text-slate-100">
                  Ask a question to search indexed documents. The copilot will decline if it cannot find cited evidence.
                </p>
              )}
            </div>
          ) : null}
          <div className="mt-5 grid gap-3">
            {!isAsking && citations.map((citation) => <CitationCard key={citation.id} {...citation} />)}
          </div>
        </GlassCard>
      </section>
      <aside className="grid h-fit min-w-0 gap-4 xl:col-span-2 xl:grid-cols-2 2xl:col-span-1 2xl:grid-cols-1">
        <MetricCard label="Confidence Score" value={confidence} delta="Source-cited answer" tone="success" />
        <MetricCard label="Evidence Quality" value={evidence} delta={`${citations.length} source documents cited`} tone="info" />
        <GlassCard className="xl:col-span-2 2xl:col-span-1">
          <h2 className="mb-3 font-semibold">Asset Context</h2>
          {context.map((item) => <div key={item} className="mb-2 break-words rounded-lg bg-white/[0.06] p-3 text-sm text-slate-300">{item}</div>)}
        </GlassCard>
        <GlassCard className="xl:col-span-2 2xl:col-span-1">
          <h2 className="mb-3 flex items-center gap-2 font-semibold"><ShieldCheck size={18} /> Insufficient Evidence State</h2>
          <p className="text-sm leading-6 text-slate-400">When citations are weak, the copilot refuses operational guidance and asks for missing SOP, work order, inspection, or compliance evidence.</p>
        </GlassCard>
      </aside>
    </div>
  );
}
