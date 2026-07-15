import Link from "next/link";
import { AlertTriangle, BrainCircuit, CheckCircle2, ClipboardCheck, Clock, Database, FileSearch, LucideIcon, PlayCircle, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { AssetHealthCard } from "@/components/platform/asset-health-card";
import { StatusBadge } from "@/components/platform/badges";
import { ChartCard, GlassCard, MetricCard } from "@/components/platform/cards";
import { EvidenceCard } from "@/components/platform/evidence-card";
import { ComplianceGauge, DowntimeTrendChart, QueryBreakdownChart, RiskDistributionChart, SeverityBarChart } from "@/components/charts/industrial-charts";
import { assets, coverageHeatmap, demoQuestions, executiveMetrics } from "@/lib/demo-data";

const demoSteps = [
  { title: "Load Evidence", body: "Manuals, SOPs, NCR, QA/QC, tender, inspections.", href: "/platform/admin", icon: Database },
  { title: "Ask P101 RCA", body: "Cited cause analysis for repeated seal failure.", href: "/platform/copilot", icon: BrainCircuit },
  { title: "Asset 360", body: "Risk, history, documents, open actions.", href: "/platform/assets", icon: FileSearch },
  { title: "Compliance", body: "Gaps, overdue evidence, audit readiness.", href: "/platform/compliance", icon: ShieldCheck },
  { title: "Export RCA", body: "Timeline, root causes, corrective actions.", href: "/platform/rca", icon: ClipboardCheck },
  { title: "Metrics", body: "Retrieval quality and citation coverage.", href: "/platform/evaluation", icon: CheckCircle2 }
];

const evidenceItems = [
  ["Method Statement", "Execution controls indexed.", 90],
  ["NCR Calibration", "ISO 9001 corrective action linked.", 96],
  ["QA/QC Manual", "Inspection controls searchable.", 91],
  ["Tender Document", "Scope and deliverables mapped.", 89]
] as const;

const plantStatus = [
  ["Plant Status", "Healthy", "success"],
  ["Intelligence Score", "97%", "info"],
  ["Today's Insights", "7", "warning"],
  ["Critical Risks", "2", "critical"],
  ["AI Confidence", "98%", "success"]
] as const;

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <section className="command-panel plant-os-bg relative overflow-hidden rounded-[2rem] p-6 md:p-8">
        <div className="absolute right-10 top-10 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-px w-2/3 bg-gradient-to-r from-transparent via-cyan-300/50 to-blue-400/0" />
        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px_360px] xl:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">
              <Sparkles size={14} /> Industrial Brain AI
            </div>
            <h1 className="max-w-4xl text-4xl font-black tracking-normal md:text-6xl">Transform Industrial Knowledge Into Operational Intelligence</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">The operating system for Plant A: cited AI, asset intelligence, maintenance decisions, compliance evidence, and executive control in one calm command surface.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/platform/copilot?question=Why%20has%20Pump%20P101%20failed%20repeatedly%3F" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-blue-500 px-5 text-sm font-bold text-white shadow-[0_0_32px_rgba(59,130,246,0.35)] transition hover:bg-cyan-500"><PlayCircle size={18} /> Run flagship demo</Link>
              <Link href="/platform/evaluation" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-5 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/15"><TrendingUp size={18} /> Show evidence metrics</Link>
            </div>
          </div>
          <div className="floating grid gap-3 rounded-[1.75rem] border border-white/10 bg-[#081320]/62 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <div className="flex items-center justify-between gap-3"><StatusBadge value="Healthy" /><span className="text-sm text-cyan-200">AI citations enforced</span></div>
            <div className="grid grid-cols-2 gap-3">
              {plantStatus.map(([label, value, tone]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.055] p-3">
                  <p className="text-xs text-slate-400">{label}</p>
                  <strong className={`mt-1 block text-2xl text-white ${tone === "critical" ? "text-red-100" : tone === "warning" ? "text-amber-100" : ""}`}>{value}</strong>
                </div>
              ))}
            </div>
            <p className="text-sm leading-6 text-slate-300">Latest finding: Pump P101 shows repeated seal failure pattern with cavitation evidence and incomplete ISO-14224 taxonomy linkage.</p>
          </div>
          <div className="radar-ring min-h-[260px] rounded-[1.75rem] border border-cyan-300/15 bg-cyan-300/[0.045]">
            <div className="relative z-[1] text-center">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Plant Risk Radar</p>
              <strong className="mt-2 block text-5xl font-black text-white">Low</strong>
              <p className="mt-2 text-sm text-slate-300">2 critical signals monitored</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="relative overflow-hidden bg-gradient-to-br from-blue-500/12 via-white/[0.06] to-cyan-400/10">
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-normal">Next-round demo runbook</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">A tight jury flow: ingest, ask, cite, analyze, export.</p>
            </div>
            <Link href="/platform/copilot" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-500 px-4 text-sm font-bold text-white shadow-[0_0_30px_rgba(59,130,246,0.32)] transition hover:bg-blue-400">
              <PlayCircle size={18} /> Start demo
            </Link>
          </div>
          <div className="relative mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {demoSteps.map(({ title, body, href, icon: StepIcon }, index) => (
              <Link key={title} href={href} className="rounded-2xl border border-white/10 bg-[#050816]/55 p-4 transition hover:border-cyan-300/30 hover:bg-white/[0.08]">
                <div className="mb-3 flex items-center gap-2 text-cyan-300"><span className="text-xs font-black">0{index + 1}</span><StepIcon size={18} /></div>
                <h3 className="text-sm font-bold text-white">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-400">{body}</p>
              </Link>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Judge Questions</h2>
              <p className="mt-1 text-sm text-slate-400">Evidence-first prompts for live judging.</p>
            </div>
            <Link href="/platform/evaluation" className="rounded-lg border border-cyan-300/20 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-300/10">View metrics</Link>
          </div>
          <div className="thin-scrollbar grid max-h-[430px] gap-2 overflow-auto pr-1">
            {demoQuestions.map(({ category, question }) => (
              <Link key={question} href={`/platform/copilot?question=${encodeURIComponent(question)}`} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200 transition hover:border-blue-400/40 hover:bg-blue-500/10">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-300">{category}</span>
                <span>{question}</span>
              </Link>
            ))}
          </div>
        </GlassCard>
      </section>

      <section>
        <SectionTitle eyebrow="Operational Health" title="Plant-wide command KPIs" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {executiveMetrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <SectionTitle eyebrow="Risk & Compliance" title="Risk distribution and readiness" />
          <ChartCard title="Asset Risk Distribution" subtitle="Risk and reliability by critical equipment"><RiskDistributionChart /></ChartCard>
        </div>
        <div className="pt-0 xl:pt-10">
          <ChartCard title="Compliance Readiness Gauge" subtitle="Factory Act, OISD, PESO, SOP evidence coverage"><ComplianceGauge value={82} /></ChartCard>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionTitle eyebrow="AI Findings" title="Emerging risk and query intelligence" />
          <ChartCard title="Downtime Risk Trend" subtitle="Six-month risk and downtime movement"><DowntimeTrendChart /></ChartCard>
        </div>
        <div className="pt-0 xl:pt-10">
          <ChartCard title="Maintenance Alerts by Severity"><SeverityBarChart /></ChartCard>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionTitle eyebrow="AI Workload" title="Copilot query mix" />
          <ChartCard title="AI Query Breakdown"><QueryBreakdownChart /></ChartCard>
        </div>
        <div className="pt-0 xl:pt-10">
          <GlassCard>
            <h2 className="mb-4 text-base font-semibold">Knowledge Coverage Heatmap</h2>
            <div className="grid gap-2 overflow-x-auto pb-1">
              {coverageHeatmap.map(([area, docs, inspections, sop, compliance]) => (
                <div key={String(area)} className="grid min-w-[560px] grid-cols-[150px_repeat(4,minmax(0,1fr))] items-center gap-2 text-sm">
                  <span className="text-slate-300">{area}</span>
                  {[docs, inspections, sop, compliance].map((value, index) => <span key={index} className="rounded-lg border border-white/10 py-2 text-center font-semibold" style={{ background: `rgba(6,182,212,${Number(value) / 190})` }}>{value}%</span>)}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Asset Intelligence" title="Critical asset health" />
        <div className="grid gap-4 lg:grid-cols-3">
          {assets.slice(0, 3).map((asset) => <AssetHealthCard key={asset.tag} asset={asset} />)}
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Recent Evidence" title="Newly indexed judge evidence pack" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {evidenceItems.map(([title, description, confidence]) => <EvidenceCard key={title} title={title} description={description} confidence={confidence} />)}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {([
          ["Repeated failure patterns", "P101 seal failure and cavitation recurrence", AlertTriangle],
          ["Citation coverage", "97% of AI answers include source documents", CheckCircle2],
          ["Time saved", "418 engineering hours recovered this quarter", Clock],
          ["Critical evidence gaps", "NFPA-70E and API-510 packages need owners", FileSearch]
        ] as Array<[string, string, LucideIcon]>).map(([title, body, ItemIcon]) => <GlassCard key={title}><ItemIcon className="mb-4 text-cyan-300" /><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm text-slate-400">{body}</p></GlassCard>)}
      </section>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-3">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-black tracking-normal text-white">{title}</h2>
    </div>
  );
}

