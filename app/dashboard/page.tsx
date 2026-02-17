import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

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

export default async function Dashboard() {
  const session = await getServerSession();
  const email = session?.user?.email;

  if (!email) redirect("/api/auth/signin");

  const allowed = await isAllowed(email);
  if (!allowed) redirect("/denied");

  return (
    <main style={{ padding: 40 }}>
      <h1>Dashboard</h1>
      <p>Allowed: {email}</p>

      <ul style={{ marginTop: 16, lineHeight: 2 }}>
        <li><Link href="/profile">Profile</Link></li>
        <li><Link href="/payroll">Payroll</Link></li>
        <li><Link href="/contracts">Contracts</Link></li>
      </ul>

      <p style={{ marginTop: 24 }}>
        <Link href="/api/auth/signout">Sign out</Link>
      </p>
    </main>
  );
}
