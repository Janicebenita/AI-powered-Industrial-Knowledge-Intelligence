"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { CitationCard } from "@/components/platform/citation-card";
import { GlassCard } from "@/components/platform/cards";
import { SeverityBadge } from "@/components/platform/badges";
import { citations, rcaTimeline } from "@/lib/demo-data";

export default function RcaPage() {
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");

  async function exportPdf() {
    setExporting(true);
    setMessage("");
    try {
      const response = await fetch("/api/reports/rca/P-101", { method: "POST" });
      if (!response.ok) {
        throw new Error(`Export failed with ${response.status}`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "RCA_P-101.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage("RCA PDF exported successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to export RCA PDF.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <GlassCard>
        <h1 className="text-3xl font-black">RCA Assistant</h1>
        <div className="mt-5 grid gap-3">
          {["Asset: Pump P101", "Incident: repeated seal failure", "Failure description: high vibration and cavitation symptoms", "Evidence: WO-10877, WO-10421, SOP-MECH-014"].map((item) => <input key={item} defaultValue={item} className="rounded-xl border border-white/10 bg-white/[0.07] p-3" />)}
          <button onClick={exportPdf} disabled={exporting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 font-bold hover:bg-cyan-500 disabled:cursor-wait disabled:opacity-70">
            <Download size={18} /> {exporting ? "Exporting..." : "Export PDF"}
          </button>
          {message ? <p className="rounded-xl border border-white/10 bg-white/[0.05] p-3 text-sm text-slate-300">{message}</p> : null}
        </div>
      </GlassCard>
      <GlassCard>
        <h2 className="mb-4 text-xl font-bold">Professional RCA Report Preview</h2>
        <SeverityBadge value="High" />
        <p className="mt-4 leading-7 text-slate-300">Incident summary: Pump P101 experienced repeated seal failure after vibration alarms and cavitation-like operating conditions. Likely root causes include low suction pressure, suction strainer fouling, seal flush instability, and possible shaft misalignment.</p>
        <h3 className="mt-5 font-semibold text-cyan-200">Timeline</h3>
        {rcaTimeline.map((item) => <div key={item.time} className="mt-3 border-l-2 border-cyan-300/50 pl-4"><strong>{item.time}</strong><p className="text-sm text-slate-400">{item.event}</p></div>)}
        <h3 className="mt-5 font-semibold text-cyan-200">Evidence Citations</h3>
        <div className="mt-3 grid gap-3">{citations.map((citation) => <CitationCard key={citation.title} {...citation} />)}</div>
      </GlassCard>
    </div>
  );
}
