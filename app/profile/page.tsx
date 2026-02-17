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

async function fetchProfile(email: string) {
  const base = process.env.APPS_SCRIPT_BASE_URL!;
  const key = process.env.APPS_SCRIPT_KEY!;
  const url = `${base}?path=profile&key=${encodeURIComponent(key)}&email=${encodeURIComponent(email)}`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  return data?.profile || null;
}

export default async function ProfilePage() {
  const session = await getServerSession();
  const email = session?.user?.email;

  if (!email) redirect("/api/auth/signin");
  if (!(await isAllowed(email))) redirect("/denied");

  const profile = await fetchProfile(email);

  return (
    <main style={{ padding: 40 }}>
      <h1>Profile</h1>

      <p><b>Email:</b> {email}</p>

      {profile ? (
        <pre style={{ background: "#111", color: "#0f0", padding: 16, borderRadius: 8, overflowX: "auto" }}>
{JSON.stringify(profile, null, 2)}
        </pre>
      ) : (
        <p>No profile record found in Employees sheet.</p>
      )}

      <p style={{ marginTop: 16 }}>
        <Link href="/dashboard">Back to dashboard</Link>
      </p>
    </main>
  );
}
