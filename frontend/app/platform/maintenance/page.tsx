"use client";

import { useEffect, useMemo, useState } from "react";
import { AssetHealthCard } from "@/components/platform/asset-health-card";
import { ChartCard, GlassCard, MetricCard } from "@/components/platform/cards";
import { DowntimeTrendChart, SeverityBarChart } from "@/components/charts/industrial-charts";
import { assets as demoAssets } from "@/lib/demo-data";
import { fetchJson, MaintenanceResponse, toUiAsset } from "@/lib/operational";

const fallback: MaintenanceResponse = {
  assets: [],
  failure_patterns: [],
  incomplete_maintenance_history: [],
  high_risk_assets: []
};

export default function MaintenancePage() {
  const [maintenance, setMaintenance] = useState<MaintenanceResponse>(fallback);

  useEffect(() => {
    void fetchJson<MaintenanceResponse>("/api/maintenance", fallback).then(setMaintenance);
  }, []);

  const assets = useMemo(() => {
    const mapped = maintenance.assets.map(toUiAsset);
    return mapped.length ? mapped : demoAssets;
  }, [maintenance]);
  const repeated = maintenance.failure_patterns.filter((item) => item.count >= 2);

  return (
    <div className="grid gap-5">
      <div><h1 className="text-3xl font-black">Maintenance Intelligence</h1><p className="mt-2 text-slate-400">Live failure pattern analysis, risk assets, incomplete histories, and preventive maintenance scheduling.</p></div>
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Repeated Patterns" value={repeated.length} delta={repeated[0]?.failure_mode ? `${repeated[0].failure_mode} is highest risk` : "No repeated pattern"} tone="warning" />
        <MetricCard label="High-Risk Assets" value={maintenance.high_risk_assets.length} delta="Risk score >= 70" tone="warning" />
        <MetricCard label="Incomplete Histories" value={maintenance.incomplete_maintenance_history.length} delta="Need work-order evidence" tone="critical" />
        <MetricCard label="Indexed Assets" value={assets.length} delta="Live asset registry" tone="success" />
      </section>
      <section className="grid gap-4 xl:grid-cols-2"><ChartCard title="MTBF / MTTR Trend"><DowntimeTrendChart /></ChartCard><ChartCard title="Work Order Intelligence"><SeverityBarChart /></ChartCard></section>
      <section className="grid gap-4 lg:grid-cols-3">{assets.map((asset) => <AssetHealthCard key={asset.tag} asset={asset} />)}</section>
      <GlassCard>
        <h2 className="mb-3 font-semibold">Preventive Maintenance Schedule</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {(repeated.length ? repeated : maintenance.failure_patterns).slice(0, 3).map((item) => (
            <div key={item.failure_mode} className="rounded-xl bg-white/[0.06] p-4 text-sm text-slate-300">
              Review {item.failure_mode} pattern - {item.count} records
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
