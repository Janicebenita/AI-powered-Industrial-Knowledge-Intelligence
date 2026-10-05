"use client";

import Link from "next/link";
import { ArrowDownWideNarrow, ArrowUpRight, Search } from "lucide-react";
import { useState } from "react";
import { assets } from "@/lib/demo-data";
import { RiskBadge, StatusBadge } from "@/components/platform/badges";
import { GlassCard } from "@/components/platform/cards";

export function DashboardAssets() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [descending, setDescending] = useState(true);
  const rows = assets.filter(asset => `${asset.tag} ${asset.name}`.toLowerCase().includes(query.toLowerCase()) && (status === "All statuses" || asset.complianceStatus === status)).sort((a, b) => descending ? b.riskScore - a.riskScore : a.riskScore - b.riskScore);
  return <GlassCard className="asset-table-panel"><div className="panel-heading justify-between"><div><h2>Asset watchlist</h2><p className="text-slate-400">Priorities across the illustrative asset sample</p></div><Link href="/platform/assets" className="panel-link">Asset 360<ArrowUpRight size={17} /></Link></div><div className="filter-toolbar"><label><Search size={17} /><input aria-label="Search demo assets" placeholder="Find an asset…" value={query} onChange={event => setQuery(event.target.value)} /></label><select aria-label="Filter asset compliance status" value={status} onChange={event => setStatus(event.target.value)}>{["All statuses", "Ready", "Partial", "At Risk"].map(value => <option key={value}>{value}</option>)}</select></div><div className="table-scroll"><table className="asset-watchlist"><caption className="sr-only">Illustrative assets, risk and compliance status</caption><thead><tr><th scope="col">Asset / equipment</th><th scope="col" aria-sort={descending ? "descending" : "ascending"}><button onClick={() => setDescending(value => !value)} title="Change risk sort order">Risk<ArrowDownWideNarrow size={16} /></button></th><th scope="col">Compliance</th></tr></thead><tbody>{rows.map(asset => <tr key={asset.tag}><td><strong>{asset.tag}</strong><span>{asset.name}</span></td><td><div className="risk-cell"><strong>{asset.riskScore}</strong><RiskBadge value={asset.riskScore} /></div></td><td><StatusBadge value={asset.complianceStatus} /></td></tr>)}</tbody></table>{rows.length === 0 && <p className="empty-filter" role="status">No demo assets match these filters. Try another search or status.</p>}</div><p className="table-count" aria-live="polite">Showing {rows.length} of {assets.length} demo assets</p></GlassCard>;
}
