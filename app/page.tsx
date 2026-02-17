"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return <main style={{ padding: 40 }}>Loading...</main>;
  }

  if (!session) {
    return (
      <main style={{ padding: 40 }}>
        <h1>DeskXP Hero Portal</h1>
        <button
          onClick={() => signIn("google")}
          style={{ padding: "10px 16px", fontSize: 16, cursor: "pointer" }}
        >
          Sign in with Google
        </button>
      </main>
    );
  }

  return (
    <main style={{ padding: 40 }}>
      <p>Redirecting...</p>
      <button
        onClick={() => signOut()}
        style={{ padding: "10px 16px", fontSize: 16, cursor: "pointer" }}
      >
        Sign out
      </button>
    </main>
  );
}
