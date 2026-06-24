"use client";

import { useState } from "react";
import { CheckCircle2, Download, FileText, Loader2, XCircle } from "lucide-react";
import { GlassCard } from "@/components/platform/cards";
import { SeverityBadge } from "@/components/platform/badges";

const reportCards = [
  {
    title: "P101 Seal Failure RCA",
    type: "RCA Report",
    status: "Ready",
    owner: "Reliability",
    updated: "2026-06-18",
    endpoint: "/api/reports/download/rca?asset_tag=P-101",
    filename: "RCA_P-101.pdf"
  },
  {
    title: "Q2 Compliance Evidence Package",
    type: "Audit Package",
    status: "Needs Review",
    owner: "Compliance",
    updated: "2026-06-20",
    endpoint: "/api/reports/download/audit-package",
    filename: "Q2_Compliance_Evidence_Package.pdf"
  },
  {
    title: "Executive Risk Summary",
    type: "Executive Summary",
    status: "Ready",
    owner: "Plant Manager",
    updated: "2026-06-21",
    endpoint: "/api/reports/download/executive-summary",
    filename: "Executive_Risk_Summary.pdf"
  },
  {
    title: "Preventive Maintenance Backlog",
    type: "Maintenance Report",
    status: "Draft",
    owner: "Maintenance",
    updated: "2026-06-19",
    endpoint: "/api/reports/download/maintenance-report",
    filename: "Preventive_Maintenance_Backlog.pdf"
  }
];

type DownloadState = Record<string, "idle" | "downloading" | "done" | "error">;

export default function ReportsPage() {
  const [downloadState, setDownloadState] = useState<DownloadState>({});
  const [message, setMessage] = useState("");

  async function downloadReport(report: (typeof reportCards)[number]) {
    setDownloadState((state) => ({ ...state, [report.title]: "downloading" }));
    setMessage("");

    try {
      const response = await fetch(report.endpoint);
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `Report download failed with HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = report.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setDownloadState((state) => ({ ...state, [report.title]: "done" }));
      setMessage(`${report.filename} generated and downloaded.`);
    } catch (error) {
      setDownloadState((state) => ({ ...state, [report.title]: "error" }));
      setMessage(error instanceof Error ? error.message : "Report download failed.");
    }
  }

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-3xl font-black">Reports Center</h1>
        <p className="mt-2 text-slate-400">RCA reports, compliance reports, executive summaries, maintenance reports, and audit evidence packages.</p>
      </div>

      {message ? (
        <GlassCard className="flex items-center gap-3">
          {message.toLowerCase().includes("failed") ? <XCircle className="text-red-300" /> : <CheckCircle2 className="text-emerald-300" />}
          <p className="text-sm text-slate-200">{message}</p>
        </GlassCard>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reportCards.map((report) => {
          const state = downloadState[report.title] ?? "idle";
          const isBusy = state === "downloading";

          return (
            <GlassCard key={report.title} className="flex min-h-72 flex-col">
              <FileText className="mb-4 text-cyan-300" />
              <h2 className="break-words font-bold">{report.title}</h2>
              <p className="mt-1 text-sm text-slate-400">{report.type}</p>
              <div className="mt-4">
                <SeverityBadge value={report.status === "Ready" ? "Approved" : "Needs Review"} />
              </div>
              <p className="mt-4 break-words text-sm text-slate-400">
                {report.owner} - {report.updated}
              </p>
              <p className="mt-2 break-words text-xs text-slate-500">{report.filename}</p>
              <button
                type="button"
                onClick={() => void downloadReport(report)}
                disabled={isBusy}
                className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBusy ? <Loader2 className="animate-spin" size={15} /> : <Download size={15} />}
                {isBusy ? "Generating..." : state === "done" ? "Download Again" : "Download PDF"}
              </button>
            </GlassCard>
          );
        })}
      </section>
    </div>
  );
}
