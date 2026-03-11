import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

/* ---------------- Allowlist Gate ---------------- */

async function isAllowed(email: string) {
  const base = process.env.APPS_SCRIPT_BASE_URL!;
  const key = process.env.APPS_SCRIPT_KEY!;
  const url = `${base}?path=allowed-users&key=${encodeURIComponent(key)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return false;

  const data = await res.json();
  const users = (data?.users || []) as Array<{ email: string; status: string }>;

  const u = users.find((x) => (x.email || "").toLowerCase() === email.toLowerCase());

  return !!u && (u.status || "active").toLowerCase() === "active";
}

/* ---------------- Announcements via Cloudflare Worker ---------------- */

async function getAnnouncements(email: string) {
  const base = process.env.WORKER_BASE_URL!;
  const token = process.env.WORKER_TOKEN!;
  const url = `${base}/api/announcements?email=${encodeURIComponent(email)}`;

  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return [];

  const data = await res.json();
  return (data?.announcements || []) as Array<{ message: string }>;
}

/* ---------------- UI ---------------- */

function StatChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/70 px-4 py-3 backdrop-blur">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-zinc-900">{value}</div>
    </div>
  );
}

function PrimaryAction({
  href,
  label,
  secondary = false,
}: {
  href: string;
  label: string;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition",
        secondary
          ? "border border-black/8 bg-white/80 text-zinc-800 hover:bg-white"
          : "text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)] hover:translate-y-[-1px]",
      ].join(" ")}
      style={
        secondary
          ? undefined
          : {
              background: "var(--accent-gradient)",
            }
      }
    >
      {label}
    </Link>
  );
}

function ModuleCard({
  href,
  eyebrow,
  title,
  desc,
  cta,
}: {
  href: string;
  eyebrow: string;
  title: string;
  desc: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "group relative block overflow-hidden rounded-3xl border border-black/5",
        "bg-white/78 backdrop-blur",
        "shadow-[0_14px_40px_rgba(0,0,0,0.07)]",
        "transition duration-200 hover:-translate-y-[2px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.10)]",
        "focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25",
      ].join(" ")}
    >
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: "var(--accent-gradient)" }}
      />
      <div className="p-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          {eyebrow}
        </div>

        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-zinc-900">
              {title}
            </h3>
            <p className="mt-2 max-w-[34ch] text-sm leading-6 text-zinc-600">
              {desc}
            </p>
          </div>

          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: "var(--accent-radial)",
              boxShadow: "var(--accent-shadow)",
            }}
            aria-hidden="true"
          >
            <div className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
          </div>
        </div>

        <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
          <span>{cta}</span>
          <span className="transition group-hover:translate-x-0.5">→</span>
        </div>
      </div>
    </Link>
  );
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-3xl border border-black/5 bg-white/74 p-6 backdrop-blur"
      style={{
        boxShadow: "0 14px 40px rgba(0,0,0,0.07)",
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/* ---------------- Page ---------------- */

export default async function Dashboard() {
  const session = await getServerSession();
  const email = session?.user?.email;
  const fullName = (session?.user?.name || "").trim();

  if (!email) redirect("/api/auth/signin");

  const allowed = await isAllowed(email);
  if (!allowed) redirect("/denied");

  const displayName = fullName || email;
  const announcements = await getAnnouncements(email);

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section
        className="relative overflow-hidden rounded-[32px] border border-white/50 px-6 py-6 sm:px-8 sm:py-8"
        style={{
          background:
            "linear-gradient(135deg, rgba(46,66,78,0.18) 0%, rgba(255,255,255,0.88) 50%, rgba(255,255,255,0.72) 100%)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.10)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[var(--accent)]/10 blur-3xl" />
        <div className="absolute left-10 bottom-0 h-24 w-24 rounded-full bg-[var(--accent)]/10 blur-2xl" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
              DeskXP Hero Portal
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              Welcome back, {displayName}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
              Access your profile, payroll records, contracts, and company updates
              in one place.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <PrimaryAction href="/payroll" label="Open payroll" />
              <PrimaryAction href="/contracts" label="View contracts" secondary />
              <PrimaryAction href="/profile" label="Manage profile" secondary />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[360px]">
            <StatChip label="Access" value="Active" />
            <StatChip label="Announcements" value={`${announcements.length}`} />
            <StatChip label="Account" value="Ready" />
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <div className="grid gap-6 xl:grid-cols-12">
        {/* LEFT */}
        <div className="space-y-6 xl:col-span-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <ModuleCard
              href="/payroll"
              eyebrow="Finance"
              title="Payroll"
              desc="View salary records, payout history, and your latest payroll details."
              cta="Open payroll"
            />
            <ModuleCard
              href="/contracts"
              eyebrow="Documents"
              title="Contracts"
              desc="Review employment and service agreements available to your account."
              cta="Review contracts"
            />
            <ModuleCard
              href="/profile"
              eyebrow="Account"
              title="Profile"
              desc="Update your employee details and keep your account information current."
              cta="Manage profile"
            />
          </div>

          <SectionCard title="Quick access">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { href: "/payroll", label: "Latest payroll" },
                { href: "/contracts", label: "My contracts" },
                { href: "/profile", label: "Edit profile" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-black/5 bg-white/80 px-4 py-4 text-sm font-semibold text-zinc-800 transition hover:bg-white hover:shadow-sm"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Announcements"
            action={
              announcements.length > 0 ? (
                <span className="rounded-full bg-[var(--accent)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--accent)]">
                  {announcements.length} update{announcements.length === 1 ? "" : "s"}
                </span>
              ) : null
            }
          >
            {announcements.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/8 bg-white/60 px-4 py-5 text-sm text-zinc-500">
                No announcements yet. Updates from DeskXP will appear here.
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 5).map((a, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-black/5 bg-white/80 px-4 py-4 text-sm leading-6 text-zinc-700"
                  >
                    {a.message}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* RIGHT */}
        <div className="space-y-6 xl:col-span-4">
          <SectionCard title="Your account">
            <div className="space-y-4">
              <div className="rounded-2xl border border-black/5 bg-white/80 p-4">
                <div className="text-sm font-semibold text-zinc-900">
                  {fullName || "—"}
                </div>
                <div className="mt-1 break-all text-sm text-zinc-600">{email}</div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl border border-black/5 bg-white/80 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Access status
                  </div>
                  <div className="mt-2 inline-flex items-center rounded-full bg-[var(--accent)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--accent)]">
                    Active
                  </div>
                </div>

                <div className="rounded-2xl border border-black/5 bg-white/80 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Portal
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-900">
                    Hero access enabled
                  </div>
                </div>
              </div>

              <Link
                href="/api/auth/signout"
                className="inline-flex items-center justify-center rounded-2xl border border-black/8 bg-white/80 px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-white"
              >
                Sign out
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}