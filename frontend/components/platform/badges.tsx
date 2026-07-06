import { cn } from "@/lib/utils";

const toneClass = {
  Low: "border-emerald-400/35 bg-emerald-400/12 text-emerald-100",
  Medium: "border-amber-400/35 bg-amber-400/12 text-amber-100",
  High: "border-orange-400/35 bg-orange-400/12 text-orange-100",
  Critical: "border-red-400/35 bg-red-400/12 text-red-100",
  Ready: "border-emerald-400/35 bg-emerald-400/12 text-emerald-100",
  Partial: "border-amber-400/35 bg-amber-400/12 text-amber-100",
  "At Risk": "border-red-400/35 bg-red-400/12 text-red-100",
  Approved: "border-emerald-400/35 bg-emerald-400/12 text-emerald-100",
  "Needs Review": "border-amber-400/35 bg-amber-400/12 text-amber-100",
  Rejected: "border-red-400/35 bg-red-400/12 text-red-100"
} as const;

export function StatusBadge({ value }: { value: keyof typeof toneClass | string }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold", toneClass[value as keyof typeof toneClass] || "border-white/15 bg-white/10 text-slate-200")}><span className="h-1.5 w-1.5 rounded-full bg-current" />{value}</span>;
}

export function SeverityBadge({ value }: { value: keyof typeof toneClass | string }) {
  return <StatusBadge value={value} />;
}

export function RiskBadge({ value }: { value: number }) {
  const label = value >= 80 ? "Critical" : value >= 70 ? "High" : value >= 55 ? "Medium" : "Low";
  return <StatusBadge value={label} />;
}

export function ConfidenceBadge({ value }: { value: number }) {
  const tone = value >= 90 ? "text-emerald-100 bg-emerald-400/12 border-emerald-400/35" : value >= 80 ? "text-cyan-100 bg-cyan-400/12 border-cyan-400/35" : "text-amber-100 bg-amber-400/12 border-amber-400/35";
  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-bold", tone)}>{value}% confidence</span>;
}
