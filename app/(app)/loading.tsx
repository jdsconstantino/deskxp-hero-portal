export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header/hero placeholder */}
      <div className="rounded-3xl p-7 bg-white/70 backdrop-blur border border-black/5 shadow-[0_18px_60px_rgba(0,0,0,0.10)]">
        <div className="space-y-3 max-w-2xl">
          <div className="h-3 w-40 bg-black/10 rounded-full" />
          <div className="h-8 w-full max-w-[520px] bg-black/10 rounded-full" />
          <div className="h-4 w-3/4 max-w-[420px] bg-black/10 rounded-full" />
        </div>

        {/* simple bar (static, but looks fine) */}
        <div className="mt-6 h-1 rounded-full overflow-hidden bg-black/5">
          <div className="h-full w-1/2 rounded-full bg-[var(--accent)]/35" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <Panel />
          <Panel />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Panel />
          <Panel />
        </div>
      </div>
    </div>
  );
}

function Panel() {
  return (
    <div className="rounded-2xl p-5 bg-white/70 backdrop-blur border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] space-y-3">
      <div className="h-4 w-32 bg-black/10 rounded-full" />
      <div className="h-3 w-full bg-black/10 rounded-full" />
      <div className="h-3 w-4/5 bg-black/10 rounded-full" />
    </div>
  );
}
