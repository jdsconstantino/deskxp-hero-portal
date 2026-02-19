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

function ModuleCard({
  href,
  title,
  desc,
  cta,
}: {
  href: string;
  title: string;
  desc: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "group block rounded-2xl transition relative overflow-hidden",
        "bg-white/70 backdrop-blur",
        "border border-black/5",
        "shadow-[0_10px_30px_rgba(0,0,0,0.06)]",
        "hover:shadow-[var(--accent-shadow)] hover:-translate-y-[2px]",
        "focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30",
      ].join(" ")}
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: "var(--accent-gradient)" }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold tracking-wide text-zinc-500 uppercase"></div>
            <div className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">
              {title}
            </div>
          </div>

          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center"
            style={{
              background: "var(--accent-radial)",
              boxShadow: "var(--accent-shadow)",
            }}
            aria-hidden="true"
          >
            <div className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
          </div>
        </div>

        <p className="mt-2 text-sm text-zinc-600">{desc}</p>

        <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
          {cta}
          <span className="transition group-hover:translate-x-0.5">→</span>
        </div>
      </div>
    </Link>
  );
}

function GlassPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgba(255,255,255,0.70)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
      }}
    >
      <div className="text-sm font-semibold text-zinc-900">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
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
    <div className="space-y-6">
      {/* HERO BANNER: no border, colored, floating */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(46,66,78,0.16) 0%, rgba(255,255,255,0.55) 55%, rgba(255,255,255,0.70) 100%)",
          boxShadow: "0 18px 60px rgba(0,0,0,0.10)",
        }}
      >
        <div
          className="px-7 py-7"
          style={{
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-xs font-semibold tracking-wide text-zinc-600 uppercase">
                DeskXP Hero Portal
              </div>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
                Welcome back, {displayName}
              </h1>

              <p className="mt-2 text-sm text-zinc-600">
                Quick access to your profile, payroll, and contracts.
              </p>
            </div>

            <div className="hidden sm:flex items-center">
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[var(--accent)]/10 text-[var(--accent)]">
                Access active
              </span>
            </div>
          </div>
        </div>

        <div className="h-10" style={{ background: "var(--accent-gradient)", opacity: 0.55 }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ModuleCard
              href="/profile"
              title="Profile"
              desc="View and manage your employee information."
              cta="Open profile"
            />
            <ModuleCard
              href="/payroll"
              title="Payroll"
              desc="Access salary records and payout history."
              cta="View payroll"
            />
            <ModuleCard
              href="/contracts"
              title="Contracts"
              desc="Review employment and service agreements."
              cta="View contracts"
            />
          </div>

          <GlassPanel title="Quick actions">
            <div className="flex flex-wrap gap-2">
              {[
                { href: "/profile", label: "Update profile" },
                { href: "/payroll", label: "Check latest payroll" },
                { href: "/contracts", label: "View contract" },
              ].map((b) => (
                <Link
                  key={b.href}
                  href={b.href}
                  className="rounded-xl px-3 py-2 text-sm font-medium transition"
                  style={{
                    background: "rgba(255,255,255,0.70)",
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  {b.label}
                </Link>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Right rail */}
        <div className="lg:col-span-4 space-y-6">
          <GlassPanel title="Your status">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Access</span>
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold bg-[var(--accent)]/10 text-[var(--accent)]">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-500">Name</span>
                <span className="font-medium text-zinc-900 truncate max-w-[200px]">
                  {fullName || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-500">Email</span>
                <span className="font-medium text-zinc-900 truncate max-w-[200px]">
                  {email}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <Link
                href="/api/auth/signout"
                className="text-sm font-medium text-[var(--accent)] hover:underline"
              >
                Sign out
              </Link>
            </div>
          </GlassPanel>

          <GlassPanel title="Announcements">
            <div className="space-y-3 text-sm text-zinc-600">
              {announcements.length === 0 ? (
                <div className="rounded-xl p-3 bg-white/70 border border-black/5">
                  No announcements posted.
                </div>
              ) : (
                announcements.slice(0, 5).map((a, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl p-3 bg-white/70 border border-black/5"
                  >
                    {a.message}
                  </div>
                ))
              )}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
