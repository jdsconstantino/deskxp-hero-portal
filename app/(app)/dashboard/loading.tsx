export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* HERO */}
      <div className="rounded-3xl p-7 bg-white/60 backdrop-blur border border-black/5">
        <div className="space-y-3 max-w-xl">
          <div className="h-3 w-40 bg-black/10 rounded-full" />
          <div className="h-8 w-full bg-black/10 rounded-full" />
          <div className="h-4 w-3/4 bg-black/10 rounded-full" />
        </div>
      </div>

      {/* GRID */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>

          <PanelSkeleton title="Quick actions">
            <div className="flex gap-2">
              <PillSkeleton />
              <PillSkeleton />
              <PillSkeleton />
            </div>
          </PanelSkeleton>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <PanelSkeleton title="Your status">
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </PanelSkeleton>

          <PanelSkeleton title="Announcements">
            <MessageSkeleton />
            <MessageSkeleton />
          </PanelSkeleton>
        </div>
      </div>
    </div>
  );
}

/* ---------- SKELETON PARTS ---------- */

function CardSkeleton() {
  return (
    <div className="rounded-2xl p-5 bg-white/70 backdrop-blur border border-black/5 space-y-3">
      <div className="h-5 w-32 bg-black/10 rounded-full" />
      <div className="h-3 w-full bg-black/10 rounded-full" />
      <div className="h-3 w-24 bg-black/10 rounded-full" />
    </div>
  );
}

function PanelSkeleton({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-5 bg-white/70 backdrop-blur border border-black/5 space-y-3">
      <div className="text-sm font-semibold text-zinc-800">{title}</div>
      {children}
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex justify-between">
      <div className="h-3 w-24 bg-black/10 rounded-full" />
      <div className="h-3 w-32 bg-black/10 rounded-full" />
    </div>
  );
}

function PillSkeleton() {
  return <div className="h-8 w-28 bg-black/10 rounded-xl" />;
}

function MessageSkeleton() {
  return <div className="h-12 w-full bg-black/10 rounded-xl" />;
}
