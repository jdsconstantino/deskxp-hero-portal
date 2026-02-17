import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import PayrollClient from "./payroll-client";

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

/* ---------------- Payroll Fetch ---------------- */

type AnyRecord = Record<string, any>;

function pickList(payload: any): AnyRecord[] {
  if (!payload) return [];

  const list =
    payload.payroll ||
    payload.payrolls ||
    payload.records ||
    payload.rows ||
    payload.data ||
    payload.items;

  if (Array.isArray(list)) return list as AnyRecord[];
  if (Array.isArray(payload)) return payload as AnyRecord[];
  if (payload.data && Array.isArray(payload.data)) return payload.data;

  return [];
}

async function getPayroll(email: string) {
  const base = process.env.APPS_SCRIPT_BASE_URL!;
  const key = process.env.APPS_SCRIPT_KEY!;

  const url = `${base}?path=payroll&email=${encodeURIComponent(
    email
  )}&key=${encodeURIComponent(key)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return {
      ok: false as const,
      error: `Payroll fetch failed (${res.status})`,
      rows: [] as AnyRecord[],
    };
  }

  const data = await res.json();
  const rows = pickList(data);

  return { ok: true as const, error: null as string | null, rows };
}

export default async function PayrollPage() {
  const session = await getServerSession();
  const email = session?.user?.email;

  if (!email) redirect("/api/auth/signin");

  const allowed = await isAllowed(email);
  if (!allowed) redirect("/denied");

  const result = await getPayroll(email);

  // Keep sorting simple: pay_date desc, else period_end desc
  const rows = [...(result.rows || [])].sort((a, b) => {
    const ad = String(a?.pay_date || a?.payDate || "");
    const bd = String(b?.pay_date || b?.payDate || "");
    if (ad && bd && ad !== bd) return bd.localeCompare(ad);

    const ae = String(a?.period_end || a?.periodEnd || "");
    const be = String(b?.period_end || b?.periodEnd || "");
    return be.localeCompare(ae);
  });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(46,66,78,0.16) 0%, rgba(255,255,255,0.55) 55%, rgba(255,255,255,0.70) 100%)",
          boxShadow: "0 18px 60px rgba(0,0,0,0.10)",
        }}
      >
        <div className="px-7 py-7" style={{ backdropFilter: "blur(10px)" }}>
          <div>
            <div className="text-xs font-semibold tracking-wide text-zinc-600 uppercase">
              DeskXP Hero Portal
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
              Payroll
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Payout history and pay period details.
            </p>
          </div>
        </div>

        <div
          className="h-10"
          style={{ background: "var(--accent-gradient)", opacity: 0.55 }}
        />
      </div>

      <PayrollClient
        ok={result.ok}
        error={result.error}
        email={email}
        rows={rows}
      />
    </div>
  );
}
