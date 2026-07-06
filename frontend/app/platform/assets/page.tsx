import { AlertTriangle, ClipboardCheck, FileText, LucideIcon, ShieldCheck, Wrench } from "lucide-react";
import { AssetHealthCard } from "@/components/platform/asset-health-card";
import { RiskBadge, SeverityBadge } from "@/components/platform/badges";
import { ChartCard, GlassCard, MetricCard } from "@/components/platform/cards";
import { GraphCanvas } from "@/components/graph/graph-canvas";
import { assets, rcaTimeline } from "@/lib/demo-data";

export default function AssetsPage() {
  const asset = assets[0];
  return (
    <div className="grid gap-5">
      <section className="command-panel rounded-3xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Industrial Digital Twin Profile</p>
            <h1 className="mt-2 text-4xl font-black tracking-normal">{asset.tag} - {asset.name}</h1>
            <p className="mt-2 text-slate-400">{asset.type} - {asset.location} - {asset.status}</p>
          </div>
          <div className="flex flex-wrap gap-2"><RiskBadge value={asset.riskScore} /><SeverityBadge value={asset.complianceStatus} /></div>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Risk Score" value={asset.riskScore} delta="Seal failure recurrence" tone="critical" />
        <MetricCard label="Reliability" value={`${asset.reliabilityScore}%`} delta="Below fleet target" tone="warning" trend="down" />
        <MetricCard label="MTBF" value={`${asset.mtbf}d`} delta="Repeated failures" tone="warning" />
        <MetricCard label="MTTR" value={`${asset.mttr}h`} delta="Maintenance window" tone="info" />
      </section>
      <section className="grid gap-4 lg:grid-cols-3">{assets.slice(0, 3).map((item) => <AssetHealthCard key={item.tag} asset={item} />)}</section>
      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassCard>
          <h2 className="mb-4 text-lg font-bold">Failure Timeline</h2>
          {rcaTimeline.map((item) => <div key={item.time} className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"><strong className="text-cyan-200">{item.time}</strong><p className="mt-1 text-sm leading-6 text-slate-400">{item.event}</p></div>)}
        </GlassCard>
        <ChartCard title="Related Asset Graph" subtitle="Documents, SOPs, failures, and compliance obligations"><GraphCanvas /></ChartCard>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {([
          [Wrench, "Open Issues", "Seal leakage, cavitation symptoms, and vibration anomaly remain under RCA."],
          [FileText, "Linked SOPs", "Pump isolation, LOTO, and seal flush inspection procedures are attached."],
          [ShieldCheck, "Compliance Evidence", "ISO-14224 taxonomy and permit evidence are partially complete."],
          [AlertTriangle, "Recommended Action", asset.nextAction]
        ] as Array<[LucideIcon, string, string]>).map(([ItemIcon, title, body]) => <GlassCard key={title}><ItemIcon className="mb-4 text-cyan-300" /><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{body}</p></GlassCard>)}
      </section>
      <GlassCard><h2 className="mb-3 flex items-center gap-2 font-semibold"><ClipboardCheck size={18} /> AI Summary and Recommended Actions</h2><p className="leading-7 text-slate-300">P101 has repeated seal failure associated with vibration anomaly, suction strainer fouling, and cavitation indicators. Recommended next actions: verify seal flush plan, inspect suction pressure and strainer DP, confirm alignment, and attach ISO-14224 failure taxonomy evidence.</p></GlassCard>
    </div>
  );
}


