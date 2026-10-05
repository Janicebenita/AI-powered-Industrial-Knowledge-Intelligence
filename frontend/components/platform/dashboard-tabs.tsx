"use client";

import { BarChart3, BookOpen, Boxes, LayoutDashboard, PlayCircle } from "lucide-react";
import { useRef, useState } from "react";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "assets", label: "Asset intelligence", icon: Boxes },
  { id: "evidence", label: "Evidence library", icon: BookOpen },
  { id: "demo", label: "Demo runbook", icon: PlayCircle }
] as const;
type TabId = typeof tabs[number]["id"];

export function DashboardTabs({ panels }: { panels: Record<TabId, React.ReactNode> }) {
  const [active, setActive] = useState<TabId>("overview");
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  return <div className="dashboard-tabs">
    <div className="dashboard-tablist" role="tablist" aria-label="Dashboard sections">
      {tabs.map(({ id, label, icon: Icon }, index) => <button key={id} id={`tab-${id}`} ref={node => { buttons.current[index] = node; }} role="tab" type="button" aria-selected={active === id} aria-controls={`panel-${id}`} tabIndex={active === id ? 0 : -1} onClick={() => setActive(id)} onKeyDown={event => {
        let next: number;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault(); setActive(tabs[next].id); buttons.current[next]?.focus();
      }}><Icon size={19} aria-hidden="true" />{label}</button>)}
    </div>
    {tabs.map(({ id }) => <section key={id} id={`panel-${id}`} role="tabpanel" aria-labelledby={`tab-${id}`} hidden={active !== id} tabIndex={0} className="dashboard-tabpanel">{active === id ? panels[id] : null}</section>)}
  </div>;
}
