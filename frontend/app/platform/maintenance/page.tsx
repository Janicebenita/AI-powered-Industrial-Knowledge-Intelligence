import { AssetHealthCard } from "@/components/platform/asset-health-card";
import { ChartCard, GlassCard, MetricCard } from "@/components/platform/cards";
import { DowntimeTrendChart, RiskDistributionChart, SeverityBarChart } from "@/components/charts/industrial-charts";
import { assets } from "@/lib/demo-data";

export default function MaintenancePage() {
  return (
    <div className="grid gap-5">
      <div><h1 className="text-3xl font-black">Maintenance Intelligence</h1><p className="mt-2 text-slate-400">Failure pattern analysis, predicted risks, backlog intelligence, MTBF, MTTR, and preventive maintenance scheduling.</p></div>
      <section className="grid gap-4 md:grid-cols-4"><MetricCard label="Repeated Patterns" value="7" delta="Seal failure is highest risk" tone="warning" /><MetricCard label="Backlog Items" value="42" delta="12 high severity" tone="warning" /><MetricCard label="Avg MTBF" value="76d" delta="+4d improvement" tone="success" /><MetricCard label="Avg MTTR" value="6.9h" delta="-1.2h quarter trend" tone="success" /></section>
      <section className="grid gap-4 xl:grid-cols-2"><ChartCard title="MTBF / MTTR Trend"><DowntimeTrendChart /></ChartCard><ChartCard title="Work Order Intelligence"><SeverityBarChart /></ChartCard></section>
      <section className="grid gap-4 lg:grid-cols-3">{assets.map((asset) => <AssetHealthCard key={asset.tag} asset={asset} />)}</section>
      <GlassCard><h2 className="mb-3 font-semibold">Preventive Maintenance Schedule</h2><div className="grid gap-3 md:grid-cols-3">{["P101 suction strainer inspection · 48h", "C201 oil contamination retest · 5d", "HX401 pressure test · 12d"].map((item) => <div key={item} className="rounded-xl bg-white/[0.06] p-4 text-sm text-slate-300">{item}</div>)}</div></GlassCard>
    </div>
  );
}
