import type { IndustrialAsset } from "@/lib/demo-data";
import { RiskBadge, SeverityBadge } from "@/components/platform/badges";
import { GlassCard } from "@/components/platform/cards";

export function AssetHealthCard({ asset }: { asset: IndustrialAsset }) {
  return (
    <GlassCard className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-300/0 via-cyan-300/50 to-cyan-300/0" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black text-white">{asset.tag}</h3>
            <RiskBadge value={asset.riskScore} />
          </div>
          <p className="mt-1 break-words text-sm text-slate-400">{asset.name}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">{asset.location}</p>
        </div>
        <SeverityBadge value={asset.complianceStatus} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3"><span className="text-slate-400">Risk score</span><strong className="block text-2xl text-white">{asset.riskScore}</strong></div>
        <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3"><span className="text-slate-400">Reliability</span><strong className="block text-2xl text-white">{asset.reliabilityScore}</strong></div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {asset.failureModes.slice(0, 3).map((mode) => <span key={mode} className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs text-slate-300">{mode}</span>)}
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-300"><span className="font-semibold text-cyan-200">Recommended action:</span> {asset.nextAction}</p>
    </GlassCard>
  );
}
