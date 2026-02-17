import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

/* ---------------- Allowlist Gate ---------------- */

async function isAllowed(email: string) {
  const base = process.env.APPS_SCRIPT_BASE_URL!;
  const key = process.env.APPS_SCRIPT_KEY!;
  const url = `${base}?path=allowed-users&key=${encodeURIComponent(key)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return false;

  const data = await res.json();
  const users = (data?.users || []) as Array<{ email: string; status: string }>;

  const u = users.find(
    (x) => (x.email || "").toLowerCase() === email.toLowerCase()
  );

  return !!u && (u.status || "active").toLowerCase() === "active";
}

/* ---------------- Profile Fetch (KEEP WORKING) ---------------- */

type AnyRecord = Record<string, any>;

function pickRecord(payload: any): AnyRecord | null {
  if (!payload) return null;

  const direct =
    payload.profile || payload.employee || payload.data || payload.record;

  if (direct && typeof direct === "object" && !Array.isArray(direct)) return direct;

  const list =
    payload.employees ||
    payload.records ||
    payload.rows ||
    payload.data ||
    payload.items;

  if (Array.isArray(list) && list.length) return list[0];

  if (typeof payload === "object" && !Array.isArray(payload)) return payload;

  return null;
}

async function getProfile(email: string) {
  const base = process.env.APPS_SCRIPT_BASE_URL!;
  const key = process.env.APPS_SCRIPT_KEY!;

  const url = `${base}?path=profile&email=${encodeURIComponent(
    email
  )}&key=${encodeURIComponent(key)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return {
      ok: false as const,
      error: `Profile fetch failed (${res.status})`,
      record: null as AnyRecord | null,
    };
  }

  const data = await res.json();
  const record = pickRecord(data);

  if (!record) {
    return {
      ok: false as const,
      error: "No profile record returned by API.",
      record: null as AnyRecord | null,
    };
  }

  return { ok: true as const, error: null as string | null, record };
}

/* ---------------- UI Blocks ---------------- */

function GlassCard({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.70)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
      }}
    >
      <div className="px-6 py-5 flex items-start justify-between gap-6">
        <div>
          <div className="text-sm font-semibold text-zinc-900">{title}</div>
          {subtitle ? <div className="mt-1 text-sm text-zinc-600">{subtitle}</div> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="px-6 pb-6">{children}</div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
      style={{
        background: "rgba(0,114,54,0.12)",
        color: "var(--accent, #007236)",
        border: "1px solid rgba(0,114,54,0.18)",
      }}
    >
      {children}
    </span>
  );
}

/* ---------------- Helpers ---------------- */

function normalizeKey(k: string) {
  return String(k || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function getAny(record: AnyRecord, keys: string[]) {
  const want = keys.map(normalizeKey);

  for (const [k, v] of Object.entries(record)) {
    const nk = normalizeKey(k);
    if (want.includes(nk)) return v;
  }

  for (const [k, v] of Object.entries(record)) {
    const nk = normalizeKey(k);
    if (want.some((w) => nk.includes(w) || w.includes(nk))) return v;
  }

  return undefined;
}

function formatValue(v: any) {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

/* ---------------- Date formatting (GMT+8) ---------------- */

// Convert UTC ISO string to Asia/Manila calendar date, then format dd Mmmm yyyy.
// Also supports sheet-style M/D/YYYY.
function formatDateGMT8(input: any) {
  if (input === null || input === undefined || input === "") return "—";
  const s = String(input).trim();
  if (!s) return "—";

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  // If it's M/D/YYYY, treat as literal sheet date (no tz math)
  const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) {
    const mm = Number(mdy[1]);
    const dd = Number(mdy[2]);
    const yyyy = Number(mdy[3]);
    if (yyyy && mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      return `${String(dd).padStart(2, "0")} ${monthNames[mm - 1]} ${yyyy}`;
    }
  }

  // If it's ISO (with or without time), parse and shift to GMT+8 calendar date
  // IMPORTANT: We use Intl with timeZone to avoid manual errors.
  const isoLike = s.match(/^\d{4}-\d{2}-\d{2}/);
  if (isoLike) {
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "long",
        day: "2-digit",
      }).formatToParts(d);

      const day = parts.find((p) => p.type === "day")?.value;
      const month = parts.find((p) => p.type === "month")?.value;
      const year = parts.find((p) => p.type === "year")?.value;

      if (day && month && year) return `${day} ${month} ${year}`;
    }
  }

  // fallback
  return s;
}

function Row({
  label,
  value,
  isDate,
}: {
  label: string;
  value: any;
  isDate?: boolean;
}) {
  const shown = isDate ? formatDateGMT8(value) : formatValue(value);

  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <div className="text-sm font-medium text-zinc-600">{label}</div>
      <div className="text-sm font-semibold text-zinc-900 text-right max-w-[60%] break-words">
        {shown}
      </div>
    </div>
  );
}

function SectionBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-black/5 bg-white/60 divide-y divide-black/5">
      <div className="px-4 py-3">
        <div className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          {title}
        </div>
      </div>
      <div className="px-4 divide-y divide-black/5">{children}</div>
    </div>
  );
}

/* ---------------- Page ---------------- */

export default async function ProfilePage() {
  const session = await getServerSession();
  const email = session?.user?.email;
  const googleName = (session?.user?.name || "").trim();

  if (!email) redirect("/api/auth/signin");

  const allowed = await isAllowed(email);
  if (!allowed) redirect("/denied");

  const result = await getProfile(email);
  const record = result.record || {};

  const sheetFullName = getAny(record, ["full_name", "full name", "name"]);
  const displayName = String(sheetFullName || googleName || "Profile");

  const dob = getAny(record, ["date_of_birth", "date of birth", "dob"]);
  const mobile = getAny(record, ["mobile_number", "mobile number", "mobile", "phone", "contact"]);
  const address = getAny(record, ["address"]);

  const status = getAny(record, ["status"]);
  const client = getAny(record, ["client"]);
  const rate = getAny(record, ["rate"]);
  const startDate = getAny(record, ["start_date", "start date"]);
  const paymentMethod = getAny(record, ["payment_method", "payment method"]);

  return (
    <div className="space-y-6">
      {/* Top hero */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(46,66,78,0.16) 0%, rgba(255,255,255,0.55) 55%, rgba(255,255,255,0.70) 100%)",
          boxShadow: "0 18px 60px rgba(0,0,0,0.10)",
        }}
      >
        <div className="px-7 py-7" style={{ backdropFilter: "blur(10px)" }}>
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-xs font-semibold tracking-wide text-zinc-600 uppercase">
                DeskXP Hero Portal
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
                Profile
              </h1>
              <p className="mt-2 text-sm text-zinc-600">
                Viewing profile for <span className="font-medium">{displayName}</span>
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <Pill>Employee</Pill>
            </div>
          </div>
        </div>

        <div className="h-10" style={{ background: "var(--accent-gradient)", opacity: 0.55 }} />
      </div>

      {!result.ok ? (
        <GlassCard
          title="Profile unavailable"
          subtitle="We couldn’t load your profile data."
          right={<Pill>Action needed</Pill>}
        >
          <div className="text-sm text-zinc-700">
            <div className="font-medium">Error</div>
            <div className="mt-1 text-zinc-600">{result.error}</div>
          </div>
        </GlassCard>
      ) : (
        <GlassCard
          title={displayName}
          subtitle={undefined} // REMOVE email from top
          right={undefined}    // REMOVE Permanent/Status pill from top
        >
          <div className="grid gap-6 md:grid-cols-2">
            {/* Column 1 */}
            <SectionBox title="Personal info">
              <Row label="Full name" value={sheetFullName || googleName} />
              <Row label="Email" value={email} />
              <Row label="DOB" value={dob} isDate />
              <Row label="Mobile" value={mobile} />
              <Row label="Address" value={address} />
            </SectionBox>

            {/* Column 2 */}
            <SectionBox title="Work info">
              <Row label="Status" value={status} />
              <Row label="Client" value={client} />
              <Row label="Rate" value={rate} />
              <Row label="Start Date" value={startDate} isDate />
              <Row label="Payment method" value={paymentMethod} />
            </SectionBox>
          </div>

          <div className="mt-5 text-sm text-zinc-600">
            If any of the information above is incorrect, contact DeskXP admin to update the database.
          </div>
        </GlassCard>
      )}
    </div>
  );
}
