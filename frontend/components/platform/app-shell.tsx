"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Command, Menu, Search, Shield, Sparkles } from "lucide-react";
import { useState } from "react";
import { navItems } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.18),transparent_40%)]" />
      </div>
      <div className={cn("relative grid min-h-screen transition-[grid-template-columns] duration-300", collapsed ? "lg:grid-cols-[86px_minmax(0,1fr)]" : "lg:grid-cols-[292px_minmax(0,1fr)]")}>
        <aside className="sticky top-0 z-20 hidden h-screen border-r border-white/10 bg-[#050816]/80 p-4 backdrop-blur-xl lg:block">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 font-black shadow-[0_0_36px_rgba(59,130,246,0.45)]">IB</div>
            {!collapsed ? <div><strong>Industrial Brain AI</strong><p className="text-xs text-slate-400">Operations Intelligence</p></div> : null}
          </div>
          <button onClick={() => setCollapsed(!collapsed)} className="mb-3 flex min-h-10 w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-300">
            <Menu size={17} /> {!collapsed ? "Collapse shell" : null}
          </button>
          <nav className="thin-scrollbar grid max-h-[calc(100vh-150px)] gap-1 overflow-auto">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition", active ? "bg-blue-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.28)]" : "text-slate-400 hover:bg-white/[0.07] hover:text-white")}>
                  <Icon size={18} />
                  {!collapsed ? <span>{label}</span> : null}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0">
          <Topbar />
          <main className="mx-auto max-w-[1560px] px-4 py-5 md:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

function Topbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-[#050816]/72 px-4 py-3 backdrop-blur-xl md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1560px] items-center gap-3">
        <div className="hidden min-h-11 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-slate-400 md:flex">
          <Search size={17} />
          <span className="text-sm">Search assets, SOPs, work orders, regulations, citations...</span>
          <span className="ml-auto inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs"><Command size={12} /> K</span>
        </div>
        <button className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-300"><Bell size={18} /></button>
        <div className="hidden items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200 sm:flex"><Sparkles size={15} /> AI online</div>
        <div className="hidden items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-200 sm:flex"><Shield size={15} /> Plant A</div>
        <button className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-bold">PM</span>
          <span className="hidden md:inline">Plant Manager</span>
          <ChevronDown size={15} />
        </button>
      </div>
    </header>
  );
}
