"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";

type AppShellProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "⌂",
  },
  {
    href: "/challenges",
    label: "Challenges",
    icon: "⌁",
  },
  {
    href: "/profile",
    label: "Profile",
    icon: "◈",
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname.startsWith("/labs");
  }

  return pathname.startsWith(href);
}

function MenuIcon() {
  return (
    <span className="flex h-5 w-5 flex-col justify-center gap-1">
      <span className="block h-0.5 w-5 rounded-full bg-current" />
      <span className="block h-0.5 w-5 rounded-full bg-current" />
      <span className="block h-0.5 w-5 rounded-full bg-current" />
    </span>
  );
}

export function AppShell({ children, title, subtitle, actions }: AppShellProps) {
  const pathname = usePathname();
  const { user, logout } = useRequireAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sidebarWidthClass = sidebarOpen ? "xl:w-72" : "xl:w-20";
  const contentPaddingClass = sidebarOpen ? "xl:pl-72" : "xl:pl-20";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.12),transparent_28%)]" />
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(148,163,184,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.028)_1px,transparent_1px)] bg-[size:44px_44px]" />

      <aside
        className={`fixed left-0 top-0 z-20 hidden h-screen border-r border-slate-800 bg-slate-950/90 backdrop-blur-xl transition-all duration-300 xl:block ${sidebarWidthClass}`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-800 p-4">
            {sidebarOpen ? (
              <div className="flex items-center justify-between gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 overflow-hidden"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-lg font-black shadow-lg shadow-blue-950/40">
                    N
                  </div>

                  <div className="min-w-0">
                    <p className="font-black leading-tight">Network Lab</p>
                    <p className="text-xs text-slate-500">
                      Troubleshooting Platform
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                >
                  <MenuIcon />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
                  aria-label="Expand sidebar"
                  title="Expand sidebar"
                >
                  <MenuIcon />
                </button>

                <Link
                  href="/dashboard"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-lg font-black shadow-lg shadow-blue-950/40"
                  title="Network Lab"
                >
                  N
                </Link>
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`flex items-center rounded-2xl border text-sm font-semibold transition ${
                    sidebarOpen
                      ? "gap-3 px-4 py-3"
                      : "justify-center px-0 py-3"
                  } ${
                    active
                      ? "border-blue-500/40 bg-blue-500/15 text-blue-300 shadow-[0_0_24px_rgba(37,99,235,0.16)]"
                      : "border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900 hover:text-slate-100"
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-base">
                    {item.icon}
                  </span>

                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-800 p-4">
            {sidebarOpen ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Signed in
                </p>
                <p className="mt-2 truncate font-semibold text-slate-200">
                  {user?.name || user?.email || "User"}
                </p>
                <button
                  type="button"
                  onClick={logout}
                  className="mt-4 w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={logout}
                title="Logout"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
              >
                ⏻
              </button>
            )}
          </div>
        </div>
      </aside>

      <section
        className={`relative z-10 transition-all duration-300 ${contentPaddingClass}`}
      >
        <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
          <div className="flex min-h-24 flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_16px_rgba(34,197,94,0.65)]" />
                Production simulator online
              </div>

              <h1 className="text-3xl font-black tracking-tight">{title}</h1>

              {subtitle && (
                <p className="mt-2 max-w-3xl text-sm text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  User
                </p>
                <p className="text-sm font-semibold text-slate-200">
                  {user?.name || user?.email || "User"}
                </p>
              </div>

              {actions}
            </div>
          </div>
        </header>

        <div className="p-6">{children}</div>
      </section>
    </main>
  );
}

export default AppShell;