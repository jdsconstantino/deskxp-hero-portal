"use client";

import { Fragment, ReactNode, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import { signOut } from "next-auth/react";

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
    { href: "/payroll", label: "Payroll" },
    { href: "/contracts", label: "Contracts" },
  ];

  const Logo = ({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) => (
    <div className="flex items-center gap-3">
      <Image
        src="https://deskxp.com/assets/header-logo.png"
        alt="DeskXP"
        width={118}
        height={30}
        priority
      />
      <span
        className={[
          "text-xs font-semibold tracking-wider",
          variant === "mobile" ? "text-white/70" : "text-[var(--accent)]",
        ].join(" ")}
      />
    </div>
  );

  const Nav = ({
    onNavigate,
    variant = "desktop",
  }: {
    onNavigate?: () => void;
    variant?: "desktop" | "mobile";
  }) => (
    <nav className="flex-1 px-3 py-3 space-y-1 text-sm">
      {navItems.map((item) => {
        const active = pathname === item.href;

        const activeClasses =
          variant === "mobile"
            ? "text-white bg-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.35)]"
            : "text-[var(--text)] bg-[var(--glass)] shadow-[0_10px_25px_rgba(0,0,0,0.25)]";

        const inactiveClasses =
          variant === "mobile"
            ? "text-white/80 hover:bg-white/10 hover:text-white"
            : "text-[var(--muted)] hover:bg-[var(--glass)]/70 hover:text-[var(--text)]";

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              onNavigate?.();
            }}
            className={[
              "relative flex items-center rounded-2xl px-4 py-2.5 font-medium",
              "transition-all duration-200 ease-out",
              variant === "mobile"
                ? "focus:outline-none focus:ring-2 focus:ring-white/20"
                : "focus:outline-none focus:ring-2 focus:ring-[var(--glass-border)]/60",
              active ? activeClasses : inactiveClasses,
            ].join(" ")}
          >
            <span
              className={[
                "absolute left-2 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full",
                "transition-all duration-200",
                active ? "opacity-100" : "opacity-0",
              ].join(" ")}
              style={{
                background: "var(--accent, #007236)",
                boxShadow: "0 0 18px rgba(0,114,54,0.45)",
              }}
              aria-hidden="true"
            />

            {active && (
              <span
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background:
                    variant === "mobile"
                      ? "linear-gradient(90deg, rgba(0,114,54,0.22) 0%, rgba(255,255,255,0) 55%)"
                      : "linear-gradient(90deg, rgba(0,114,54,0.14) 0%, rgba(255,255,255,0) 55%)",
                }}
                aria-hidden="true"
              />
            )}

            <span className="pl-3 relative">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const LogoutButton = ({
    variant = "desktop",
    onAfter,
  }: {
    variant?: "desktop" | "mobile";
    onAfter?: () => void;
  }) => (
    <button
      onClick={() => {
        onAfter?.();
        signOut({ callbackUrl: "/" });
      }}
      className={
        variant === "mobile"
          ? "w-full rounded-2xl px-4 py-2.5 text-sm font-semibold text-white/90 bg-white/10 hover:bg-white/15 transition"
          : "w-full rounded-2xl px-4 py-2.5 text-sm font-semibold text-[var(--text)] bg-[var(--glass)] hover:bg-[var(--glass)]/80 transition"
      }
    >
      Logout
    </button>
  );

  return (
    <div className="min-h-screen flex bg-[#EEF3F1] text-zinc-900">
      {/* Mobile drawer */}
      <Transition.Root show={mobileOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 md:hidden"
          onClose={setMobileOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-out duration-200"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in duration-150"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel
                  className={[
                    "pointer-events-auto w-screen max-w-xs flex flex-col relative",
                    "bg-[#0b141a]/95 backdrop-blur-xl",
                    "border-r border-white/10",
                    "shadow-[0_20px_80px_rgba(0,0,0,0.55)]",
                  ].join(" ")}
                >
                  <div
                    className="absolute inset-y-0 right-0 w-[2px] opacity-90"
                    style={{
                      background:
                        "linear-gradient(to bottom, transparent, rgba(95,167,199,0.45), transparent)",
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 w-6 pointer-events-none bg-gradient-to-r from-transparent to-black/15" />

                  <div className="h-16 flex items-center justify-between px-5">
                    <Logo variant="mobile" />
                    <button
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-2 py-1 text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
                      aria-label="Close menu"
                    >
                      ✕
                    </button>
                  </div>

                  <Nav
                    variant="mobile"
                    onNavigate={() => setMobileOpen(false)}
                  />

                  <div className="px-4 pb-3">
                    <LogoutButton
                      variant="mobile"
                      onAfter={() => setMobileOpen(false)}
                    />
                  </div>

                  <div className="p-4 text-xs text-white/50">hero.deskxp.com</div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <aside className="w-64 hidden md:flex flex-col bg-[var(--panel)] relative">
        <div
          className="absolute inset-y-0 right-0 w-[2px] opacity-90"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(95,167,199,0.45), transparent)",
          }}
        />
        <div className="absolute inset-y-0 right-0 w-6 pointer-events-none bg-gradient-to-r from-transparent to-black/10" />

        <div className="h-16 flex items-center px-6">
          <Logo variant="desktop" />
        </div>

        <Nav variant="desktop" />

        <div className="px-4 pb-3">
          <LogoutButton variant="desktop" />
        </div>

        <div className="p-4 text-xs text-[var(--muted)]">hero.deskxp.com</div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white/70 backdrop-blur border-b border-black/5 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden rounded-lg px-2 py-1 text-sm text-zinc-700 hover:bg-black/5 transition"
              aria-label="Open menu"
            >
              ☰
            </button>

            <div className="font-medium tracking-tight">Hero Portal</div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            Logout
          </button>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
