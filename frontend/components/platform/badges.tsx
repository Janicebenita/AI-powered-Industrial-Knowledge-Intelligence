import { cn } from "@/lib/utils";

const toneClass = {
  Low: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  Medium: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  High: "border-orange-400/30 bg-orange-400/10 text-orange-200",
  Critical: "border-red-400/30 bg-red-400/10 text-red-200",
  Ready: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  Partial: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  "At Risk": "border-red-400/30 bg-red-400/10 text-red-200",
  Approved: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  "Needs Review": "border-amber-400/30 bg-amber-400/10 text-amber-200",
  Rejected: "border-red-400/30 bg-red-400/10 text-red-200"
} as const;

export function SeverityBadge({ value }: { value: keyof typeof toneClass | string }) {
  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", toneClass[value as keyof typeof toneClass] || "border-white/15 bg-white/10 text-slate-200")}>{value}</span>;
}

export function ConfidenceBadge({ value }: { value: number }) {
  const tone = value >= 90 ? "text-emerald-200 bg-emerald-400/10 border-emerald-400/30" : value >= 80 ? "text-cyan-200 bg-cyan-400/10 border-cyan-400/30" : "text-amber-200 bg-amber-400/10 border-amber-400/30";
  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", tone)}>{value}% confidence</span>;
}
