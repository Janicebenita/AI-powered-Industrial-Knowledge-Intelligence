import { FileText } from "lucide-react";
import { ConfidenceBadge } from "@/components/platform/badges";

export function CitationCard({ title, page, confidence, quote }: { title: string; page: string; confidence: number; quote: string }) {
  return (
    <article className="rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan-300/10 text-cyan-200">
          <FileText size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 max-w-full break-all font-semibold text-cyan-100">{title}</h3>
            <span className="text-xs text-slate-400">{page}</span>
            <ConfidenceBadge value={confidence} />
          </div>
          <p className="mt-2 break-words text-sm leading-6 text-slate-300">{quote}</p>
        </div>
      </div>
    </article>
  );
}
