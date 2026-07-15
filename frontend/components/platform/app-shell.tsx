"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, Menu, Shield, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { navItems } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { CommandSearch } from "@/components/platform/command-search";
import { BrandLogo } from "@/components/platform/brand-logo";

const mobileNav = navItems.filter((item) => ["/platform/dashboard", "/platform/copilot", "/platform/documents", "/platform/assets", "/platform/evaluation"].includes(item.href));
const navGroups = [
  { label: "Mission Control", items: ["/platform/dashboard", "/platform/copilot", "/platform/documents", "/platform/graph", "/platform/entities"] },
  { label: "Plant Intelligence", items: ["/platform/assets", "/platform/maintenance", "/platform/rca", "/platform/compliance", "/platform/lessons"] },
  { label: "Governance", items: ["/platform/reports", "/platform/evaluation", "/platform/admin"] }
];

const premiumLabels: Record<string, string> = {
  "/platform/dashboard": "Executive Cockpit",
  "/platform/copilot": "Knowledge Copilot",
  "/platform/documents": "Engineering Docs",
  "/platform/graph": "Knowledge Graph",
  "/platform/entities": "Entity Intelligence",
  "/platform/assets": "Digital Twin",
  "/platform/maintenance": "Maintenance AI",
  "/platform/rca": "Root Cause Analysis",
  "/platform/compliance": "Compliance OS",
  "/platform/lessons": "Lessons Learned",
  "/platform/reports": "Reports",
  "/platform/evaluation": "Evidence Metrics",
  "/platform/admin": "Admin"
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="plant-os-bg relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,123,255,0.16),transparent_42%)]" />
      </div>
      <div className={cn("relative grid min-h-screen transition-[grid-template-columns] duration-300", collapsed ? "lg:grid-cols-[92px_minmax(0,1fr)]" : "lg:grid-cols-[304px_minmax(0,1fr)]")}>
        <aside className="sticky top-0 z-20 hidden h-screen border-r border-cyan-300/10 bg-[#081320]/82 p-4 shadow-[20px_0_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl lg:block">
          <div className="mb-5 flex items-center gap-3 rounded-3xl border border-cyan-300/15 bg-white/[0.045] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <BrandLogo size="md" />
            {!collapsed ? <div><strong className="text-sm">Industrial Brain AI</strong><p className="text-xs text-slate-400">Plant Operating System</p></div> : null}
          </div>
          <button onClick={() => setCollapsed(!collapsed)} className="mb-4 flex min-h-10 w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-300 transition hover:border-cyan-300/30 hover:bg-white/[0.08]">
            <Menu size={17} /> {!collapsed ? "Compact shell" : null}
          </button>
          <nav className="thin-scrollbar grid max-h-[calc(100vh-164px)] gap-4 overflow-auto pr-1">
            {navGroups.map((group) => {
              const items = navItems.filter((item) => group.items.includes(item.href));
              return (
                <div key={group.label}>
                  {!collapsed ? <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">{group.label}</p> : null}
                  <div className="grid gap-1">
                    {items.map(({ label, href, icon: Icon }) => {
                      const active = pathname === href;
                      return (
                        <Link key={href} href={href} prefetch aria-current={active ? "page" : undefined} data-active={active} className={cn("mission-link group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition", active ? "bg-blue-500/95 text-white shadow-[0_0_34px_rgba(0,123,255,0.34)]" : "text-slate-400 hover:bg-white/[0.07] hover:text-white")}>
                          <Icon size={18} className={cn("shrink-0 transition group-hover:text-cyan-200", active ? "text-cyan-100 drop-shadow-[0_0_10px_rgba(0,212,255,0.65)]" : "")} />
                          {!collapsed ? <span className="truncate">{premiumLabels[href] || label}</span> : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0 pb-24 lg:pb-0">
          <Topbar />
          <main className="mx-auto max-w-[1580px] px-4 py-5 md:px-6 lg:px-8">{children}</main>
          <MobileNav pathname={pathname} />
        </div>
      </div>
    </div>
  );
}

function Topbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-cyan-300/10 bg-[#081320]/72 px-4 py-3 shadow-[0_18px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1580px] items-center gap-3">
        <Link href="/platform/dashboard" prefetch className="flex items-center gap-2 lg:hidden">
          <BrandLogo size="sm" />
          <span className="hidden text-sm font-bold text-white sm:inline">Industrial Brain AI</span>
        </Link>
        <CommandSearch />
        <button aria-label="Notifications" className="ml-auto grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-300 transition hover:border-cyan-300/30 hover:text-white md:ml-0"><Bell size={18} /></button>
        <div className="hidden items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-100 shadow-[0_0_22px_rgba(34,197,94,0.12)] sm:flex"><Sparkles size={15} /> AI online</div>
        <button className="hidden items-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_22px_rgba(0,212,255,0.10)] sm:flex"><Shield size={15} /> Plant A</button>
        <button className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm transition hover:border-cyan-300/30">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-bold">PM</span>
          <span className="hidden md:inline">Plant Manager</span>
          <ChevronDown size={15} />
        </button>
      </div>
    </header>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#050816]/94 px-2 py-2 backdrop-blur-2xl lg:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
        {mobileNav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} prefetch aria-current={active ? "page" : undefined} className={cn("grid min-h-14 place-items-center rounded-xl px-1 text-center text-[11px] transition", active ? "bg-blue-500 text-white" : "text-slate-400 hover:bg-white/[0.07] hover:text-white")}>
              <Icon size={18} />
              <span className="mt-1 max-w-full truncate">{label.replace("Command ", "").replace("Entity ", "")}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

