import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

async function fetchPayroll(email: string) {
  const base = process.env.APPS_SCRIPT_BASE_URL!;
  const key = process.env.APPS_SCRIPT_KEY!;
  const url = `${base}?path=payroll&key=${encodeURIComponent(key)}&email=${encodeURIComponent(email)}`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  return (data?.payroll || []) as Array<any>;
}

export default async function PayrollPage() {
  const session = await getServerSession();
  const email = session?.user?.email;

  if (!email) redirect("/api/auth/signin");

  const rows = await fetchPayroll(email);

  return (
    <main style={{ padding: 40 }}>
      <h1>Payroll</h1>
      <p>Logged in as: {email}</p>

      {rows.length === 0 ? (
        <p>No payroll records found.</p>
      ) : (
        <pre style={{ background: "#111", color: "#0f0", padding: 16 }}>
{JSON.stringify(rows, null, 2)}
        </pre>
      )}
    </main>
  );
}
