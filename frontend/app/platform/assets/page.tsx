import { AssetHealthCard } from "@/components/platform/asset-health-card";
import { ChartCard, GlassCard } from "@/components/platform/cards";
import { GraphCanvas } from "@/components/graph/graph-canvas";
import { assets, rcaTimeline } from "@/lib/demo-data";

export default function AssetsPage() {
  const asset = assets[0];
  return (
    <div className="grid gap-5">
      <GlassCard>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Industrial Digital Twin Profile</p>
        <h1 className="mt-2 text-4xl font-black">{asset.tag} · {asset.name}</h1>
        <p className="mt-2 text-slate-400">{asset.type} · {asset.location} · {asset.status}</p>
      </GlassCard>
      <section className="grid gap-4 lg:grid-cols-3">{assets.slice(0, 3).map((item) => <AssetHealthCard key={item.tag} asset={item} />)}</section>
      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassCard><h2 className="mb-4 font-semibold">Failure Timeline</h2>{rcaTimeline.map((item) => <div key={item.time} className="mb-4 border-l-2 border-cyan-300/50 pl-4"><strong>{item.time}</strong><p className="text-sm text-slate-400">{item.event}</p></div>)}</GlassCard>
        <ChartCard title="Related Asset Graph" subtitle="Documents, SOPs, failures, and compliance obligations"><GraphCanvas /></ChartCard>
      </section>
      <GlassCard><h2 className="mb-3 font-semibold">AI Summary and Recommended Actions</h2><p className="leading-7 text-slate-300">P101 has repeated seal failure associated with vibration anomaly, suction strainer fouling, and cavitation indicators. Recommended next actions: verify seal flush plan, inspect suction pressure and strainer DP, confirm alignment, and attach ISO-14224 failure taxonomy evidence.</p></GlassCard>
    </div>
  );
}
