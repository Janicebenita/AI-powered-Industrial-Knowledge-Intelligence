import { Check, SlidersHorizontal, X } from "lucide-react";
import { DataTable } from "@/components/platform/data-table";
import { GlassCard } from "@/components/platform/cards";
import { ConfidenceBadge, SeverityBadge } from "@/components/platform/badges";
import { entities } from "@/lib/demo-data";

export default function EntitiesPage() {
  return (
    <div className="grid gap-5">
      <GlassCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-3xl font-black">Entity Intelligence</h1><p className="mt-2 text-slate-400">Validate extracted industrial entities before they update the operational graph.</p></div>
          <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3"><SlidersHorizontal size={16} /> Filters</button>
        </div>
      </GlassCard>
      <GlassCard>
        <DataTable
          columns={["Entity", "Type", "Confidence", "Source", "Page / Section", "Linked Asset", "Validation", "Actions"]}
          rows={entities.map(([name, type, confidence, source, section, asset, status]) => [
            <strong key="name">{name}</strong>,
            type,
            <ConfidenceBadge key="conf" value={confidence} />,
            source,
            section,
            asset,
            <SeverityBadge key="status" value={status} />,
            <div key="actions" className="flex gap-2"><button className="rounded-lg bg-emerald-500/15 p-2 text-emerald-200"><Check size={15} /></button><button className="rounded-lg bg-red-500/15 p-2 text-red-200"><X size={15} /></button></div>
          ])}
        />
      </GlassCard>
    </div>
  );
}
