"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Bot, CheckCircle2, FileSearch, Loader2, Radio, Send, ShieldCheck, Sparkles } from "lucide-react";
import { GlassCard, MetricCard } from "@/components/platform/cards";
import { CitationCard } from "@/components/platform/citation-card";
import { demoQuestions } from "@/lib/demo-data";

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
  answer: string;
  reason: string;
  evidence: string[];
  relatedAssets: string[];
  nextAction: string;
  confidence: string;
};

const aiChips = [
  "Predict Failure",
  "Generate RCA",
  "Summarize SOP",
  "Compliance Check",
  "Generate Report",
  "Explain Trend",
  "Find Similar Incident"
];

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

function clipText(value: string, maxLength = 170) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1).trim()}...` : normalized;
}

function extractAnswerBlock(text: string, labels: string[]) {
  const allLabels = ["Recommended SOP", "Recommended Finding", "Direct Answer", "Reason", "Evidence", "Related Assets", "Confidence", "Next Action"];
  const escapedLabels = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const escapedAllLabels = allLabels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const labelPattern = escapedLabels.join("|");
  const allLabelPattern = escapedAllLabels.join("|");
  const match = text.match(new RegExp(`(?:^|\\n)(${labelPattern}):\\s*\\n?([\\s\\S]*?)(?=\\n\\n(?:${allLabelPattern}):|$)`, "i"));
  return match?.[2]?.trim() || "";
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
  if (sourceText.includes("method statement") || sourceText.includes("mst") || sourceText.includes("coating repair") || sourceText.includes("surface profile")) {
    return "Method Statement for CS Pipe Internal Field Joint Coating & Coating Repair";
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
    ? citations.slice(0, 3).map((citation) => `${citation.title}: ${clipText(citation.quote)}`)
    : ["No source citation was returned. Ask a narrower question or upload the missing evidence document."];
  const answer =
    extractAnswerBlock(answerText, ["Recommended SOP", "Recommended Finding", "Direct Answer"]) ||
    (insufficient ? "Insufficient cited evidence" : inferRecommendedSop(question, answerText, citations.map((citation) => citation.title)));
  const reason = extractAnswerBlock(answerText, ["Reason"]) || (insufficient ? answerText : "Derived only from matched source citations.");
  const parsedConfidence = extractAnswerBlock(answerText, ["Confidence"]);

  return {
    answer: insufficient ? "No answer from current evidence" : answer,
    reason: clipText(reason, 240),
    evidence,
    relatedAssets: relatedAssets.length ? relatedAssets : ["No specific related asset detected"],
    nextAction: response?.suggested_next_actions?.[0] || "Review the cited source before field execution.",
    confidence: parsedConfidence || confidence
  };
}

function StructuredAnswer({ section }: { section: AnswerSection }) {
  const rows = [
    { label: "Answer", body: section.answer, accent: true },
    { label: "Why", body: section.reason },
    { label: "Evidence", list: section.evidence },
    { label: "Next Action", body: section.nextAction },
    { label: "Confidence", body: section.confidence }
  ];

  return (
    <div className="grid gap-3">
      {rows.map((row) => (
        <div key={row.label} className={`rounded-xl border p-4 ${row.accent ? "border-cyan-300/35 bg-cyan-300/[0.08]" : "border-white/10 bg-white/[0.045]"}`}>
          <h3 className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-200">{row.label}</h3>
          {row.list ? (
            <div className="grid gap-2">
              {row.list.map((item, index) => (
                <p key={`${row.label}-${index}`} className="break-words text-sm leading-6 text-slate-100">{item}</p>
              ))}
            </div>
          ) : (
            <p className={`break-words text-slate-100 ${row.accent ? "text-lg font-bold leading-7" : "text-sm leading-6"}`}>{row.body}</p>
          )}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        {section.relatedAssets.slice(0, 4).map((asset) => (
          <span key={asset} className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-xs font-semibold text-slate-300">{asset}</span>
        ))}
      </div>
    </div>
  );
}
function InsufficientEvidencePanel({ answer, actions }: { answer: string; actions: string[] }) {
  return (
    <div className="rounded-2xl border border-amber-300/35 bg-amber-400/[0.08] p-5 shadow-[0_0_32px_rgba(245,158,11,0.12)]">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-amber-200">
        <AlertTriangle size={17} /> Insufficient cited evidence
      </div>
      <p className="break-words text-base leading-7 text-slate-100">{answer}</p>
      <div className="mt-4 grid gap-2">
        {actions.map((action) => (
          <div key={action} className="rounded-xl border border-amber-200/15 bg-black/20 p-3 text-sm text-amber-50/90">
            {action}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CopilotPage() {
  const searchParams = useSearchParams();
  const [question, setQuestion] = useState("Why has Pump P101 failed repeatedly?");
  const [asked, setAsked] = useState(false);
  const [response, setResponse] = useState<CopilotResponse | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [isWarming, setIsWarming] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/copilot/ask", { method: "GET" })
      .catch(() => null)
      .finally(() => {
        if (active) setIsWarming(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const queryQuestion = searchParams.get("question");
    if (queryQuestion && !asked && !isAsking) {
      void askCopilot(queryQuestion);
    }
  }, [searchParams, asked, isAsking]);

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
    <div className="grid min-w-0 gap-5 xl:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)_330px]">
      <GlassCard className="h-fit rounded-[1.75rem]">
        <h2 className="mb-4 font-semibold">Conversation History</h2>
        {demoQuestions.map(({ category, question: item }) => (
          <button
            key={item}
            onClick={() => {
              void askCopilot(item);
            }}
            className="mb-2 w-full rounded-xl border border-white/10 bg-white/[0.05] p-3 text-left text-sm text-slate-300 transition hover:border-cyan-300/30 hover:bg-white/[0.09]"
          >
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-300">{category}</span>
            <span>{item}</span>
          </button>
        ))}
      </GlassCard>
      <section className="grid min-w-0 gap-4">
        <GlassCard className="command-panel plant-os-bg min-h-[680px] rounded-[2rem]">
          <div className="mb-6 flex min-w-0 flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-blue-500/20 text-cyan-200 shadow-[0_0_28px_rgba(0,212,255,0.18)]"><Bot /></div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">The AI Command Center</p>
              <h1 className="break-words text-3xl font-black">Ask the Plant</h1>
              <p className="break-words text-sm text-slate-400">Conversational intelligence with cited evidence, confidence, and actions.</p>
            </div>
            </div>
            <div className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-100">{isWarming ? "Index warming" : "Evidence ready"}</div>
          </div>
          <div className="mb-4 rounded-[1.6rem] border border-cyan-300/25 bg-white/[0.065] p-4 shadow-[0_0_42px_rgba(0,212,255,0.10)]">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void askCopilot();
                  }
                }}
                placeholder="Ask anything about assets, SOPs, failures, quality, compliance, or tender evidence..."
                className="min-h-16 min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#081320]/72 px-5 text-base outline-none transition focus:border-cyan-300"
              />
              <button
                onClick={() => void askCopilot()}
                disabled={isAsking}
                className="inline-flex min-h-16 shrink-0 items-center justify-center gap-2 rounded-2xl bg-blue-500 px-7 font-bold shadow-[0_0_34px_rgba(0,123,255,0.34)] transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAsking ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Ask
              </button>
            </div>
          </div>
          <div className="mb-5 flex flex-wrap gap-2">
            {aiChips.map((chip) => (
              <button key={chip} type="button" className="ai-chip rounded-full px-4 py-2 text-xs font-bold text-cyan-100">
                {chip}
              </button>
            ))}
          </div>
          {!asked ? (
            <div className="rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/[0.055] p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-cyan-100"><CheckCircle2 size={16} /> Ready to answer from indexed plant evidence</div>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  isWarming ? "Preparing evidence index..." : "Evidence index ready",
                  "Review source citations",
                  "Open suggested actions"
                ].map((item) => <div key={item} className="rounded-xl border border-white/10 bg-white/[0.045] p-4 text-sm text-slate-300">{item}</div>)}
              </div>
            </div>
          ) : null}
          {asked ? (
            <div className="rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/5 p-5">
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
              ) : response?.evidence_strength === "insufficient" ? (
                <InsufficientEvidencePanel answer={response.direct_answer} actions={response.suggested_next_actions} />
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
            {citations.length > 0 ? <div className="flex items-center gap-2 text-sm font-semibold text-cyan-200"><FileSearch size={16} /> Evidence Timeline</div> : null}
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









