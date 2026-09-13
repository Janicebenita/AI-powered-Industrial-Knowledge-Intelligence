"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, BadgeCheck, BarChart3, CheckCircle2, Database, FileSearch, LucideIcon, ShieldCheck, Target } from "lucide-react";
import { GlassCard, MetricCard } from "@/components/platform/cards";
import { api } from "@/services/api";

type EvaluationMetrics = {
  provider?: string;
  demo?: boolean;
  documents_processed: number;
  entity_extraction_precision_estimate: number | null;
  entity_extraction_recall_estimate: number | null;
  chunk_retrieval_quality: number | null;
  citation_coverage: number | null;
  unanswered_due_to_insufficient_evidence: number;
  compliance_gaps_found: number | null;
  repeated_failure_patterns_detected: number | null;
};

const scoreItems = [
  { key: "entity_extraction_precision_estimate", label: "Entity Precision", description: "Estimated from extracted entity validation and asset-tag recognition." },
  { key: "entity_extraction_recall_estimate", label: "Entity Recall", description: "Estimated from seeded ground-truth asset and failure-mode coverage." },
  { key: "chunk_retrieval_quality", label: "Retrieval Quality", description: "Measures whether top chunks contain overlapping industrial evidence." },
  { key: "citation_coverage", label: "Citation Coverage", description: "Share of copilot answers backed by source citations." }
] as const;

const guardrails: Array<{ icon: LucideIcon; title: string; body: string }> = [
  { icon: CheckCircle2, title: "Citations Required", body: "Copilot answers must include source documents, page or section, and confidence." },
  { icon: FileSearch, title: "Evidence First", body: "Answers are grounded in retrieved chunks from manuals, SOPs, work orders, and inspections." },
  { icon: Database, title: "Pipeline Metrics", body: "Evaluation is read from backend records, not static dashboard decorations." },
  { icon: BarChart3, title: "Judge Proof", body: "One screen explains extraction quality, retrieval quality, gaps, and patterns." }
];

function pct(value: number | null) {
  if (value === null) return "Not measured";
  return `${Math.round(value * 100)}%`;
}

function ScoreBar({ label, value, description }: { label: string; value: number | null; description: string }) {
  const tone = (value ?? 0) >= 0.9 ? "from-emerald-400 to-cyan-300" : (value ?? 0) >= 0.78 ? "from-blue-500 to-cyan-400" : "from-amber-400 to-orange-500";
  return (
    <GlassCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <strong className="mt-2 block text-3xl font-black">{pct(value)}</strong>
        </div>
        <BadgeCheck className="text-cyan-300" />
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${Math.min(100, Math.max(0, (value ?? 0) * 100))}%` }} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
    </GlassCard>
  );
}

export default function EvaluationPage() {
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api<EvaluationMetrics>("/evaluation")
      .then((data) => {
        if (mounted) setMetrics(data);
      })
      .catch((err: Error) => {
        if (mounted) setError(err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);


  if (loading) {
    return (
      <div className="grid gap-5">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Evaluation Metrics</p>
          <h1 className="mt-2 text-3xl font-black tracking-normal md:text-5xl">Evidence Quality Console</h1>
        </section>
        <div className="grid gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <div key={item} className="glass h-40 animate-pulse rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="grid gap-5">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Evaluation Metrics</p>
          <h1 className="mt-2 text-3xl font-black tracking-normal md:text-5xl">Evidence Quality Console</h1>
          <p className="mt-3 max-w-3xl text-slate-400">Sign in through Admin for integration metrics. Legacy demo metrics require the separate local FastAPI service.</p>
        </section>
        <GlassCard className="border-amber-400/30 bg-amber-400/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 text-amber-300" />
            <div>
              <h2 className="font-bold text-amber-100">Evaluation API unavailable</h2>
              <p className="mt-2 text-sm text-slate-300">{error || "No metrics returned from /api/evaluation."}</p>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Evaluation Metrics</p>
          <h1 className="mt-2 text-3xl font-black tracking-normal md:text-5xl">Evidence Quality Console</h1>
          <p className="mt-3 max-w-3xl text-slate-400">Recorded evidence and execution metrics. Unmeasured quality values remain unavailable; legacy estimates are demo data.</p>
        </div>
        <div className="glass rounded-2xl px-4 py-3 text-sm text-emerald-200">Provider: {metrics.provider || "Legacy demo"}</div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Documents Processed" value={metrics.documents_processed} delta="Seeded and uploaded evidence corpus" tone="info" />
        <MetricCard label="Compliance Gaps Found" value={metrics.compliance_gaps_found ?? "Not measured"} delta="Mapped to checklist evidence" tone="warning" />
        <MetricCard label="Repeated Failure Patterns" value={metrics.repeated_failure_patterns_detected ?? "Not measured"} delta="Detected from work orders" tone="critical" />
        <MetricCard label="Insufficient Evidence Refusals" value={metrics.unanswered_due_to_insufficient_evidence} delta="No-citation answers blocked" tone="success" />
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {scoreItems.map((item) => <ScoreBar key={item.key} label={item.label} value={metrics[item.key]} description={item.description} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <GlassCard>
          <div className="mb-5 flex items-center gap-3">
            <Target className="text-cyan-300" />
            <div>
              <h2 className="text-lg font-bold">What The Metrics Mean</h2>
              <p className="text-sm text-slate-400">Integration totals come from scoped retained evidence and execution records. Legacy values are prototype/demo estimates.</p>
            </div>
          </div>
          <div className="grid gap-3 text-sm text-slate-300">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4"><strong className="text-white">Precision estimate:</strong> requires a labelled validation set; not measured by the integrations.</div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4"><strong className="text-white">Recall estimate:</strong> requires labelled expected entities; not measured by the integrations.</div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4"><strong className="text-white">Retrieval quality:</strong> requires a relevance evaluation; do not infer it from vector similarity alone.</div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4"><strong className="text-white">Citation coverage:</strong> claims with validated citation IDs divided by all stored claims. This is not a correctness probability.</div>
          </div>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-cyan-400/10 via-white/[0.06] to-blue-500/10">
          <div className="mb-5 flex items-center gap-3">
            <ShieldCheck className="text-emerald-300" />
            <div>
              <h2 className="text-lg font-bold">Selection-Ready Guardrails</h2>
              <p className="text-sm text-slate-400">Operational questions are blocked when the system cannot cite plant evidence.</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {guardrails.map(({ icon: GuardIcon, title, body }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-[#050816]/50 p-4">
                <GuardIcon className="mb-3 text-cyan-300" />
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </div>
  );
}

