"use client";

import { useEffect, useMemo, useState } from "react";
import { AssetHealthCard } from "@/components/platform/asset-health-card";
import { ChartCard, GlassCard } from "@/components/platform/cards";
import { GraphCanvas } from "@/components/graph/graph-canvas";
import { assets as demoAssets } from "@/lib/demo-data";
import { BackendAsset, fetchJson, toUiAsset } from "@/lib/operational";

type Asset360 = {
  asset: BackendAsset;
  failures: Array<{ occurred_on: string; failure_mode: string; severity: string; root_cause?: string }>;
  work_orders: Array<{ work_order_id: string; action: string; performed_on: string; status: string }>;
  inspections: Array<{ inspection_id: string; inspected_on: string; finding: string; severity: string }>;
  documents: Array<{ filename: string; doc_type: string; created_at: string }>;
  risk_drivers: string[];
};

export default function AssetsPage() {
  const [backendAssets, setBackendAssets] = useState<BackendAsset[]>([]);
  const [selectedTag, setSelectedTag] = useState("P-101");
  const [asset360, setAsset360] = useState<Asset360 | null>(null);

  useEffect(() => {
    void fetchJson<BackendAsset[]>("/api/assets", []).then((items) => {
      setBackendAssets(items);
      if (items[0]?.tag) {
        setSelectedTag(items[0].tag);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedTag) {
      void fetchJson<Asset360 | null>(`/api/assets/${encodeURIComponent(selectedTag)}`, null).then(setAsset360);
    }
  }, [selectedTag]);

  const assets = useMemo(() => {
    const mapped = backendAssets.map(toUiAsset);
    return mapped.length ? mapped : demoAssets;
  }, [backendAssets]);
  const selected = asset360?.asset ? toUiAsset(asset360.asset) : assets[0];

  return (
    <div className="grid gap-5">
      <GlassCard>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Industrial Digital Twin Profile</p>
            <h1 className="mt-2 text-4xl font-black">{selected.tag} - {selected.name}</h1>
            <p className="mt-2 text-slate-400">{selected.type} - {selected.location} - {selected.status}</p>
          </div>
          <select value={selectedTag} onChange={(event) => setSelectedTag(event.target.value)} className="rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3 outline-none">
            {backendAssets.map((asset) => <option key={asset.tag} value={asset.tag}>{asset.tag} - {asset.name}</option>)}
          </select>
        </div>
      </GlassCard>
      <section className="grid gap-4 lg:grid-cols-3">{assets.slice(0, 6).map((item) => <AssetHealthCard key={item.tag} asset={item} />)}</section>
      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassCard>
          <h2 className="mb-4 font-semibold">Failure / Maintenance Timeline</h2>
          {[...(asset360?.failures ?? []), ...(asset360?.work_orders ?? [])].slice(0, 8).map((item, index) => (
            <div key={index} className="mb-4 border-l-2 border-cyan-300/50 pl-4">
              <strong>{"occurred_on" in item ? item.occurred_on : item.performed_on}</strong>
              <p className="text-sm text-slate-400">{"failure_mode" in item ? `${item.failure_mode} - ${item.severity}` : `${item.action} - ${item.status}`}</p>
            </div>
          ))}
        </GlassCard>
        <ChartCard title="Related Asset Graph" subtitle="Documents, SOPs, failures, and compliance obligations"><GraphCanvas /></ChartCard>
      </section>
      <GlassCard>
        <h2 className="mb-3 font-semibold">AI Summary and Recommended Actions</h2>
        <p className="leading-7 text-slate-300">
          {selected.tag} has {asset360?.failures.length ?? 0} failures, {asset360?.work_orders.length ?? 0} work orders, {asset360?.inspections.length ?? 0} inspections, and {asset360?.documents.length ?? 0} linked documents.
          Recommended next action: {(asset360?.risk_drivers ?? [selected.nextAction]).join("; ")}.
        </p>
      </GlassCard>
    </div>
  );
}
