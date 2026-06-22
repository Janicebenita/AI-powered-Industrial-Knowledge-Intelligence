import { AlertTriangle, CheckCircle2, Clock, FileSearch, LucideIcon } from "lucide-react";
import { AssetHealthCard } from "@/components/platform/asset-health-card";
import { ChartCard, GlassCard, MetricCard } from "@/components/platform/cards";
import { ComplianceGauge, DowntimeTrendChart, QueryBreakdownChart, RiskDistributionChart, SeverityBarChart } from "@/components/charts/industrial-charts";
import { assets, coverageHeatmap, executiveMetrics } from "@/lib/demo-data";

export default function DashboardPage() {
  return (
    <div className="grid gap-5">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Executive Command Dashboard</p>
          <h1 className="mt-2 text-3xl font-black tracking-normal md:text-5xl">Plant Intelligence Cockpit</h1>
          <p className="mt-3 max-w-3xl text-slate-400">Mission-critical asset knowledge, compliance readiness, and AI-cited operational intelligence across Plant A.</p>
        </div>
        <div className="glass rounded-2xl px-4 py-3 text-sm text-emerald-200">System health: nominal · AI citations enforced</div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {executiveMetrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard title="Asset Risk Distribution" subtitle="Risk and reliability by critical equipment"><RiskDistributionChart /></ChartCard>
        <ChartCard title="Compliance Readiness Gauge" subtitle="Factory Act, OISD, PESO, SOP evidence coverage"><ComplianceGauge value={82} /></ChartCard>
      </section>
      <section className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Downtime Risk Trend" subtitle="Six-month risk and downtime movement" className="xl:col-span-2"><DowntimeTrendChart /></ChartCard>
        <ChartCard title="Maintenance Alerts by Severity"><SeverityBarChart /></ChartCard>
      </section>
      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <ChartCard title="AI Query Breakdown"><QueryBreakdownChart /></ChartCard>
        <GlassCard>
          <h2 className="mb-4 text-base font-semibold">Knowledge Coverage Heatmap</h2>
          <div className="grid gap-2">
            {coverageHeatmap.map(([area, docs, inspections, sop, compliance]) => (
              <div key={String(area)} className="grid grid-cols-[150px_repeat(4,minmax(0,1fr))] items-center gap-2 text-sm">
                <span className="text-slate-300">{area}</span>
                {[docs, inspections, sop, compliance].map((value, index) => <span key={index} className="rounded-lg py-2 text-center font-semibold" style={{ background: `rgba(6,182,212,${Number(value) / 180})` }}>{value}%</span>)}
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        {assets.slice(0, 3).map((asset) => <AssetHealthCard key={asset.tag} asset={asset} />)}
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
