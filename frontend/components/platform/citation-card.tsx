import { FileText } from "lucide-react";
import { ConfidenceBadge } from "@/components/platform/badges";

export function CitationCard({ title, page, confidence, quote }: { title: string; page: string; confidence: number; quote: string }) {
  return (
    <article className="rounded-2xl border border-cyan-300/22 bg-cyan-300/[0.055] p-4 transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.08]">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
          <FileText size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 max-w-full break-all font-semibold text-cyan-50">{title}</h3>
            <span className="rounded-full bg-white/[0.06] px-2 py-1 text-xs text-slate-300">{page}</span>
            <ConfidenceBadge value={confidence} />
          </div>
          <p className="mt-3 break-words border-l border-cyan-300/30 pl-3 text-sm leading-6 text-slate-300">{quote}</p>
        </div>
      </div>
    </article>
  );
}
