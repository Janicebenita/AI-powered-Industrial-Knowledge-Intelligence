"use client";

import { Search, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { navItems } from "@/lib/demo-data";

export function CommandSearch({ placeholder = "Search the workspace…" }: { placeholder?: string }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const matches = navItems.filter(item => item.label.toLowerCase().includes(query.trim().toLowerCase()));
  return <form className="command-search" role="search" onSubmit={event => { event.preventDefault(); if (query.trim()) { setFocused(false); router.push(`/platform/copilot?question=${encodeURIComponent(query.trim())}`); } }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}>
    <Search size={19} aria-hidden="true" />
    <input aria-label="Global search" value={query} onChange={event => setQuery(event.target.value)} onFocus={() => setFocused(true)} onKeyDown={event => { if (event.key === "Escape") setFocused(false); }} placeholder={placeholder} autoComplete="off" />
    {focused && query.trim() && <div className="search-results"><p>WORKSPACE SHORTCUTS</p>{matches.map(({ label, href, icon: Icon }) => <Link key={href} href={href} onClick={() => { setFocused(false); setQuery(""); }}><Icon size={18} />{label}<ArrowUpRight size={15} /></Link>)}<button type="submit"><Search size={18} /><span>Ask Copilot: {query}</span><ArrowUpRight size={15} /></button></div>}
  </form>;
}
