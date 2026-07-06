import { LoadingSkeleton } from "@/components/platform/cards";

export default function PlatformLoading() {
  return (
    <div className="grid gap-5">
      <section className="command-panel rounded-3xl p-6">
        <div className="h-4 w-52 animate-pulse rounded-full bg-cyan-300/20" />
        <div className="mt-4 h-12 w-full max-w-2xl animate-pulse rounded-2xl bg-white/10" />
        <div className="mt-3 h-5 w-full max-w-xl animate-pulse rounded-xl bg-white/10" />
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <LoadingSkeleton key={item} className="h-32" />)}
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <LoadingSkeleton className="h-96" />
        <LoadingSkeleton className="h-96" />
      </section>
    </div>
  );
}
