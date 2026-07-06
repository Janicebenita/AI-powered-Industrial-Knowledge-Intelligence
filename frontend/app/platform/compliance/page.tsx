import { FileWarning, PackageCheck, ShieldCheck } from "lucide-react";
import { ComplianceGauge } from "@/components/charts/industrial-charts";
import { DataTable } from "@/components/platform/data-table";
import { ChartCard, GlassCard, MetricCard } from "@/components/platform/cards";
import { SeverityBadge } from "@/components/platform/badges";
import { complianceRows } from "@/lib/demo-data";

export default function CompliancePage() {
  return (
    <div className="grid gap-5">
      <section className="command-panel rounded-3xl p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Compliance Intelligence</p>
        <h1 className="mt-2 text-4xl font-black tracking-normal">Audit Readiness Cockpit</h1>
        <p className="mt-2 max-w-3xl text-slate-400">Factory Act, OISD, PESO, environmental, quality, and internal SOP evidence mapped to assets and controls.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-4"><MetricCard label="Compliance Score" value="82%" delta="3 critical gaps" tone="warning" /><MetricCard label="Audit Readiness" value="Partial" delta="Evidence package building" tone="warning" /><MetricCard label="Missing Evidence" value="9" delta="2 critical documents" tone="critical" /><MetricCard label="Overdue Inspections" value="5" delta="V203 pressure test due" tone="warning" /></section>
      <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]"><ChartCard title="Compliance Readiness"><ComplianceGauge value={82} /></ChartCard><GlassCard><h2 className="mb-4 font-semibold">Regulation-to-Document Mapping</h2><DataTable columns={["Standard", "Score", "Detected Gap", "Risk"]} rows={complianceRows.map((row) => [row.standard, `${row.score}%`, row.gap, <SeverityBadge key={row.standard} value={row.risk} />])} /></GlassCard></section>
      <section className="grid gap-4 md:grid-cols-3">
        <GlassCard><ShieldCheck className="mb-4 text-emerald-300" /><h3 className="font-bold">Mapped Controls</h3><p className="mt-2 text-sm leading-6 text-slate-400">SOPs, inspection reports, NCRs, QA/QC records, and tender obligations are linked to evidence packages.</p></GlassCard>
        <GlassCard><FileWarning className="mb-4 text-amber-300" /><h3 className="font-bold">Missing Evidence</h3><p className="mt-2 text-sm leading-6 text-slate-400">V203 pressure test evidence, EP501 arc flash updates, and HX401 NCR closure need owners.</p></GlassCard>
        <GlassCard><button className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-blue-500 px-5 font-bold transition hover:bg-cyan-500"><PackageCheck size={18} /> Build Audit Evidence Package</button><p className="mt-3 text-sm leading-6 text-slate-400">Exportable audit package with source citations, gaps, owners, and due dates.</p></GlassCard>
      </section>
    </div>
  );
}
