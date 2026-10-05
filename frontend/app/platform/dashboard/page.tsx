import Link from "next/link";
import { ArrowRight, ArrowUpRight, AlertTriangle, BrainCircuit, CheckCircle2, ClipboardCheck, Clock, Database, FileSearch, ShieldCheck, PlayCircle, Sparkles, Layers, type LucideIcon } from "lucide-react";
import { AssetHealthCard } from "@/components/platform/asset-health-card";
import { ChartCard, GlassCard } from "@/components/platform/cards";
import { EvidenceCard } from "@/components/platform/evidence-card";
import { DashboardTabs } from "@/components/platform/dashboard-tabs";
import { DashboardAssets } from "@/components/platform/dashboard-assets";
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
const metricIcons = [FileSearch, Layers, ShieldCheck, AlertTriangle, ClipboardCheck, BrainCircuit, Database, Clock];

export default function DashboardPage() {
  return <div className="dashboard-content">
    <section className="dashboard-heading">
      <div><p className="eyebrow"><span /> PLANT A · EXECUTIVE WORKSPACE</p><h1>Intelligence at a glance<span>.</span></h1><p>Your knowledge, risk and operational priorities. One clear view.</p></div>
      <div className="dashboard-actions"><Link href="/platform/reports" className="action-secondary"><FileSearch size={18} />View reports</Link><Link href="/platform/copilot?question=Why%20has%20Pump%20P101%20failed%20repeatedly%3F" className="action-primary"><Sparkles size={18} />Ask Copilot<ArrowUpRight size={17} /></Link></div>
    </section>
    <div className="kpi-grid" aria-label="Illustrative operational metrics">{executiveMetrics.slice(0, 4).map((metric, index) => <DashboardMetric key={metric.label} metric={metric} icon={metricIcons[index]} />)}</div>
    <DashboardTabs panels={{
      overview: <div className="dashboard-grid">
        <div className="span-8"><ChartCard title="Asset risk & reliability" subtitle="Compare critical equipment · illustrative scores"><RiskDistributionChart light /></ChartCard></div>
        <div className="span-4"><ChartCard title="Compliance readiness" subtitle="Illustrative evidence coverage"><ComplianceGauge value={82} light /><Link className="panel-link" href="/platform/compliance">Review compliance gaps<ArrowRight size={17} /></Link></ChartCard></div>
        <div className="span-8"><DashboardAssets /></div>
        <div className="span-4"><GlassCard className="priority-panel"><div className="panel-heading"><span className="icon-badge"><BrainCircuit size={21} /></span><div><p className="eyebrow">INTELLIGENCE BRIEF</p><h2>What needs your attention</h2></div></div><div className="finding-item"><span className="finding-marker" /><div><span className="finding-label">REPEATED FAILURE · P101</span><h3>A pattern worth investigating</h3><p>Pump P101 shows repeated seal failure with cavitation evidence and incomplete ISO-14224 taxonomy linkage.</p><Link href="/platform/copilot?question=Why%20has%20Pump%20P101%20failed%20repeatedly%3F">Explore cited causes<ArrowUpRight size={16} /></Link></div></div><div className="finding-item"><span className="finding-marker amber" /><div><span className="finding-label">EVIDENCE GAPS</span><h3>Close the documentation loop</h3><p>NFPA-70E and API-510 packages need owners. Review source evidence before approval.</p><Link href="/platform/compliance">Review open gaps<ArrowUpRight size={16} /></Link></div></div><div className="brief-footer"><ShieldCheck size={17} />Illustrative findings · human review required</div></GlassCard></div>
      </div>,
      analytics: <div className="grid gap-5"><SectionTitle eyebrow="OPERATIONAL ANALYTICS" title="See the wider picture" /><div className="kpi-grid">{executiveMetrics.slice(4).map((metric, index) => <DashboardMetric key={metric.label} metric={metric} icon={metricIcons[index + 4]} />)}</div><div className="dashboard-grid"><div className="span-8"><ChartCard title="Downtime risk trend" subtitle="Six-month illustrative risk and downtime movement"><DowntimeTrendChart light /></ChartCard></div><div className="span-4"><ChartCard title="Maintenance alert severity" subtitle="Illustrative alert distribution"><SeverityBarChart light /></ChartCard></div><div className="span-4"><ChartCard title="Copilot query mix" subtitle="Illustrative query categories"><QueryBreakdownChart light /></ChartCard></div><div className="span-8"><CoverageHeatmap /></div></div></div>,
      assets: <div className="grid gap-5"><SectionTitle eyebrow="ASSET INTELLIGENCE" title="Critical asset health" /><div className="grid gap-5 xl:grid-cols-3">{assets.slice(0, 3).map(asset => <AssetHealthCard key={asset.tag} asset={asset} />)}</div><DashboardAssets /><GlassCard><SectionTitle eyebrow="EXISTING DEMO SNAPSHOT" title="Plant status & intelligence" /><p className="mb-5 text-slate-400">These are the existing illustrative status indicators, not live provider measurements.</p><div className="snapshot-grid">{[["Plant Status", "Demo: nominal"], ["Intelligence Score", "97%"], ["Today's Insights", "7"], ["Critical signals monitored", "2"], ["AI Confidence", "98%"], ["Plant Risk Radar", "Low"]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></GlassCard></div>,
      evidence: <div className="grid gap-5"><SectionTitle eyebrow="RECENT EVIDENCE" title="The knowledge behind the decisions" /><p className="section-description">Existing illustrative judge evidence pack. Open Engineering Docs to work with source documents.</p><div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">{evidenceItems.map(([title, description, confidence]) => <EvidenceCard key={title} title={title} description={description} confidence={confidence} />)}</div><CoverageHeatmap /><div className="grid gap-5 md:grid-cols-2">{([ ["Citation coverage", "97% of AI answers include source documents", CheckCircle2], ["Time saved", "418 engineering hours recovered this quarter", Clock] ] as Array<[string, string, LucideIcon]>).map(([title, body, Icon]) => <GlassCard key={title}><div className="panel-heading"><span className="icon-badge"><Icon size={22} /></span><h2>{title}</h2></div><p className="mt-3">{body}</p><p className="mt-2 text-slate-400">Illustrative demo metric, not measured production performance.</p></GlassCard>)}</div><Link className="panel-link" href="/platform/documents">Open Engineering Docs<ArrowRight size={18} /></Link></div>,
      demo: <div className="dashboard-grid"><div className="span-7"><GlassCard><div className="panel-heading justify-between"><div><p className="eyebrow">GUIDED EXPLORATION</p><h2>Next-round demo runbook</h2></div><Link href="/platform/copilot" className="action-primary"><PlayCircle size={18} />Start demo</Link></div><p className="mt-4 text-slate-400">Transform Industrial Knowledge Into Operational Intelligence. Ingest, ask, cite, analyze, export.</p><div className="runbook-grid">{demoSteps.map(({ title, body, href, icon: Icon }, index) => <Link key={title} href={href}><div><span className="icon-badge"><Icon size={21} /></span><span className="step-number">0{index + 1}</span></div><h3>{title}</h3><p>{body}</p><ArrowUpRight className="step-arrow" size={18} /></Link>)}</div></GlassCard></div><div className="span-5"><GlassCard><div className="panel-heading justify-between"><h2>Judge Questions</h2><Link className="panel-link" href="/platform/evaluation">View metrics<ArrowUpRight size={16} /></Link></div><p className="mt-3 text-slate-400">Evidence-first prompts for live judging.</p><div className="judge-questions thin-scrollbar">{demoQuestions.map(({ category, question }) => <Link key={question} href={`/platform/copilot?question=${encodeURIComponent(question)}`}><span>{category}</span><strong>{question}</strong><ArrowUpRight size={17} /></Link>)}</div></GlassCard></div></div>
    }} />
    <footer className="dashboard-footer"><span><ShieldCheck size={16} />Evidence-informed. Human-governed.</span><span>Illustrative data · Plant A workspace</span></footer>
  </div>;
}

function DashboardMetric({ metric, icon: Icon }: { metric: typeof executiveMetrics[number]; icon: LucideIcon }) {
  return <article className="dashboard-kpi" data-tone={metric.tone}><div className="kpi-top"><span className="icon-badge"><Icon size={21} aria-hidden="true" /></span><span className="demo-tag">Demo</span></div><p>{metric.label}</p><div className="kpi-value">{metric.value}</div><span className="kpi-detail">{metric.delta}</span></article>;
}
function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div><p className="eyebrow">{eyebrow}</p><h2 className="section-title">{title}</h2></div>;
}
function CoverageHeatmap() {
  return <GlassCard><div className="panel-heading"><span className="icon-badge"><Database size={21} /></span><div><h2>Knowledge coverage</h2><p className="text-slate-400">Illustrative evidence completeness by equipment family</p></div></div><div className="table-scroll"><table className="coverage-table"><caption className="sr-only">Demo coverage percentages by equipment type and evidence category</caption><thead><tr><th scope="col">Equipment</th>{["Documents", "Inspections", "SOPs", "Compliance"].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{coverageHeatmap.map(([area, ...values]) => <tr key={String(area)}><th scope="row">{area}</th>{values.map((value, index) => <td key={index}><span style={{ background: `rgba(13, 148, 136, ${Number(value) / 550})` }}>{value}%</span></td>)}</tr>)}</tbody></table></div></GlassCard>;
}
