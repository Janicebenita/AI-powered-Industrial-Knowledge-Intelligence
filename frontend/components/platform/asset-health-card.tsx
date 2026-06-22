import type { IndustrialAsset } from "@/lib/demo-data";
import { SeverityBadge } from "@/components/platform/badges";
import { GlassCard } from "@/components/platform/cards";

export function AssetHealthCard({ asset }: { asset: IndustrialAsset }) {
  return (
    <GlassCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">{asset.tag}</h3>
          <p className="mt-1 text-sm text-slate-400">{asset.name} · {asset.location}</p>
        </div>
        <SeverityBadge value={asset.riskScore >= 80 ? "Critical" : asset.riskScore >= 70 ? "High" : asset.riskScore >= 55 ? "Medium" : "Low"} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-white/[0.05] p-3"><span className="text-slate-400">Risk</span><strong className="block text-2xl">{asset.riskScore}</strong></div>
        <div className="rounded-xl bg-white/[0.05] p-3"><span className="text-slate-400">Reliability</span><strong className="block text-2xl">{asset.reliabilityScore}</strong></div>
      </div>
      <p className="mt-4 text-sm text-slate-300">{asset.nextAction}</p>
    </GlassCard>
  );
}
