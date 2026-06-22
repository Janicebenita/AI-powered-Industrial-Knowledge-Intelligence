import { AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/platform/cards";
import { SeverityBadge } from "@/components/platform/badges";
import { lessons } from "@/lib/demo-data";

export default function LessonsPage() {
  return (
    <div className="grid gap-5">
      <div><h1 className="text-3xl font-black">Lessons Learned Engine</h1><p className="mt-2 text-slate-400">Recurring incident patterns, near-miss trends, non-conformances, proactive warnings, and preventive recommendations.</p></div>
      <section className="grid gap-4 md:grid-cols-2">
        {lessons.map((lesson) => <GlassCard key={lesson.title}><div className="mb-4 flex items-start justify-between gap-3"><AlertTriangle className="text-amber-300" /><SeverityBadge value={lesson.severity} /></div><h2 className="font-bold">{lesson.title}</h2><p className="mt-3 text-sm leading-6 text-slate-400">{lesson.detail}</p></GlassCard>)}
      </section>
    </div>
  );
}
