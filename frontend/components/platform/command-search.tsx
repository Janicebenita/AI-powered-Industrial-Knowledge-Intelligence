import { Command, Search } from "lucide-react";

export function CommandSearch({ placeholder = "Search assets, SOPs, work orders, regulations, citations..." }: { placeholder?: string }) {
  return (
    <label className="hidden min-h-11 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-slate-400 transition focus-within:border-cyan-300/50 focus-within:bg-white/[0.08] md:flex">
      <Search size={17} className="shrink-0" />
      <span className="sr-only">Global search</span>
      <input className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-slate-500" placeholder={placeholder} />
      <span className="ml-auto inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs"><Command size={12} /> K</span>
    </label>
  );
}
