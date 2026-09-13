"use client";

import { AgenticIntegrations } from "@/components/platform/agentic-integrations";
import { useState } from "react";
import { Database, ShieldCheck, Users } from "lucide-react";
import { DataTable } from "@/components/platform/data-table";
import { GlassCard } from "@/components/platform/cards";
import { SeverityBadge } from "@/components/platform/badges";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function loadDemoDataset() {
    setLoading(true);
    const response = await fetch("/api/demo/seed", { method: "POST" });
    setResult(await response.json());
    setLoading(false);
  }

  return (
    <div className="grid gap-5">
      <div><h1 className="text-3xl font-black">Admin Console</h1><p className="mt-2 text-slate-400">Users, roles, permissions, document access, audit logs, AI provider settings, site configuration, and system health.</p></div>
      <AgenticIntegrations controls />
      <p className="text-sm text-amber-200">Demo data: the sample users and access-rule examples below do not represent configured production accounts.</p>
      <GlassCard>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-semibold"><Database size={18} /> Demo Data Loader</h2>
            <p className="mt-2 text-sm text-slate-400">Loads files from `demo-data/` through the real ingestion, extraction, embedding, and graph pipeline.</p>
          </div>
          <button onClick={loadDemoDataset} disabled={loading} className="rounded-xl bg-blue-500 px-5 py-3 font-bold hover:bg-cyan-500 disabled:opacity-60">
            {loading ? "Loading Demo Dataset..." : "Load Demo Dataset"}
          </button>
        </div>
        {result ? <pre className="mt-4 max-h-80 overflow-auto rounded-xl bg-black/40 p-4 text-xs text-cyan-100">{JSON.stringify(result, null, 2)}</pre> : null}
      </GlassCard>
      <section className="grid gap-4 xl:grid-cols-2">
        <GlassCard><h2 className="mb-4 flex items-center gap-2 font-semibold"><Users size={18} /> Users and Roles</h2><DataTable columns={["User", "Role", "Plant", "Status"]} rows={[["Plant Manager", "Admin", "Plant A", <SeverityBadge key="a" value="Approved" />], ["Reliability Engineer", "Engineer", "Plant A", <SeverityBadge key="b" value="Approved" />], ["Compliance Auditor", "Auditor", "Plant A", <SeverityBadge key="c" value="Needs Review" />]]} /></GlassCard>
        <GlassCard><h2 className="mb-4 flex items-center gap-2 font-semibold"><ShieldCheck size={18} /> Document Access Rules</h2>{["Compliance records restricted to auditors and managers", "RCA drafts visible to reliability and maintenance", "Safety manuals visible to all plant roles", "AI answers audit logged with citations"].map((item) => <div key={item} className="mb-2 rounded-xl bg-white/[0.06] p-3 text-sm text-slate-300">{item}</div>)}</GlassCard>
      </section>

    </div>
  );
}
