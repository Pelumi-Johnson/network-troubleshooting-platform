"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ReactNode, useSyncExternalStore } from "react";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";

type AppShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
};

type IconName =
  | "dashboard"
  | "warning"
  | "flask"
  | "terminal"
  | "file"
  | "route"
  | "list"
  | "chart"
  | "settings"
  | "search"
  | "bell"
  | "chevronDown"
  | "drawer";

const ACTIVE_LAB_HREF = "/labs/dns-failure";
const DASHBOARD_HREF = "/dashboard";
const CHALLENGES_HREF = "/challenges";
const TRAINING_HREF = "/training";
const PROFILE_HREF = "/profile";

const SIDEBAR_STORAGE_KEY = "netlabs-sidebar-collapsed";
const SIDEBAR_CHANGE_EVENT = "netlabs-sidebar-collapsed-change";

const LABS_MENU_STORAGE_KEY = "netlabs-labs-menu-open";
const LABS_MENU_CHANGE_EVENT = "netlabs-labs-menu-open-change";

const iconPaths: Record<IconName, React.ReactNode> = {
  dashboard: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </>
  ),
  warning: (
    <>
      <path d="M12 3 22 20H2L12 3Z" />
      <path d="M12 9v5" />
      <path d="M12 17h.01" />
    </>
  ),
  flask: (
    <>
      <path d="M9 3h6" />
      <path d="M10 3v5l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 17l-5-9V3" />
      <path d="M8 15h8" />
    </>
  ),
  terminal: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="m8 10 3 2-3 2" />
      <path d="M13 15h4" />
    </>
  ),
  file: (
    <>
      <path d="M6 3h8l4 4v14H6V3Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M8 6h5a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h7" />
    </>
  ),
  list: (
    <>
      <path d="M8 6h12" />
      <path d="M8 12h12" />
      <path d="M8 18h12" />
      <path d="M4 6h.01" />
      <path d="M4 12h.01" />
      <path d="M4 18h.01" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8 16v-5" />
      <path d="M12 16V8" />
      <path d="M16 16v-8" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1-2.1 2.1-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V20h-3v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1-2.1-2.1.1-.1A1.6 1.6 0 0 0 5 15a1.6 1.6 0 0 0-1.5-1H3v-3h.5A1.6 1.6 0 0 0 5 10a1.6 1.6 0 0 0-.3-1.8l-.1-.1L6.7 6l.1.1A1.6 1.6 0 0 0 8.6 6a1.6 1.6 0 0 0 1-1.5V4h3v.5a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1 2.1 2.1-.1.1A1.6 1.6 0 0 0 19 10a1.6 1.6 0 0 0 1.5 1h.5v3h-.5A1.6 1.6 0 0 0 19.4 15Z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16l4 4" />
    </>
  ),
  bell: (
    <>
      <path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16l-2-2Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  drawer: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
};

const navItems: {
  label: string;
  icon: IconName;
  href?: string;
  children?: string[];
  disabled?: boolean;
}[] = [
  { label: "Dashboard", icon: "dashboard", href: DASHBOARD_HREF },
  { label: "Tickets", icon: "warning", href: `${DASHBOARD_HREF}#ticket-queue` },
  {
    label: "Labs",
    icon: "flask",
    href: ACTIVE_LAB_HREF,
    children: ["Easy", "Medium", "Hard"],
  },
  { label: "Challenges", icon: "terminal", href: CHALLENGES_HREF },
  { label: "Evidence", icon: "file", href: `${DASHBOARD_HREF}#evidence-snapshot` },
  { label: "Training Path", icon: "route", href: TRAINING_HREF },
  { label: "Queue", icon: "list", href: `${DASHBOARD_HREF}#ticket-queue` },
  { label: "Profile", icon: "chart", href: PROFILE_HREF },
  { label: "Settings", icon: "settings", disabled: true },
];

function Icon({
  name,
  className = "",
  filled = false,
  strokeWidth = 1.8,
}: {
  name: IconName;
  className?: string;
  filled?: boolean;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
}

function isActivePath(pathname: string, href?: string) {
  if (!href) return false;
  if (href === DASHBOARD_HREF) return pathname === DASHBOARD_HREF;
  if (href === ACTIVE_LAB_HREF) return pathname.startsWith("/labs");
  if (href === CHALLENGES_HREF) return pathname.startsWith("/challenges");
  if (href === TRAINING_HREF) return pathname.startsWith("/training");
  if (href === PROFILE_HREF) return pathname.startsWith("/profile");
  return pathname === href;
}

function BrandMark({ hoverToDrawer = false }: { hoverToDrawer?: boolean }) {
  return (
    <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-emerald-400/30 bg-black/70 text-lg font-semibold text-emerald-200 shadow-[0_0_24px_rgba(16,185,129,.22)] transition group-hover:border-cyan-300/40 group-hover:text-cyan-100 group-hover:shadow-[0_0_28px_rgba(34,211,238,.2)]">
      <span
        className={`absolute inset-0 grid place-items-center transition-all duration-200 ${
          hoverToDrawer ? "group-hover:scale-75 group-hover:opacity-0" : ""
        }`}
      >
        N
      </span>

      {hoverToDrawer ? (
        <Icon
          name="drawer"
          className="absolute h-5 w-5 scale-125 text-cyan-100 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100"
        />
      ) : null}
    </span>
  );
}

function getSidebarCollapsedSnapshot() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
}

function getSidebarCollapsedServerSnapshot() {
  return false;
}

function subscribeToSidebarCollapsed(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleChange = () => onStoreChange();

  window.addEventListener("storage", handleChange);
  window.addEventListener(SIDEBAR_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(SIDEBAR_CHANGE_EVENT, handleChange);
  };
}

function getLabsMenuOpenSnapshot() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(LABS_MENU_STORAGE_KEY) === "true";
}

function getLabsMenuOpenServerSnapshot() {
  return false;
}

function subscribeToLabsMenuOpen(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleChange = () => onStoreChange();

  window.addEventListener("storage", handleChange);
  window.addEventListener(LABS_MENU_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(LABS_MENU_CHANGE_EVENT, handleChange);
  };
}

export function AppShell({ children, title, subtitle, actions }: AppShellProps) {
  const pathname = usePathname();
  const { user } = useRequireAuth();

  const sidebarCollapsed = useSyncExternalStore(
    subscribeToSidebarCollapsed,
    getSidebarCollapsedSnapshot,
    getSidebarCollapsedServerSnapshot,
  );

  const labsMenuOpen = useSyncExternalStore(
    subscribeToLabsMenuOpen,
    getLabsMenuOpenSnapshot,
    getLabsMenuOpenServerSnapshot,
  );

  function updateSidebarCollapsed(value: boolean) {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value));
    window.dispatchEvent(new Event(SIDEBAR_CHANGE_EVENT));
  }

  function updateLabsMenuOpen(value: boolean) {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(LABS_MENU_STORAGE_KEY, String(value));
    window.dispatchEvent(new Event(LABS_MENU_CHANGE_EVENT));
  }

  const sidebarWidth = sidebarCollapsed ? "xl:w-[88px]" : "xl:w-[230px]";

  return (
    <main className="min-h-screen bg-[#02060b] text-slate-200 antialiased">
      <div className="fixed inset-0 -z-0 bg-[radial-gradient(circle_at_18%_0%,rgba(16,185,129,.12),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(34,211,238,.09),transparent_24%),linear-gradient(135deg,#02060b_0%,#06111d_48%,#02050a_100%)]" />
      <div className="fixed inset-0 -z-0 opacity-[0.18] [background-image:linear-gradient(rgba(45,212,191,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,.08)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="fixed inset-x-0 top-0 -z-0 h-32 bg-gradient-to-b from-emerald-400/[0.08] to-transparent" />

      <div className="relative z-10 flex min-h-screen">
        <aside
          className={`relative hidden min-h-screen shrink-0 border-r border-white/[0.06] bg-black/35 transition-[width] duration-300 ease-out xl:block ${sidebarWidth}`}
        >
          <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-emerald-400/25 to-transparent" />

          <div className="flex h-[78px] items-center border-b border-white/[0.06] px-4">
            {sidebarCollapsed ? (
              <button
                type="button"
                onClick={() => {
                  updateSidebarCollapsed(false);
                }}
                className="group flex w-full justify-center"
                aria-label="Expand menu"
                title="Expand menu"
              >
                <BrandMark hoverToDrawer />
              </button>
            ) : (
              <div className="flex w-full items-center justify-between gap-3">
                <Link
                  href={DASHBOARD_HREF}
                  className="group flex min-w-0 items-center"
                  onClick={() => updateLabsMenuOpen(false)}
                  aria-label="Go to dashboard"
                >
                  <BrandMark />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    updateSidebarCollapsed(true);
                  }}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-slate-400 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.08] hover:text-emerald-200"
                  aria-label="Collapse menu"
                  title="Collapse menu"
                >
                  <Icon name="drawer" className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex min-h-[calc(100vh-78px)] flex-col">
            <div className="flex-1 px-3 py-5">
              <nav className="space-y-2">
                {navItems.map(({ label, icon, href, children, disabled }) => {
                  const active = isActivePath(pathname, href);
                  const isLabsItem = label === "Labs";

                  const itemClass = `group relative flex w-full items-center rounded-xl px-3 py-3 text-sm transition-all duration-300 ${
                    sidebarCollapsed ? "justify-center gap-0" : "gap-4"
                  } ${
                    active
                      ? "bg-emerald-400/10 text-slate-100 shadow-[inset_0_0_24px_rgba(16,185,129,.08)]"
                      : disabled
                        ? "cursor-not-allowed text-slate-700"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                  }`;

                  const content = (
                    <>
                      {active ? (
                        <span className="absolute -left-3 top-2 h-9 w-1 rounded-r-full bg-gradient-to-b from-cyan-300 to-emerald-400 shadow-[0_0_20px_rgba(45,212,191,.8)]" />
                      ) : null}

                      <Icon
                        name={icon}
                        className={`h-5 w-5 shrink-0 ${
                          active
                            ? "text-emerald-300"
                            : disabled
                              ? "text-slate-700"
                              : "text-slate-500 group-hover:text-emerald-300"
                        }`}
                      />

                      {!sidebarCollapsed ? (
                        <>
                          <span className="whitespace-nowrap text-left">{label}</span>
                          {isLabsItem ? (
                            <Icon
                              name="chevronDown"
                              className={`ml-auto h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300 ${
                                labsMenuOpen ? "rotate-180" : ""
                              }`}
                            />
                          ) : null}
                        </>
                      ) : null}
                    </>
                  );

                  return (
                    <div key={label}>
                      {isLabsItem ? (
                        sidebarCollapsed ? (
                          <Link
                            href={ACTIVE_LAB_HREF}
                            className={itemClass}
                            title="Labs"
                          >
                            {content}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => updateLabsMenuOpen(!labsMenuOpen)}
                            className={itemClass}
                            title="Toggle labs menu"
                          >
                            {content}
                          </button>
                        )
                      ) : href && !disabled ? (
                        <Link
                          href={href}
                          className={itemClass}
                          title={sidebarCollapsed ? label : undefined}
                          onClick={() => updateLabsMenuOpen(false)}
                        >
                          {content}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled={disabled}
                          className={itemClass}
                          title={sidebarCollapsed ? label : undefined}
                          onClick={() => {
                            if (!disabled) updateLabsMenuOpen(false);
                          }}
                        >
                          {content}
                        </button>
                      )}

                      {isLabsItem && !sidebarCollapsed ? (
                        <div
                          className={`ml-14 overflow-hidden transition-all duration-300 ease-out ${
                            labsMenuOpen ? "mt-1 max-h-28 opacity-100" : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="space-y-1 pb-1">
                            {children?.map((child) => (
                              <Link
                                key={child}
                                href={ACTIVE_LAB_HREF}
                                onClick={() => updateLabsMenuOpen(true)}
                                className="block px-0 py-1 text-xs font-medium text-slate-500 transition hover:text-emerald-200"
                              >
                                {child}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-b border-white/[0.06]">
            <div className="mx-auto flex h-[78px] max-w-[1480px] items-center justify-between gap-4 px-4 lg:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="xl:hidden">
                  <Link href={DASHBOARD_HREF} className="group flex">
                    <BrandMark />
                  </Link>
                </div>

                <div className="hidden w-[410px] items-center gap-3 rounded-xl border border-white/[0.08] bg-slate-950/70 px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] md:flex">
                  <Icon name="search" className="h-4 w-4 text-slate-500" />
                  <span className="flex-1 truncate text-sm text-slate-500">
                    Search tickets, labs, evidence...
                  </span>
                  <kbd className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[11px] text-slate-500">
                    ⌘K
                  </kbd>
                </div>
              </div>

              <div className="ml-auto flex min-w-0 items-center gap-3">
                <div className="hidden overflow-hidden rounded-xl border border-white/[0.08] bg-slate-950/65 lg:flex">
                  <div className="border-r border-white/[0.06] px-4 py-2">
                    <p className="text-[10px] text-slate-500">Environment</p>
                    <p className="flex items-center gap-2 text-xs font-medium text-emerald-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]" />
                      Lab Online
                    </p>
                  </div>
                  <div className="px-4 py-2">
                    <p className="text-[10px] text-slate-500">Current Path</p>
                    <p className="flex items-center gap-2 text-xs font-medium text-emerald-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]" />
                      Day 06
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="grid h-11 w-11 place-items-center rounded-xl border border-white/[0.06] bg-slate-950/45 text-slate-300"
                >
                  <Icon name="bell" className="h-5 w-5" />
                </button>

                <Link
                  href={PROFILE_HREF}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-slate-950/65 px-3 py-2"
                  onClick={() => updateLabsMenuOpen(false)}
                >
                  <div className="grid h-9 w-9 place-items-center rounded-lg border border-fuchsia-400/25 bg-fuchsia-400/10 text-sm">
                    TU
                  </div>
                  <div className="hidden text-left md:block">
                    <p className="text-sm font-medium text-slate-200">
                      {user?.name || "Test User"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {user?.email || "Troubleshooting Path"}
                    </p>
                  </div>
                  <Icon name="chevronDown" className="h-4 w-4 text-slate-500" />
                </Link>

                {actions}
              </div>
            </div>
          </header>

          {title || subtitle ? (
            <div className="border-b border-white/[0.04]">
              <div className="mx-auto max-w-[1480px] px-4 py-4 lg:px-5">
                {title ? (
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    {title}
                  </h1>
                ) : null}
                {subtitle ? (
                  <p className="mt-1 max-w-3xl text-sm text-slate-400">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {children}
        </div>
      </div>
    </main>
  );
}

export default AppShell;