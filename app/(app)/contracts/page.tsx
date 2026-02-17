import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

type ContractRow = {
  title?: string;
  signed_date?: string;
  file_url?: string;
  status?: string;
  notes?: string;
};

async function fetchContracts(email: string) {
  const base = process.env.APPS_SCRIPT_BASE_URL!;
  const key = process.env.APPS_SCRIPT_KEY!;
  const url = `${base}?path=contracts&key=${encodeURIComponent(
    key
  )}&email=${encodeURIComponent(email)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.contracts || []) as Array<ContractRow>;
}

function formatDateManila(input?: string): string {
  if (!input) return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function StatusPill({ status }: { status?: string }) {
  const s = (status || "Active").trim();
  const key = s.toLowerCase();

  const styles =
    key.includes("signed") || key.includes("completed")
      ? "bg-emerald-500/20 text-emerald-700 ring-emerald-500/30"
      : key.includes("pending") || key.includes("await")
      ? "bg-amber-500/20 text-amber-700 ring-amber-500/30"
      : key.includes("expired") || key.includes("ended")
      ? "bg-rose-500/20 text-rose-700 ring-rose-500/30"
      : "bg-slate-200 text-slate-700 ring-slate-300";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        styles
      )}
    >
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {s}
    </span>
  );
}

export default async function ContractsPage() {
  const session = await getServerSession();
  const email = session?.user?.email;

  if (!email) redirect("/api/auth/signin");

  const rows = await fetchContracts(email);

  return (
    <main className="px-6 pb-10 pt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Contracts
        </h1>

        <p className="text-sm text-slate-500">
          Signed agreements and employment documents tied to your profile.
        </p>

        <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Logged in as{" "}
          <span className="font-medium text-slate-900">{email}</span>
        </div>
      </div>

      {/* Empty state */}
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-slate-100">
            📄
          </div>
          <h2 className="text-base font-semibold text-slate-900">
            No contracts found
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            If you expect to see a contract here, contact Ops.
          </p>
        </div>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Your documents
            </h2>
            <span className="text-xs text-slate-500">
              {rows.length} item(s)
            </span>
          </div>

          {/* List */}
          <ul className="divide-y divide-slate-200">
            {rows.map((c, idx) => {
              const title = c.title?.trim() || "Untitled Contract";
              const signed = formatDateManila(c.signed_date);

              return (
                <li
                  key={`${title}-${idx}`}
                  className="px-5 py-4 transition hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Left */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {title}
                        </p>
                        <StatusPill status={c.status} />
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        Signed:{" "}
                        <span className="text-slate-700">{signed}</span>
                      </p>

                      {c.notes ? (
                        <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                          {c.notes}
                        </p>
                      ) : null}
                    </div>

                    {/* Action */}
                    <div>
                      {c.file_url ? (
                        <a
                          href={c.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-500/20"
                        >
                          Open
                        </a>
                      ) : (
                        <span className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs text-slate-500">
                          No file
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
