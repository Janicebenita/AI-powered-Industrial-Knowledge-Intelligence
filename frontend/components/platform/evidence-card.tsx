import { FileSearch } from "lucide-react";
import { ConfidenceBadge } from "@/components/platform/badges";

export function EvidenceCard({ title, description, confidence = 90 }: { title: string; description: string; confidence?: number }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition hover:border-cyan-300/30 hover:bg-white/[0.07]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <FileSearch className="text-cyan-300" size={20} />
        <ConfidenceBadge value={confidence} />
      </div>
      <h3 className="font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </article>
  );
}
