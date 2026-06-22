import { Download, FileText } from "lucide-react";
import { GlassCard } from "@/components/platform/cards";
import { SeverityBadge } from "@/components/platform/badges";
import { reports } from "@/lib/demo-data";

export default function ReportsPage() {
  return (
    <div className="grid gap-5">
      <div><h1 className="text-3xl font-black">Reports Center</h1><p className="mt-2 text-slate-400">RCA reports, compliance reports, executive summaries, maintenance reports, and audit evidence packages.</p></div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reports.map((report) => <GlassCard key={report.title}><FileText className="mb-4 text-cyan-300" /><h2 className="font-bold">{report.title}</h2><p className="mt-1 text-sm text-slate-400">{report.type}</p><div className="mt-4"><SeverityBadge value={report.status === "Ready" ? "Approved" : "Needs Review"} /></div><p className="mt-4 text-sm text-slate-400">{report.owner} · {report.updated}</p><button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15"><Download size={15} /> Download</button></GlassCard>)}
      </section>
    </div>
  );
}
