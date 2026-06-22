import Link from "next/link";
import { ArrowRight, BrainCircuit, Factory, FileSearch, GitBranch, LucideIcon, ShieldCheck, Wrench } from "lucide-react";
import { ParticleField } from "@/components/particle-field";

const features: Array<[string, LucideIcon, string]> = [
  ["Document Intelligence", FileSearch, "Ingest manuals, SOPs, scanned reports, spreadsheets, drawings, and compliance records."],
  ["Knowledge Graph", GitBranch, "Connect assets, failures, procedures, regulations, locations, people, and evidence."],
  ["AI Copilot", BrainCircuit, "Ask operational questions and receive cited, auditable answers with confidence scoring."],
  ["Maintenance Intelligence", Wrench, "Detect repeated failures, RCA hypotheses, and preventive maintenance actions."],
  ["Compliance Intelligence", ShieldCheck, "Map regulations to evidence, find gaps, and generate audit-ready summaries."],
  ["Industrial SaaS", Factory, "Built for refineries, steel plants, chemical facilities, power plants, and manufacturing."]
];

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <ParticleField />
      <section className="grid-pattern relative flex min-h-screen items-center px-6 py-10">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200">Unified Asset & Operations Intelligence Platform</p>
            <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-normal md:text-7xl">
              <span className="gradient-text">Industrial Brain AI</span>
            </h1>
            <p className="mt-6 text-2xl font-semibold text-white">Transform Industrial Knowledge Into Operational Intelligence</p>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">Reduce downtime, accelerate maintenance decisions, and unlock industrial knowledge using AI.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/platform" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-blue-500 px-5 font-bold text-white transition hover:bg-cyan-500">
                Launch Platform <ArrowRight size={18} />
              </Link>
              <a href="#features" className="inline-flex min-h-12 items-center rounded-lg border border-white/15 px-5 font-bold text-white transition hover:bg-white/10">View Architecture</a>
            </div>
          </div>
          <div className="glass glow rounded-xl p-5">
            <div className="grid gap-4">
              {["P101 seal failure RCA", "V-203 vessel opening SOP", "NFPA-70E evidence gap", "HX401 corrosion trend"].map((item, index) => (
                <div key={item} className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold">{item}</span>
                    <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-sm text-cyan-200">{92 - index * 7}% cited</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${86 - index * 11}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section id="features" className="relative mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-3xl font-black">Enterprise Industrial Intelligence</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(([title, FeatureIcon, body]) => {
            return (
              <div key={title} className="glass rounded-xl p-5">
                <FeatureIcon className="mb-4 text-cyan-300" />
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
              </div>
            );
          })}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="glass rounded-2xl p-6 md:p-8">
          <h2 className="text-3xl font-black">Architecture</h2>
          <div className="mt-8 grid gap-3 md:grid-cols-4">
            {["Documents", "OCR + Extraction", "Embeddings + Graph", "Cited AI Agents"].map((item, index) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/[0.05] p-4">
                <span className="text-sm text-cyan-300">0{index + 1}</span>
                <h3 className="mt-2 font-bold">{item}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">Enterprise pipeline stage with audit metadata, permissions, and confidence scoring.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-6 py-16 md:grid-cols-3">
        {["Refineries", "Steel Plants", "Chemical Facilities", "Power Plants", "Manufacturing", "Water Utilities"].map((item) => (
          <div key={item} className="glass rounded-2xl p-5">
            <h3 className="font-bold">{item}</h3>
            <p className="mt-2 text-sm text-slate-400">Asset intelligence for maintenance, compliance, reliability, and executive teams.</p>
          </div>
        ))}
      </section>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-4 md:grid-cols-4">
          {["35% faster troubleshooting", "97% citation coverage", "418 hours saved", "$433k annual ROI"].map((item) => (
            <div key={item} className="glass rounded-2xl p-5 text-center">
              <strong className="text-2xl">{item.split(" ")[0]}</strong>
              <p className="mt-2 text-sm text-slate-400">{item.replace(item.split(" ")[0], "").trim()}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-6 py-16 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-2xl font-black">Security</h2>
          <p className="mt-3 leading-7 text-slate-300">JWT, RBAC, document permissions, audit logs, evidence-first answers, and no hallucinated operational guidance without citations.</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <h2 className="text-2xl font-black">Testimonials</h2>
          <p className="mt-3 leading-7 text-slate-300">“This is the first industrial AI interface our maintenance and audit teams would actually trust in a shutdown meeting.”</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-6 py-16 md:grid-cols-3">
        {["Starter: Single Plant", "Enterprise: Multi-site", "Mission Critical: Regulated Assets"].map((item) => (
          <div key={item} className="glass rounded-xl p-6">
            <h3 className="text-xl font-bold">{item}</h3>
            <p className="mt-3 text-slate-300">AI knowledge intelligence, cited copilots, compliance maps, and operational graph analytics.</p>
          </div>
        ))}
      </section>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-black">FAQ</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {["Does it answer without citations?", "Can it process scanned manuals?", "Can it connect to CMMS?", "Does it support compliance audits?"].map((q) => (
            <div key={q} className="glass rounded-2xl p-5">
              <h3 className="font-bold">{q}</h3>
              <p className="mt-2 text-sm text-slate-400">Yes, with evidence controls, OCR hooks, integration-ready services, and audit-ready traceability.</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-slate-400">Industrial Brain AI · Palantir Foundry + Microsoft Industrial Copilot + OpenAI Enterprise inspired</footer>
    </main>
  );
}
