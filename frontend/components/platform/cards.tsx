import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("glass min-w-0 rounded-2xl p-5", className)}>{children}</section>;
}

export function ChartCard({ title, subtitle, children, className }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <GlassCard className={className}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
        </div>
        <ArrowUpRight className="text-slate-500" size={18} />
      </div>
      {children}
    </GlassCard>
  );
}

export function MetricCard({ label, value, delta, tone = "info" }: { label: string; value: string | number; delta?: string; tone?: string }) {
  const color = tone === "critical" ? "from-red-500 to-orange-400" : tone === "warning" ? "from-amber-400 to-orange-500" : tone === "success" ? "from-emerald-400 to-cyan-400" : "from-blue-500 to-cyan-400";
  return (
    <GlassCard className="scanline relative min-h-32 overflow-hidden">
      <div className={cn("absolute left-0 top-0 h-1 w-full bg-gradient-to-r", color)} />
      <p className="text-sm text-slate-400">{label}</p>
      <strong className="mt-3 block break-words text-3xl font-black tracking-normal">{value}</strong>
      {delta ? <p className="mt-2 break-words text-sm text-slate-300">{delta}</p> : null}
    </GlassCard>
  );
}

export function SkeletonCard() {
  return <div className="glass h-36 animate-pulse rounded-2xl" />;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <GlassCard className="grid min-h-48 place-items-center text-center">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 max-w-md text-sm text-slate-400">{body}</p>
      </div>
    </GlassCard>
  );
}
