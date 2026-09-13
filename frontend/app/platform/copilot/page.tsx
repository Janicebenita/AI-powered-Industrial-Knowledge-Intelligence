"use client";

import { AgenticIntegrations } from "@/components/platform/agentic-integrations";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Bot, CheckCircle2, FileSearch, Loader2, Radio, Send, ShieldCheck } from "lucide-react";
import { GlassCard, MetricCard } from "@/components/platform/cards";
import { CitationCard } from "@/components/platform/citation-card";
import { demoQuestions } from "@/lib/demo-data";

type CopilotCitation = {
  document_id: number | string;
  chunk_id: number | string;
  source_url?: string;
  filename: string;
  page_number: number | null;
  section: string;
  quote: string;
  confidence: number | null;
};

type CopilotResponse = {
  provider?: string;
  confidence_basis?: string;
  citation_coverage?: number;
  human_review_required?: boolean;
  execution?: { id: string; status: string; steps: { name: string; status: string; provider: string }[] };
  answer_id: string;
  documents_indexed?: number;
  direct_answer: string;
  confidence: number | null;
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

function confidencePercent(value: number | null) {
  if (value === null) return 0;
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

function buildAnswerSection({
  answerText,
  citations,
  confidence,
  response
}: {
  answerText: string;
  citations: Array<{ title: string; quote: string }>;
  confidence: string;
  response: CopilotResponse | null;
}): AnswerSection {
  const insufficient = response?.evidence_strength === "insufficient" || citations.length === 0;
  const relatedAssets = insufficient
    ? []
    : response?.related_assets?.length
    ? response.related_assets
    : [];
  const evidence = citations.length
    ? citations.slice(0, 3).map((citation) => `${citation.title}: ${clipText(citation.quote)}`)
    : ["No source citation was returned. Ask a narrower question or upload the missing evidence document."];
  const answer =
    extractAnswerBlock(answerText, ["Recommended SOP", "Recommended Finding", "Direct Answer"]) ||
    (insufficient ? "Insufficient cited evidence" : answerText);
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
  const [documentCount, setDocumentCount] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/copilot/ask", { method: "GET" })
      .then(async (result) => {
        if (!result.ok) throw new Error("Evidence index unavailable");
        const health = await result.json();
        if (active) setDocumentCount(typeof health.documents_indexed === "number" ? health.documents_indexed : null);
      })
      .catch(() => { if (active) setDocumentCount(null); })
      .finally(() => {
        if (active) setIsWarming(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const askCopilot = useCallback(async (nextQuestion = question) => {
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

      const answer = await result.json() as CopilotResponse;
      setResponse(answer);
      if (typeof answer.documents_indexed === "number") setDocumentCount(answer.documents_indexed);
    } catch (requestError) {
      setResponse(null);
      setError(requestError instanceof Error ? requestError.message : "Copilot request failed. Check the backend server.");
    } finally {
      setIsAsking(false);
    }
  }, [question]);

  useEffect(() => {
    const queryQuestion = searchParams.get("question");
    if (queryQuestion && !asked && !isAsking) {
      void askCopilot(queryQuestion);
    }
  }, [searchParams, asked, isAsking, askCopilot]);


  const indexLabel = isWarming ? "Checking evidence..." : documentCount === null ? "Evidence index unavailable" : documentCount === 0 ? "No evidence indexed" : `${documentCount} documents searchable`;
  const answerText = response?.direct_answer ?? "";
  const citations = response?.citations?.length
    ? response.citations.map((citation, index) => ({
        id: `${citation.document_id}-${citation.chunk_id}-${index}`,
        title: citation.filename,
        sourceUrl: citation.source_url,
        page: citation.page_number ? `${citation.section || "Source"} - p.${citation.page_number}` : citation.section || "Source passage",
        confidence: confidencePercent(citation.confidence),
        quote: citation.quote
      }))
    : [];
  const confidence = response?.confidence ? `${confidencePercent(response.confidence)}%` : "Not calibrated";
  const evidence = response ? response.evidence_strength : "No question asked";
  const structuredAnswer = response
    ? buildAnswerSection({ answerText, citations, confidence, response })
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
      <div className="col-span-full"><AgenticIntegrations controls />{response && <div role="status" className="mt-3 rounded-xl border border-white/10 p-3 text-sm"><p>Result provider: {response.provider || "unavailable"} · Human review required</p><p>{response.confidence_basis || "Local demo matching is not calibrated confidence."}</p>{response.citation_coverage !== undefined && <p>Citation coverage: {Math.round(response.citation_coverage * 100)}%</p>}{response.execution && <><p>Execution {response.execution.id}: {response.execution.status}</p>{response.execution.steps.map((step, index) => <p key={index}>{step.name}: {step.status} ({step.provider})</p>)}</>}<p className="whitespace-pre-wrap">{response.direct_answer}</p></div>}</div>
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
            <div className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-100">{indexLabel}</div>
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
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-cyan-100"><CheckCircle2 size={16} /> {indexLabel}</div>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  indexLabel,
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
                {isAsking ? "Searching indexed documents and citations..." : error ? "Search failed" : response?.evidence_strength === "insufficient" || citations.length === 0 ? "No matching cited evidence" : "Cited answer complete"}
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










