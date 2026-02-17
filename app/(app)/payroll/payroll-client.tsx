"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";

type AnyRecord = Record<string, any>;

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

function formatDateGMT8(input: any) {
  if (input === null || input === undefined || input === "") return "—";
  const s = String(input).trim();
  if (!s) return "—";

  const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) {
    const mm = Number(mdy[1]);
    const dd = Number(mdy[2]);
    const yyyy = Number(mdy[3]);
    const monthNames = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December",
    ];
    if (yyyy && mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      return `${String(dd).padStart(2, "0")} ${monthNames[mm - 1]} ${yyyy}`;
    }
  }

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

  return s;
}

function formatMoneyPHP(v: any) {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(String(v).replace(/,/g, ""));
  if (Number.isNaN(n)) return String(v);
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatNumber(v: any) {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(String(v).replace(/,/g, ""));
  if (Number.isNaN(n)) return String(v);
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

function statusPillStyle(statusRaw: string) {
  const t = (statusRaw || "").toLowerCase().trim();

  if (t === "paid") {
    return {
      bg: "rgba(0,114,54,0.14)",
      bd: "rgba(0,114,54,0.20)",
      fg: "var(--accent,#007236)",
    };
  }

  if (t === "pending") {
    return {
      bg: "rgba(95,167,199,0.18)",
      bd: "rgba(95,167,199,0.26)",
      fg: "#1C2B33",
    };
  }

  return {
    bg: "rgba(0,0,0,0.06)",
    bd: "rgba(0,0,0,0.10)",
    fg: "#111827",
  };
}

function Pill({ text }: { text: string }) {
  const style = statusPillStyle(text);
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
      style={{
        background: style.bg,
        border: `1px solid ${style.bd}`,
        color: style.fg,
      }}
    >
      {text || "—"}
    </span>
  );
}

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
          {subtitle ? (
            <div className="mt-1 text-sm text-zinc-600">{subtitle}</div>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="px-6 pb-6">{children}</div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/60 overflow-hidden">
      <div className="px-5 py-3 border-b border-black/5">
        <div className="text-xs uppercase tracking-wide text-zinc-500 font-semibold">
          {title}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function KV({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-2">
      <div className="text-sm text-zinc-500">{label}</div>
      <div className="text-sm font-medium text-zinc-900 text-right max-w-[60%] break-words">
        {value}
      </div>
    </div>
  );
}

function buildPeriodLabel(r: AnyRecord) {
  const start = getAny(r, ["period_start", "period start"]);
  const end = getAny(r, ["period_end", "period end"]);
  const a = formatDateGMT8(start);
  const b = formatDateGMT8(end);
  if (a === "—" && b === "—") return "Pay period —";
  if (a !== "—" && b !== "—") return `${a} → ${b}`;
  return a !== "—" ? `${a} → —` : `— → ${b}`;
}

function stableKey(r: AnyRecord, idx: number) {
  const email = getAny(r, ["email"]);
  const ps = getAny(r, ["period_start", "period start"]);
  const pe = getAny(r, ["period_end", "period end"]);
  const pd = getAny(r, ["pay_date", "pay date"]);
  const s = `${email ?? ""}|${ps ?? ""}|${pe ?? ""}|${pd ?? ""}`;
  return s.trim() ? s : `row-${idx}`;
}

export default function PayrollClient({
  ok,
  error,
  email,
  rows,
}: {
  ok: boolean;
  error: string | null;
  email: string;
  rows: AnyRecord[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AnyRecord | null>(null);

  const safeRows = useMemo(() => rows || [], [rows]);

  function openDetails(r: AnyRecord) {
    setSelected(r);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setSelected(null);
  }

  if (!ok) {
    return (
      <GlassCard title="Payroll unavailable" subtitle="We couldn’t load your payroll records.">
        <div className="text-sm text-zinc-700">
          <div className="font-medium">Error</div>
          <div className="mt-1 text-zinc-600">{error}</div>
        </div>
      </GlassCard>
    );
  }

  if (safeRows.length === 0) {
    return (
      <GlassCard title="No payroll records yet" subtitle="Nothing to show for this email.">
        <div className="text-sm text-zinc-600">
          Once payroll rows exist for <span className="font-mono">{email}</span>, they will appear here.
        </div>
      </GlassCard>
    );
  }

  return (
    <>
      <GlassCard
        title="Payroll history"
        subtitle={`${safeRows.length} record(s) found`}
        right={<div className="text-xs text-zinc-500">Asia/Manila (GMT+8)</div>}
      >
        <div className="space-y-3">
          {safeRows.map((r, idx) => {
            const period = buildPeriodLabel(r);
            const status = String(getAny(r, ["status"]) || "—");
            const key = stableKey(r, idx);

            return (
              <div
                key={key}
                className="rounded-2xl border border-black/5 bg-white/60 px-4 py-4 flex items-center justify-between gap-4"
              >
                {/* Col 1: Pay period */}
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-zinc-900 whitespace-normal break-words">
                    {period}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    Click “View details” for breakdown.
                  </div>
                </div>

                {/* Col 2: Status */}
                <div className="shrink-0">
                  <Pill text={status} />
                </div>

                {/* Col 3: Action */}
                <div className="shrink-0">
                  <button
                    onClick={() => openDetails(r)}
                    className="rounded-xl px-4 py-2 text-sm font-semibold transition"
                    style={{
                      background: "rgba(46,66,78,0.10)",
                      border: "1px solid rgba(46,66,78,0.16)",
                      color: "#111827",
                    }}
                  >
                    View details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Modal */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={close}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 translate-y-2 scale-[0.98]"
                enterTo="opacity-100 translate-y-0 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0 scale-100"
                leaveTo="opacity-0 translate-y-2 scale-[0.98]"
              >
                <Dialog.Panel
                  className="w-full max-w-2xl rounded-3xl overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.78)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 30px 80px rgba(0,0,0,0.22)",
                  }}
                >
                  <div className="px-6 py-5 border-b border-black/5 flex items-start justify-between gap-6">
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-zinc-900">
                        Payroll details
                      </Dialog.Title>
                      <div className="mt-1 text-sm text-zinc-600">
                        {selected ? buildPeriodLabel(selected) : "—"}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {selected ? (
                        <Pill text={String(getAny(selected, ["status"]) || "—")} />
                      ) : null}

                      <button
                        onClick={close}
                        className="rounded-xl px-3 py-2 text-sm font-semibold hover:bg-black/[0.04] transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  <div className="px-6 py-6 space-y-4">
                    {selected ? (
                      <>
                        {/* Summary */}
                        <Section title="Summary">
                          <div className="divide-y divide-black/5">
                            <KV
                              label="Position"
                              value={formatValue(getAny(selected, ["position"]))}
                            />
                            <KV
                              label="Hours"
                              value={formatValue(getAny(selected, ["hours"]))}
                            />
                            <KV
                              label="Rate"
                              value={formatNumber(getAny(selected, ["rate"]))}
                            />
                            <KV
                              label="Conversion rate"
                              value={formatNumber(
                                getAny(selected, [
                                  "conversion_rate",
                                  "conversion rate",
                                  "conversation_rate",
                                  "conversation rate",
                                ])
                              )}
                            />
                          </div>
                        </Section>

                        {/* Totals */}
                        <Section title="Totals">
                          <div className="divide-y divide-black/5">
                            <KV
                              label="Total"
                              value={formatNumber(getAny(selected, ["total"]))}
                            />
                            <KV
                              label="Total PHP"
                              value={formatMoneyPHP(
                                getAny(selected, ["total_php", "total php"])
                              )}
                            />
                            <KV
                              label="Deduction"
                              value={formatMoneyPHP(getAny(selected, ["deduction"]))}
                            />
                            <KV
                              label="Net"
                              value={formatMoneyPHP(
                                getAny(selected, ["total_net", "total net", "net"])
                              )}
                            />
                          </div>
                        </Section>

                        {/* Payout */}
                        <Section title="Payout">
                          <div className="divide-y divide-black/5">
                            <KV
                              label="Pay date"
                              value={formatDateGMT8(
                                getAny(selected, ["pay_date", "pay date"])
                              )}
                            />
                            <KV
                              label="File"
                              value={
                                getAny(selected, ["file_url", "file url"]) ? (
                                  <Link
                                    href={String(getAny(selected, ["file_url", "file url"]))}
                                    target="_blank"
                                    className="font-semibold underline underline-offset-4"
                                    style={{ color: "var(--accent,#007236)" }}
                                  >
                                    Open file
                                  </Link>
                                ) : (
                                  "—"
                                )
                              }
                            />
                            <KV
                              label="Notes"
                              value={formatValue(getAny(selected, ["notes"]))}
                            />
                          </div>
                        </Section>
                      </>
                    ) : (
                      <div className="text-sm text-zinc-600">No record selected.</div>
                    )}
                  </div>

                  <div className="px-6 py-4 border-t border-black/5 text-xs text-zinc-500">
                    Dates are shown in Asia/Manila (GMT+8).
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
