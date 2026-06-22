import { PackageCheck } from "lucide-react";
import { ComplianceGauge } from "@/components/charts/industrial-charts";
import { DataTable } from "@/components/platform/data-table";
import { ChartCard, GlassCard, MetricCard } from "@/components/platform/cards";
import { SeverityBadge } from "@/components/platform/badges";
import { complianceRows } from "@/lib/demo-data";

export default function CompliancePage() {
  return (
    <div className="grid gap-5">
      <div><h1 className="text-3xl font-black">Compliance Intelligence</h1><p className="mt-2 text-slate-400">Factory Act, OISD, PESO, environmental, quality, and internal SOP audit readiness.</p></div>
      <section className="grid gap-4 md:grid-cols-4"><MetricCard label="Compliance Score" value="82%" delta="3 critical gaps" tone="warning" /><MetricCard label="Audit Readiness" value="Partial" delta="Evidence package building" tone="warning" /><MetricCard label="Missing Evidence" value="9" delta="2 critical documents" tone="critical" /><MetricCard label="Overdue Inspections" value="5" delta="V203 pressure test due" tone="warning" /></section>
      <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]"><ChartCard title="Compliance Readiness"><ComplianceGauge value={82} /></ChartCard><GlassCard><h2 className="mb-4 font-semibold">Regulation-to-Document Mapping</h2><DataTable columns={["Standard", "Score", "Detected Gap", "Risk"]} rows={complianceRows.map((row) => [row.standard, `${row.score}%`, row.gap, <SeverityBadge key={row.standard} value={row.risk} />])} /></GlassCard></section>
      <GlassCard><button className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 font-bold hover:bg-cyan-500"><PackageCheck size={18} /> Build Audit Evidence Package</button></GlassCard>
    </div>
  );
}
