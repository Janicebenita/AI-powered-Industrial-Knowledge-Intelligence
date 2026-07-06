import { ArrowUpRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "warning" | "critical" | string;

const toneMap: Record<string, string> = {
  info: "from-blue-500 to-cyan-400 text-cyan-200",
  success: "from-emerald-400 to-cyan-400 text-emerald-200",
  warning: "from-amber-400 to-orange-500 text-amber-200",
  critical: "from-red-500 to-orange-400 text-red-200"
};

export function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("glass min-w-0 rounded-2xl p-5 transition duration-200 hover:border-cyan-300/22 hover:bg-white/[0.09]", className)}>{children}</section>;
}

export function ChartCard({ title, subtitle, children, className }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <GlassCard className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm leading-6 text-slate-400">{subtitle}</p> : null}
        </div>
        <ArrowUpRight className="shrink-0 text-slate-500" size={18} />
      </div>
      {children}
    </GlassCard>
  );
}

export function MetricCard({ label, value, delta, tone = "info", trend = "up" }: { label: string; value: string | number; delta?: string; tone?: Tone; trend?: "up" | "down" | "flat" }) {
  const gradient = toneMap[tone]?.split(" text-")[0] || toneMap.info.split(" text-")[0];
  const textTone = tone === "critical" ? "text-red-200" : tone === "warning" ? "text-amber-200" : tone === "success" ? "text-emerald-200" : "text-cyan-200";
  const TrendIcon = trend === "down" ? TrendingDown : trend === "flat" ? Minus : TrendingUp;
  return (
    <GlassCard className="scanline group relative min-h-32 overflow-hidden">
      <div className={cn("absolute left-0 top-0 h-1 w-full bg-gradient-to-r", gradient)} />
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <span className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06]", textTone)}>
          <TrendIcon size={15} />
        </span>
      </div>
      <strong className="mt-3 block break-words text-3xl font-black tracking-normal text-white">{value}</strong>
      {delta ? <p className={cn("mt-2 break-words text-sm", textTone)}>{delta}</p> : null}
    </GlassCard>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn("glass h-36 animate-pulse rounded-2xl", className)} />;
}

export function SkeletonCard() {
  return <LoadingSkeleton />;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <GlassCard className="grid min-h-48 place-items-center text-center">
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">{body}</p>
      </div>
    </GlassCard>
  );
}
