import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

async function fetchContracts(email: string) {
  const base = process.env.APPS_SCRIPT_BASE_URL!;
  const key = process.env.APPS_SCRIPT_KEY!;
  const url = `${base}?path=contracts&key=${encodeURIComponent(key)}&email=${encodeURIComponent(email)}`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  return (data?.contracts || []) as Array<any>;
}

export default async function ContractsPage() {
  const session = await getServerSession();
  const email = session?.user?.email;

  if (!email) redirect("/api/auth/signin");

  const rows = await fetchContracts(email);

  return (
    <main style={{ padding: 40 }}>
      <h1>Contracts</h1>
      <p>Logged in as: {email}</p>

      {rows.length === 0 ? (
        <p>No contracts found.</p>
      ) : (
        <ul>
          {rows.map((c, idx) => (
            <li key={idx} style={{ marginBottom: 10 }}>
              <a href={c.file_url} target="_blank" rel="noreferrer">
                {c.title || "Untitled Contract"}
              </a>
              {c.signed_date ? <span> — {String(c.signed_date)}</span> : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
