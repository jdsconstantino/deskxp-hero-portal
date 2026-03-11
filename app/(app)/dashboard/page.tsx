import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Wallet,
  FileText,
  UserCircle2,
  Bell,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  LogOut,
  Megaphone,
} from "lucide-react";

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

type Announcement = {
  message?: string;
  title?: string;
  body?: string;
  content?: string;
};

async function getAnnouncements(email: string): Promise<Announcement[]> {
  const base = process.env.WORKER_BASE_URL!;
  const token = process.env.WORKER_TOKEN!;
  const url = `${base}/api/announcements?email=${encodeURIComponent(email)}`;

  console.log("ANNOUNCEMENTS URL:", url);

  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("ANNOUNCEMENTS STATUS:", res.status);

  const raw = await res.text();
  console.log("ANNOUNCEMENTS RAW BODY:", raw);

  if (!res.ok) {
    return [];
  }

  let data: any = {};
  try {
    data = JSON.parse(raw);
  } catch {
    console.log("ANNOUNCEMENTS JSON PARSE ERROR");
    return [];
  }

  console.log("ANNOUNCEMENTS PARSED:", JSON.stringify(data));

  if (Array.isArray(data)) return data as Announcement[];
  if (Array.isArray(data?.announcements)) return data.announcements as Announcement[];
  if (Array.isArray(data?.data)) return data.data as Announcement[];

  return [];
}

/* ---------------- UI ---------------- */

function StatChip({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/70 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-sm font-semibold text-zinc-900">{value}</div>
    </div>
  );
}

function PrimaryAction({
  href,
  label,
  icon,
  secondary = false,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition",
        secondary
          ? "border border-black/8 bg-white/80 text-zinc-800 hover:bg-white"
          : "text-white shadow-[0_12px_30px_rgba(0,0,0,0.16)] hover:translate-y-[-1px]",
      ].join(" ")}
      style={
        secondary
          ? undefined
          : {
              background: "linear-gradient(135deg, #2f6f63 0%, #245348 100%)",
            }
      }
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function ModuleCard({
  href,
  eyebrow,
  title,
  desc,
  cta,
  icon,
}: {
  href: string;
  eyebrow: string;
  title: string;
  desc: string;
  cta: string;
  icon: React.ReactNode;
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

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-zinc-900">
              {title}
            </h3>
            <p className="mt-2 max-w-[34ch] text-sm leading-6 text-zinc-600">
              {desc}
            </p>
          </div>

          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[var(--accent)]"
            style={{
              background: "rgba(255,255,255,0.9)",
              boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
            aria-hidden="true"
          >
            {icon}
          </div>
        </div>

        <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
          <span>{cta}</span>
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
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
              <PrimaryAction
                href="/payroll"
                label="Open payroll"
                icon={<Wallet className="h-4 w-4" />}
              />
              <PrimaryAction
                href="/contracts"
                label="View contracts"
                icon={<FileText className="h-4 w-4" />}
                secondary
              />
              <PrimaryAction
                href="/profile"
                label="Manage profile"
                icon={<UserCircle2 className="h-4 w-4" />}
                secondary
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[360px]">
            <StatChip
              label="Access"
              value="Active"
              icon={<ShieldCheck className="h-3.5 w-3.5" />}
            />
            <StatChip
             label="Announcements"
             value={`${announcements.length}`}
              icon={<Megaphone className="h-3.5 w-3.5" />}
            />
            <StatChip
              label="Account"
              value="Ready"
              icon={<Sparkles className="h-3.5 w-3.5" />}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <ModuleCard
              href="/payroll"
              eyebrow="Finance"
              title="Payroll"
              desc="View salary records, payout history, and your latest payroll details."
              cta="Open payroll"
              icon={<Wallet className="h-5 w-5" />}
            />
            <ModuleCard
              href="/contracts"
              eyebrow="Documents"
              title="Contracts"
              desc="Review employment and service agreements available to your account."
              cta="Review contracts"
              icon={<FileText className="h-5 w-5" />}
            />
            <ModuleCard
              href="/profile"
              eyebrow="Account"
              title="Profile"
              desc="Update your employee details and keep your account information current."
              cta="Manage profile"
              icon={<UserCircle2 className="h-5 w-5" />}
            />
          </div>

          <SectionCard title="Quick access">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  href: "/payroll",
                  label: "Latest payroll",
                  icon: <Wallet className="h-4 w-4 text-[var(--accent)]" />,
                },
                {
                  href: "/contracts",
                  label: "My contracts",
                  icon: <FileText className="h-4 w-4 text-[var(--accent)]" />,
                },
                {
                  href: "/profile",
                  label: "Edit profile",
                  icon: <UserCircle2 className="h-4 w-4 text-[var(--accent)]" />,
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white/80 px-4 py-4 text-sm font-semibold text-zinc-800 transition hover:bg-white hover:shadow-sm"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)]/10">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
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
                {announcements.slice(0, 5).map((a: Announcement, idx: number) => {
                  const text =
                    a.message ||
                    a.title ||
                    a.body ||
                    a.content ||
                    "Untitled announcement";

                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white/80 px-4 py-4 text-sm leading-6 text-zinc-700"
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                        <Bell className="h-4 w-4" />
                      </span>
                      <div>{text}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <SectionCard title="Your account">
            <div className="space-y-4">
              <div className="rounded-2xl border border-black/5 bg-white/80 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
                    <UserCircle2 className="h-5 w-5" />
                  </span>

                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-900">
                      {fullName || "—"}
                    </div>
                    <div className="mt-1 break-all text-sm text-zinc-600">{email}</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl border border-black/5 bg-white/80 px-4 py-3">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Access status</span>
                  </div>
                  <div className="mt-2 inline-flex items-center rounded-full bg-[var(--accent)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--accent)]">
                    Active
                  </div>
                </div>

                <div className="rounded-2xl border border-black/5 bg-white/80 px-4 py-3">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Portal</span>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-900">
                    Hero access enabled
                  </div>
                </div>
              </div>

              <Link
                href="/api/auth/signout"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-black/8 bg-white/80 px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-white"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}