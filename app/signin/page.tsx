"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617] px-6">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute left-1/4 top-2/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        {/* Title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/10">
            <span className="text-lg">🛡️</span>
          </div>

          <h1 className="text-2xl font-semibold text-white">
            DeskXP Hero Portal
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Secure employee access
          </p>
        </div>

        {/* Google Button */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-[0.99]"
        >
          {/* Google logo */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.2 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.6 6.5 29 4.5 24 4.5 12.9 4.5 4 13.4 4 24.5S12.9 44.5 24 44.5 44 35.6 44 24.5c0-1.3-.1-2.7-.4-4z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.6 6.5 29 4.5 24 4.5c-7.7 0-14.3 4.4-17.7 10.2z"
            />
            <path
              fill="#4CAF50"
              d="M24 44.5c5.1 0 9.6-2 13-5.3l-6-4.9C29.2 35 26.8 36 24 36c-5.2 0-9.6-3.5-11.1-8.2l-6.5 5C9.7 40.3 16.3 44.5 24 44.5z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-3 5.2-5.6 6.8l6 4.9c3.5-3.2 5.6-7.9 5.6-13.2 0-1.3-.1-2.7-.4-4z"
            />
          </svg>

          Sign in with Google
        </button>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-white/60">Authorized employees only</p>
        </div>

        {/* Subtle bottom divider */}
        <div className="mt-6 border-t border-white/10 pt-4 text-center">
          <p className="text-[11px] text-white/45">
            If you can’t sign in, contact DeskXP Ops to be added to the allowlist.
          </p>
        </div>
      </div>
    </main>
  );
}
