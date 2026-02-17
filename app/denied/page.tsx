"use client";

import { signOut } from "next-auth/react";

export default function Denied() {
  return (
    <main style={{ padding: 40 }}>
      <h1>Access denied</h1>
      <p>Your Google account is not authorized for this portal.</p>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        style={{ padding: "10px 16px", fontSize: 16, cursor: "pointer" }}
      >
        Sign out
      </button>
    </main>
  );
}
