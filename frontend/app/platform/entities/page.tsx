"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, SlidersHorizontal, X } from "lucide-react";
import { DataTable } from "@/components/platform/data-table";
import { GlassCard } from "@/components/platform/cards";
import { ConfidenceBadge, SeverityBadge } from "@/components/platform/badges";
import { BackendEntity, confidenceToPercent, fetchJson } from "@/lib/operational";

export default function EntitiesPage() {
  const [entities, setEntities] = useState<BackendEntity[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    void fetchJson<BackendEntity[]>("/api/entities", []).then(setEntities);
  }, []);

  const visibleEntities = useMemo(() => {
    const normalized = filter.toLowerCase();
    return entities
      .filter((entity) => `${entity.name} ${entity.entity_type} ${entity.filename}`.toLowerCase().includes(normalized))
      .slice(0, 120);
  }, [entities, filter]);

  return (
    <div className="grid gap-5">
      <GlassCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black">Entity Intelligence</h1>
            <p className="mt-2 text-slate-400">Live extracted industrial entities from uploaded and seeded documents.</p>
          </div>
          <div className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4">
            <SlidersHorizontal size={16} />
            <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter entities" className="bg-transparent text-sm outline-none placeholder:text-slate-500" />
          </div>
        </div>
      </GlassCard>
      <GlassCard>
        <DataTable
          columns={["Entity", "Type", "Confidence", "Source", "Page / Section", "Linked Asset", "Validation", "Actions"]}
          rows={visibleEntities.map((entity) => [
            <strong key="name">{entity.name}</strong>,
            entity.entity_type,
            <ConfidenceBadge key="conf" value={confidenceToPercent(entity.confidence)} />,
            entity.filename,
            "Source chunk",
            entity.entity_type === "Asset" ? entity.name : "Linked by graph",
            <SeverityBadge key="status" value={confidenceToPercent(entity.confidence) >= 85 ? "Approved" : "Needs Review"} />,
            <div key="actions" className="flex gap-2"><button className="rounded-lg bg-emerald-500/15 p-2 text-emerald-200"><Check size={15} /></button><button className="rounded-lg bg-red-500/15 p-2 text-red-200"><X size={15} /></button></div>
          ])}
        />
      </GlassCard>
    </div>
  );
}
