import { Search } from "lucide-react";
import { GraphCanvas } from "@/components/graph/graph-canvas";
import { GlassCard } from "@/components/platform/cards";
import { SeverityBadge } from "@/components/platform/badges";

export default function GraphPage() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <GlassCard>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-3xl font-black">Knowledge Graph Explorer</h1><p className="mt-2 text-slate-400">Asset-centered graph traversal with risk-colored nodes and animated evidence edges.</p></div>
          <div className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm text-slate-300"><Search size={16} /> Search graph</div>
        </div>
        <GraphCanvas />
      </GlassCard>
      <aside className="grid h-fit gap-4">
        <GlassCard><h2 className="mb-3 font-semibold">Selected Node</h2><p className="text-xl font-bold">P101</p><p className="text-sm text-slate-400">Condensate Transfer Pump · Unit A</p><div className="mt-4"><SeverityBadge value="Critical" /></div></GlassCard>
        <GlassCard><h2 className="mb-3 font-semibold">Filters</h2>{["Equipment", "Documents", "Failures", "SOPs", "Inspections", "Regulations", "Engineers", "Spare Parts", "Compliance Gaps"].map((item) => <label key={item} className="mb-2 flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" defaultChecked /> {item}</label>)}</GlassCard>
      </aside>
    </div>
  );
}
