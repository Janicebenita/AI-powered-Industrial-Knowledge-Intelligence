"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { GlassCard } from "@/components/platform/cards";

export default function PlatformError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <GlassCard className="command-panel mx-auto mt-8 max-w-2xl">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-red-400/30 bg-red-500/10 text-red-100">
          <AlertTriangle />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-200">Operational Console Error</p>
          <h1 className="mt-2 text-2xl font-black text-white">This module could not be rendered.</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">The application preserved the shell and stopped the failed view safely. Retry the module or check the local server logs.</p>
          <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-slate-400">{error.message}</p>
          <button onClick={reset} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-500 px-4 text-sm font-bold text-white transition hover:bg-cyan-500">
            <RotateCcw size={16} /> Retry module
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
