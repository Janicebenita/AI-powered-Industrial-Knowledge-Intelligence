"use client";

import { SessionControls, useSession } from "@/components/session-provider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Menu, ShieldCheck, UserRound, X } from "lucide-react";
import { useRef, useState } from "react";
import { navItems } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { CommandSearch } from "@/components/platform/command-search";
import { BrandLogo } from "@/components/platform/brand-logo";

const navGroups = [
  { label: "Workspace", items: ["/platform/dashboard", "/platform/copilot", "/platform/documents", "/platform/graph", "/platform/entities"] },
  { label: "Plant intelligence", items: ["/platform/assets", "/platform/maintenance", "/platform/rca", "/platform/compliance", "/platform/lessons"] },
  { label: "Governance", items: ["/platform/reports", "/platform/evaluation", "/platform/admin"] }
];
const labels: Record<string, string> = {
  "/platform/dashboard": "Overview", "/platform/copilot": "Knowledge Copilot",
  "/platform/documents": "Engineering Docs", "/platform/graph": "Knowledge Graph",
  "/platform/entities": "Entity Intelligence", "/platform/assets": "Asset 360",
  "/platform/maintenance": "Maintenance", "/platform/rca": "Root Cause Analysis",
  "/platform/compliance": "Compliance", "/platform/lessons": "Lessons Learned",
  "/platform/reports": "Reports", "/platform/evaluation": "Evidence Metrics", "/platform/admin": "Administration"
};

function Navigation({ pathname, collapsed = false, onNavigate }: { pathname: string; collapsed?: boolean; onNavigate?: () => void }) {
  return <nav aria-label="Primary navigation" className="shell-navigation thin-scrollbar">
    {navGroups.map(group => <div className="nav-group" key={group.label}>
      {!collapsed && <p className="nav-group-label">{group.label}</p>}
      {navItems.filter(item => group.items.includes(item.href)).map(({ label, href, icon: Icon }) => {
        const name = labels[href] || label;
        const active = pathname === href;
        return <Link key={href} href={href} prefetch onClick={onNavigate} aria-current={active ? "page" : undefined} aria-label={name} title={collapsed ? name : undefined} className="shell-nav-link" data-active={active}>
          <span className="nav-icon"><Icon size={20} aria-hidden="true" /></span>
          {!collapsed && <span>{name}</span>}
          {!collapsed && active && <ChevronRight size={15} className="ml-auto shrink-0" aria-hidden="true" />}
        </Link>;
      })}
    </div>)}
  </nav>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);
  const isDashboard = pathname === "/platform/dashboard";
  return <div className={cn("platform-shell executive-shell", isDashboard && "shell-light")} data-collapsed={collapsed}>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <aside className="desktop-sidebar">
      <Link href="/platform/dashboard" className="shell-brand" aria-label="Industrial Brain AI home">
        <BrandLogo size="sm" />
        {!collapsed && <span><strong>Industrial Brain<span className="brand-ai"> AI</span></strong><small>OPERATIONS INTELLIGENCE</small></span>}
      </Link>
      <Navigation pathname={pathname} collapsed={collapsed} />
      <div className="sidebar-footer">
        {!collapsed && <div className="workspace-note"><ShieldCheck size={18} /><div><strong>Evidence before action</strong><span>Human judgment, always.</span></div></div>}
        <button className="collapse-control" onClick={() => setCollapsed(value => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <ChevronRight size={20} /> : <><ChevronLeft size={20} /><span>Collapse sidebar</span></>}
        </button>
      </div>
    </aside>
    <div className="shell-workspace">
      <Topbar pageTitle={labels[pathname] || "Workspace"} onMenu={() => drawer.current?.showModal()} />
      <main id="main-content" tabIndex={-1} className={cn("shell-main", isDashboard && "dashboard-workspace")}>
        <details className="demo-disclosure"><summary><ShieldCheck size={17} aria-hidden="true" /><span><strong>Illustrative demo workspace.</strong> AI output requires authorized engineering judgment.</span><ChevronDown size={15} aria-hidden="true" /></summary><p>Dashboard, asset, graph, RCA, compliance and report examples are demo data. Provider status and integration results are checked separately.</p></details>
        {children}
      </main>
    </div>
    <dialog ref={drawer} className="mobile-drawer" aria-label="Navigation">
      <div className="drawer-heading"><BrandLogo size="sm" /><strong>Industrial Brain AI</strong><button className="icon-button" aria-label="Close navigation" onClick={() => drawer.current?.close()}><X size={20} /></button></div>
      <Navigation pathname={pathname} onNavigate={() => drawer.current?.close()} />
    </dialog>
  </div>;
}

function Topbar({ pageTitle, onMenu }: { pageTitle: string; onMenu: () => void }) {
  const { user, loading } = useSession();
  return <header className="shell-header">
    <button className="icon-button mobile-menu-button" aria-label="Open navigation" onClick={onMenu}><Menu size={21} /></button>
    <div className="header-breadcrumb"><span>Workspace</span><ChevronRight size={15} /><strong>{pageTitle}</strong></div>
    <CommandSearch placeholder="Search the workspace…" />
    <Link href="/platform/admin" className="header-provider" title="Check live provider status in Administration"><ShieldCheck size={17} /><span>Provider status</span></Link>
    <details className="header-popover">
      <summary className="icon-button" aria-label="Notifications" title="Notifications"><Bell size={20} /></summary>
      <div className="header-popover-panel"><strong>Notification center</strong><p>Dashboard alerts are illustrative. Review maintenance findings and their evidence before taking action.</p><Link href="/platform/maintenance">View maintenance alerts <ChevronRight size={16} /></Link></div>
    </details>
    <details className="header-popover header-help">
      <summary className="icon-button" aria-label="Workspace help" title="Workspace help"><CircleHelp size={20} /></summary>
      <div className="header-popover-panel"><strong>Your evidence workspace</strong><p>Use search to find a page or ask the Copilot. Use arrow keys to move between dashboard tabs.</p><Link href="/platform/evaluation">Review evidence quality <ChevronRight size={16} /></Link></div>
    </details>
    <details className="header-popover account-popover">
      <summary className="account-trigger"><span className="account-avatar"><UserRound size={19} /></span><span>{loading ? "Session…" : user ? "My account" : "Guest access"}</span><ChevronDown size={15} /></summary>
      <div className="header-popover-panel"><strong>Account & access</strong><p>{user ? "Your authenticated scope is shown below." : "Sign in to use live evidence and your authorized workspace."}</p><SessionControls /></div>
    </details>
  </header>;
}
