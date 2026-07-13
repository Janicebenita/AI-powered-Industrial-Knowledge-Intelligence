import { FileText } from "lucide-react";
import { ConfidenceBadge } from "@/components/platform/badges";

export function CitationCard({ title, page, confidence, quote }: { title: string; page: string; confidence: number; quote: string }) {
  const displayTitle = title.length > 86 ? `${title.slice(0, 83)}...` : title;

  return (
    <article className="rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-4">
      <div className="grid gap-3 sm:grid-cols-[40px_minmax(0,1fr)]">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan-300/10 text-cyan-200">
          <FileText size={18} />
        </div>
        <div className="min-w-0">
          <h3 title={title} className="min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-cyan-100">
            {displayTitle}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="max-w-full truncate rounded-full bg-white/[0.06] px-2 py-1 text-xs text-slate-300">{page}</span>
            <ConfidenceBadge value={confidence} />
          </div>
        </div>
        <p className="min-w-0 break-words text-sm leading-6 text-slate-300 sm:col-start-2">{quote}</p>
      </div>
    </article>
  );
}
