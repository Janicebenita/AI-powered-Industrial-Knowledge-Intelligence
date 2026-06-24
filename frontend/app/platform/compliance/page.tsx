"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, PackageCheck } from "lucide-react";
import { ComplianceGauge } from "@/components/charts/industrial-charts";
import { DataTable } from "@/components/platform/data-table";
import { ChartCard, GlassCard, MetricCard } from "@/components/platform/cards";
import { SeverityBadge } from "@/components/platform/badges";
import { ComplianceResponse, fetchJson } from "@/lib/operational";

const fallback: ComplianceResponse = {
  covered: [],
  gaps: [],
  audit_summary: "No compliance data loaded.",
  missing_documents: []
};

export default function CompliancePage() {
  const [compliance, setCompliance] = useState<ComplianceResponse>(fallback);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void fetchJson<ComplianceResponse>("/api/compliance", fallback).then(setCompliance);
  }, []);

  const score = useMemo(() => {
    const total = compliance.covered.length + compliance.gaps.length;
    return total ? Math.round((compliance.covered.length / total) * 100) : 0;
  }, [compliance]);

  async function downloadEvidencePackage() {
    setDownloading(true);
    setMessage("");
    try {
      const response = await fetch("/api/reports/download/audit-package");
      if (!response.ok) throw new Error(`Download failed with HTTP ${response.status}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Q2_Compliance_Evidence_Package.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage("Audit evidence package generated and downloaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not generate evidence package.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="grid gap-5">
      <div><h1 className="text-3xl font-black">Compliance Intelligence</h1><p className="mt-2 text-slate-400">Live Factory Act, OISD, PESO, environmental, quality, and internal SOP audit readiness.</p></div>
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Compliance Score" value={`${score}%`} delta={compliance.audit_summary} tone={score >= 80 ? "success" : "warning"} />
        <MetricCard label="Audit Readiness" value={score >= 80 ? "Ready" : "Partial"} delta="Evidence package available" tone={score >= 80 ? "success" : "warning"} />
        <MetricCard label="Missing Evidence" value={compliance.missing_documents.length} delta="Clauses without evidence" tone={compliance.missing_documents.length ? "critical" : "success"} />
        <MetricCard label="Detected Gaps" value={compliance.gaps.length} delta="Requires owner review" tone={compliance.gaps.length ? "warning" : "success"} />
      </section>
      <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <ChartCard title="Compliance Readiness"><ComplianceGauge value={score} /></ChartCard>
        <GlassCard>
          <h2 className="mb-4 font-semibold">Regulation-to-Document Mapping</h2>
          <DataTable
            columns={["Clause", "Applies To", "Detected Gap", "Risk"]}
            rows={compliance.gaps.map((row) => [
              row.clause,
              row.applies_to,
              row.gap,
              <SeverityBadge key={row.clause} value={row.evidence.length ? "Medium" : "Critical"} />
            ])}
          />
        </GlassCard>
      </section>
      <GlassCard>
        <button disabled={downloading} onClick={() => void downloadEvidencePackage()} className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 font-bold hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60">
          {downloading ? <Loader2 className="animate-spin" size={18} /> : <PackageCheck size={18} />} Build Audit Evidence Package
        </button>
        {message ? <p className="mt-3 text-sm text-slate-300">{message}</p> : null}
      </GlassCard>
    </div>
  );
}
