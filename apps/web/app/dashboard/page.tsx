"use client";

import Link from "next/link";
import React, { useState } from "react";

const iconPaths = {
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
  chevronRight: <path d="m9 6 6 6-6 6" />,
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
  collapse: (
    <>
      <path d="M4 5h16v14H4z" />
      <path d="M9 5v14" />
      <path d="m16 9-3 3 3 3" />
    </>
  ),
  play: <path d="M8 5v14l11-7L8 5Z" />,
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  reset: (
    <>
      <path d="M20 12a8 8 0 1 1-2.3-5.7" />
      <path d="M20 4v6h-6" />
    </>
  ),
  check: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  circle: <circle cx="12" cy="12" r="7" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z" />
      <path d="m9 12 2 2 4-5" />
    </>
  ),
  network: (
    <>
      <circle cx="12" cy="5" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M12 7v4" />
      <path d="M12 11 6 16" />
      <path d="M12 11l6 5" />
    </>
  ),
  router: (
    <>
      <ellipse cx="12" cy="12" rx="8" ry="4" />
      <path d="M5 12h14" />
      <path d="m8 10-2 2 2 2" />
      <path d="m16 10 2 2-2 2" />
    </>
  ),
  crosshair: (
    <>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  activity: <path d="M3 12h4l2-6 4 12 2-6h6" />,
  database: (
    <>
      <ellipse cx="12" cy="5" rx="7" ry="3" />
      <path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
      <path d="M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7" />
    </>
  ),
  terminal: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="m8 10 3 2-3 2" />
      <path d="M13 15h4" />
    </>
  ),
  cable: (
    <>
      <path d="M7 7h10v6H7z" />
      <path d="M9 13v4" />
      <path d="M15 13v4" />
      <path d="M10 7V4" />
      <path d="M14 7V4" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </>
  ),
} satisfies Record<string, React.ReactNode>;

type IconName = keyof typeof iconPaths;
type Tone = "red" | "amber" | "green";

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

const ACTIVE_LAB_HREF = "/labs/dns-failure";
const DASHBOARD_HREF = "/dashboard";
const CHALLENGES_HREF = "/challenges";
const PROFILE_HREF = "/profile";

const navItems: {
  label: string;
  icon: IconName;
  active?: boolean;
  href?: string;
  targetId?: string;
  children?: string[];
  disabled?: boolean;
}[] = [
  { label: "Dashboard", icon: "dashboard", active: true, href: DASHBOARD_HREF },
  { label: "Tickets", icon: "warning", targetId: "ticket-queue" },
  {
    label: "Labs",
    icon: "flask",
    href: ACTIVE_LAB_HREF,
    children: ["Easy", "Medium", "Hard"],
  },
  { label: "Challenges", icon: "terminal", href: CHALLENGES_HREF },
  { label: "Evidence", icon: "file", targetId: "evidence-snapshot" },
  { label: "Training Path", icon: "route", targetId: "training-path" },
  { label: "Queue", icon: "list", targetId: "ticket-queue" },
  { label: "Profile", icon: "chart", href: PROFILE_HREF },
  { label: "Settings", icon: "settings", disabled: true },
];

const evidence: {
  label: string;
  value: string;
  tone: Tone;
  icon: IconName;
}[] = [
  { label: "DNS lookup from PC-02", value: "TIMEOUT", tone: "red", icon: "globe" },
  { label: "Ping 8.8.8.8", value: "PASS", tone: "green", icon: "activity" },
  { label: "Endpoint DNS server", value: "MISMATCH", tone: "amber", icon: "terminal" },
  { label: "Gateway reachability", value: "PASS", tone: "green", icon: "router" },
  { label: "Resolver comparison", value: "PENDING", tone: "amber", icon: "database" },
];

const incidents: [string, string, "Easy" | "Medium" | "Hard", string, string][] = [
  ["INC-014", "DNS Failure", "Medium", "Active", "12m"],
  ["INC-011", "No Internet Access", "Easy", "Active", "10m"],
  ["INC-017", "Switch Port Shutdown", "Medium", "New", "12m"],
  ["INC-021", "Wrong Subnet Mask", "Medium", "New", "12m"],
];

const domains: {
  label: string;
  icon: IconName;
  dot: string;
}[] = [
  { label: "DNS", icon: "globe", dot: "bg-rose-400" },
  { label: "GATEWAY", icon: "router", dot: "bg-amber-300" },
  { label: "SWITCHING", icon: "cable", dot: "bg-emerald-400" },
  { label: "ROUTING", icon: "route", dot: "bg-emerald-400" },
  { label: "ACL / NAT", icon: "shield", dot: "bg-amber-300" },
  { label: "SUBNETTING", icon: "network", dot: "bg-emerald-400" },
];

const practice: [string, string][] = [
  ["Compare affected and healthy endpoint", "Next"],
  ["Run DNS lookup from PC-02", "Then"],
  ["Verify gateway path is still clean", "After"],
];

function scrollToTarget(targetId: string) {
  const target = document.getElementById(targetId);

  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function StatusValue({
  tone,
  children,
}: {
  tone: Tone;
  children: React.ReactNode;
}) {
  const styles: Record<Tone, string> = {
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    amber: "text-amber-300 bg-amber-400/10 border-amber-400/20",
    green: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
  };

  return (
    <span
      className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-10">
        <div className="absolute inset-1 rotate-45 rounded-lg border-2 border-emerald-400/90 shadow-[0_0_25px_rgba(52,211,153,.35)]" />
        <div className="absolute left-1 top-3 h-4 w-7 -rotate-12 rounded-sm bg-emerald-400/80" />
        <div className="absolute right-1 top-2 h-2 w-2 rounded-full bg-cyan-300" />
      </div>
      <div>
        <h1 className="text-[21px] font-semibold tracking-[0.22em] text-slate-100 sm:text-[23px] sm:tracking-[0.28em]">
          NETLABS
        </h1>
        <p className="-mt-1 text-[9px] tracking-[0.16em] text-slate-500 sm:text-[10px] sm:tracking-[0.18em]">
          TROUBLESHOOTING SIMULATOR
        </p>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="relative hidden min-h-screen w-[188px] shrink-0 border-r border-white/[0.06] bg-black/35 px-4 py-5 xl:block">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-emerald-400/25 to-transparent" />
      <Logo />

      <nav className="mt-10 space-y-2">
        {navItems.map(
          ({ label, icon, active, children, href, targetId, disabled }) => {
            const sharedClassName = `group relative flex w-full items-center gap-4 rounded-xl px-3 py-3 text-sm transition-all duration-300 ${
              active
                ? "bg-emerald-400/10 text-slate-100 shadow-[inset_0_0_24px_rgba(16,185,129,.08)]"
                : disabled
                ? "cursor-not-allowed text-slate-700"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
            }`;

            const content = (
              <>
                {active && (
                  <span className="absolute -left-4 top-2 h-9 w-1 rounded-r-full bg-gradient-to-b from-cyan-300 to-emerald-400 shadow-[0_0_20px_rgba(45,212,191,.8)]" />
                )}

                <Icon
                  name={icon}
                  className={`h-5 w-5 ${
                    active
                      ? "text-emerald-300"
                      : disabled
                      ? "text-slate-700"
                      : "text-slate-500 group-hover:text-emerald-300"
                  }`}
                />

                <span>{label}</span>
              </>
            );

            return (
              <div key={label}>
                {href && !disabled ? (
                  <Link href={href} className={sharedClassName}>
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (targetId) scrollToTarget(targetId);
                    }}
                    className={sharedClassName}
                  >
                    {content}
                  </button>
                )}

                {children && (
                  <div className="ml-12 mt-1 space-y-1">
                    {children.map((child) => (
                      <Link
                        key={child}
                        href={ACTIVE_LAB_HREF}
                        className="block rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-white/[0.04] hover:text-emerald-200"
                      >
                        {child}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }
        )}
      </nav>

      <button
        type="button"
        className="absolute bottom-5 left-5 flex items-center gap-3 rounded-xl px-1 py-2 text-sm text-slate-400 hover:text-slate-200"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.05] ring-1 ring-white/[0.08]">
          <Icon name="collapse" className="h-4 w-4" />
        </span>
        Collapse
      </button>
    </aside>
  );
}

function Header() {
  return (
    <header className="flex h-auto min-h-[78px] items-center justify-between gap-4 border-b border-white/[0.06] px-4 py-4 lg:px-7 xl:h-[78px] xl:py-0">
      <div className="xl:hidden">
        <Logo />
      </div>

      <div className="hidden w-[360px] items-center gap-3 rounded-xl border border-white/[0.08] bg-slate-950/70 px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] md:flex xl:ml-20">
        <Icon name="search" className="h-4 w-4 text-slate-500" />
        <span className="flex-1 text-sm text-slate-500">
          Search tickets, labs, evidence...
        </span>
        <kbd className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[11px] text-slate-500">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-3">
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
        >
          <div className="grid h-9 w-9 place-items-center rounded-lg border border-fuchsia-400/25 bg-fuchsia-400/10 text-sm">
            TU
          </div>
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium text-slate-200">Test User</p>
            <p className="text-[11px] text-slate-500">Troubleshooting Path</p>
          </div>
          <Icon name="chevronDown" className="h-4 w-4 text-slate-500" />
        </Link>
      </div>
    </header>
  );
}

function SectionTitle({
  icon,
  title,
  right,
}: {
  icon?: IconName;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em] text-emerald-300">
        {icon && <Icon name={icon} className="h-4 w-4" />}
        {title}
      </h3>
      {right}
    </div>
  );
}

function ActionBrief() {
  const steps: [string, string, string][] = [
    [
      "1",
      "Check the gateway first",
      "If the host cannot reach its default gateway, stay at endpoint, VLAN, switchport, or router interface evidence.",
    ],
    [
      "2",
      "Compare DNS and IP reachability",
      "If IP works but names fail, DNS is likely involved. If both fail, check access path and gateway reachability.",
    ],
    [
      "3",
      "Use evidence before guessing",
      "Confirm the fault with command output before submitting a diagnosis.",
    ],
  ];

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-slate-950/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
      <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(rgba(45,212,191,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,.12)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative">
        <SectionTitle icon="crosshair" title="Next Action Brief" />

        <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.055] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-300">
            Recommended first move
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-100">
            Prove whether this is a gateway problem or a DNS problem.
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
            Start simple. Test the gateway, test a known IP, then test a DNS
            name. Each result narrows the fault without guessing.
          </p>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {steps.map(([num, title, body]) => (
            <div
              key={title}
              className="rounded-xl border border-white/[0.08] bg-black/20 p-4"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full border border-emerald-300/50 bg-emerald-300/10 text-sm font-bold text-emerald-200">
                {num}
              </span>
              <h4 className="mt-4 text-sm font-semibold text-slate-100">
                {title}
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                {body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-cyan-200">
            No topology here
          </span>
          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-emerald-200">
            Dashboard = command center
          </span>
          <span className="rounded-full border border-slate-500/20 bg-slate-500/10 px-3 py-1 text-slate-300">
            Topology opens in lab page
          </span>
        </div>
      </div>
    </div>
  );
}

function EvidencePanel() {
  return (
    <div
      id="evidence-snapshot"
      className="scroll-mt-6 rounded-xl border border-white/[0.08] bg-slate-950/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]"
    >
      <SectionTitle
        title="Evidence Snapshot"
        right={
          <button
            type="button"
            className="flex items-center gap-1 text-[11px] font-medium text-emerald-300"
          >
            View All <Icon name="chevronRight" className="h-3 w-3" />
          </button>
        }
      />

      <div className="overflow-hidden rounded-lg border border-white/[0.06]">
        {evidence.map(({ label, value, tone, icon }) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-white/[0.025] px-3 py-2.5 last:border-b-0 hover:bg-emerald-300/[0.04]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
                <Icon name={icon} className="h-3.5 w-3.5" />
              </span>
              <span className="truncate text-sm text-slate-300">{label}</span>
            </div>
            <StatusValue tone={tone}>{value}</StatusValue>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActiveIncident({
  onContinueLab,
  onOpenTicket,
  onReviewClosed,
  onResetSession,
}: {
  onContinueLab: () => void;
  onOpenTicket: () => void;
  onReviewClosed: () => void;
  onResetSession: () => void;
}) {
  return (
    <section
      id="active-lab"
      className="relative scroll-mt-6 overflow-hidden rounded-2xl border border-white/[0.09] bg-slate-950/45 p-4 shadow-[0_16px_50px_rgba(0,0,0,.35),inset_0_1px_0_rgba(255,255,255,.04)] sm:p-5"
    >
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_30%_0%,rgba(45,212,191,.12),transparent_30%),radial-gradient(circle_at_95%_20%,rgba(52,211,153,.08),transparent_26%)]" />
      <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-300/30 to-transparent" />

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-emerald-300">
              <Icon name="activity" className="h-4 w-4" /> Active Lab
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-100 lg:text-[28px]">
                Ticket 014 – DNS Failure: Websites Not Resolving
              </h2>
              <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,.8)]" />
              <span className="rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-bold tracking-wide text-cyan-200">
                MEDIUM · ACTIVE
              </span>
            </div>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
              A workstation can reach external IP addresses, but website names
              fail to resolve. Continue from the last checkpoint and prove
              whether DNS is the real fault.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-black/25 px-4 py-3 text-right">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">
              Session Time
            </p>
            <p className="font-mono text-2xl text-slate-100">00:18:42</p>
          </div>
        </div>

        <div className="mt-5 grid rounded-xl border border-white/[0.08] bg-slate-950/45 p-3 md:grid-cols-4">
          {[
            ["1", "Observe", "Read the symptom"],
            ["2", "Gather Evidence", "Compare outputs"],
            ["3", "Isolate Cause", "Confirm fault domain"],
            ["4", "Validate Fix", "Prove the repair"],
          ].map(([num, label, sub], index) => (
            <div key={label} className="relative flex items-center gap-3 px-2 py-2">
              {index < 3 && (
                <span className="absolute right-2 top-1/2 hidden h-px w-12 bg-gradient-to-r from-slate-700 to-emerald-400/30 lg:block" />
              )}
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-sm font-bold ${
                  index === 0
                    ? "border-emerald-300 bg-emerald-400 text-slate-950 shadow-[0_0_24px_rgba(52,211,153,.6)]"
                    : "border-slate-600 bg-slate-950 text-slate-400"
                }`}
              >
                {num}
              </span>
              <span>
                <p className="text-sm font-medium text-slate-200">{label}</p>
                <p className="text-xs text-slate-500">{sub}</p>
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
          <ActionBrief />
          <EvidencePanel />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Link
            href={ACTIVE_LAB_HREF}
            onClick={onContinueLab}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_28px_rgba(52,211,153,.22)] transition hover:scale-[1.01]"
          >
            <Icon name="play" className="h-4 w-4 fill-slate-950" /> Continue Lab
          </Link>

          <button
            type="button"
            onClick={onOpenTicket}
            className="flex items-center justify-center gap-2 rounded-lg border border-emerald-400/70 bg-emerald-400/[0.03] px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/10"
          >
            <Icon name="plus" className="h-4 w-4" /> Open Ticket
          </button>

          <button
            type="button"
            onClick={onReviewClosed}
            className="flex items-center justify-center gap-2 rounded-lg border border-white/[0.09] bg-slate-800/60 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700/70"
          >
            <Icon name="check" className="h-4 w-4" /> Review Closed
          </button>

          <button
            type="button"
            onClick={onResetSession}
            className="flex items-center justify-center gap-2 rounded-lg border border-red-500/35 bg-red-500/[0.035] px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
          >
            <Icon name="reset" className="h-4 w-4" /> Reset Session
          </button>
        </div>
      </div>
    </section>
  );
}

function IncidentQueue() {
  return (
    <section
      id="ticket-queue"
      className="scroll-mt-6 rounded-xl border border-white/[0.08] bg-slate-950/45 p-4"
    >
      <SectionTitle
        title="Fault Ticket Queue"
        right={
          <button type="button" className="text-[11px] font-medium text-emerald-300">
            View All
          </button>
        }
      />

      <div className="overflow-x-auto rounded-lg">
        <table className="w-full min-w-[560px] text-left text-xs">
          <thead className="text-[10px] uppercase text-slate-500">
            <tr>
              <th className="pb-3 font-medium">ID</th>
              <th className="pb-3 font-medium">Title</th>
              <th className="pb-3 font-medium">Difficulty</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 text-right font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map(([id, title, difficulty, status, eta], index) => (
              <tr
                key={id}
                className={`border-t border-white/[0.06] ${
                  index === 0 ? "bg-emerald-400/[0.055]" : ""
                }`}
              >
                <td className="py-2.5 font-mono text-slate-300">{id}</td>
                <td className="py-2.5 text-slate-300">{title}</td>
                <td className="py-2.5">
                  <span
                    className={`rounded-md px-2 py-1 font-bold ${
                      difficulty === "Easy"
                        ? "bg-emerald-400/15 text-emerald-300"
                        : difficulty === "Medium"
                        ? "bg-cyan-400/15 text-cyan-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {difficulty}
                  </span>
                </td>
                <td className="py-2.5 text-slate-400">{status}</td>
                <td className="py-2.5 text-right text-slate-500">{eta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FaultDomains() {
  return (
    <section className="rounded-xl border border-white/[0.08] bg-slate-950/45 p-4">
      <SectionTitle title="Fault Domains" />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-3">
        {domains.map(({ label, icon, dot }) => (
          <button
            key={label}
            type="button"
            className="relative min-h-[70px] rounded-lg border border-white/[0.09] bg-white/[0.025] p-3 text-center transition hover:border-emerald-300/40 hover:bg-emerald-300/[0.04]"
          >
            <span
              className={`absolute right-3 top-3 h-2.5 w-2.5 rounded-full ${dot} shadow-[0_0_12px_currentColor]`}
            />
            <Icon name={icon} className="mx-auto h-6 w-6 text-emerald-300" />
            <p className="mt-2 text-[11px] font-medium text-slate-300">
              {label}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

function OSIFocus() {
  const layers = [
    "Application",
    "Presentation",
    "Session",
    "Transport",
    "Network",
    "Data Link",
    "Physical",
  ];

  return (
    <section className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-slate-950/45 p-4">
      <div className="absolute -bottom-10 right-0 h-40 w-52 opacity-40">
        <svg viewBox="0 0 260 160" className="h-full w-full" fill="none">
          {Array.from({ length: 10 }).map((_, index) => (
            <path
              key={index}
              d={`M0 ${125 - index * 8} C 70 ${
                100 - index * 5
              }, 100 ${150 - index * 10}, 160 ${
                90 - index * 7
              } S 220 ${80 - index * 6}, 260 ${60 - index * 5}`}
              stroke="rgba(45,212,191,.35)"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>

      <SectionTitle title="OSI Layer Focus" />

      <p className="text-[11px] text-slate-500">Current Focus</p>
      <h3 className="mb-3 text-xl font-semibold text-slate-100">
        Layer 2 → DNS
      </h3>

      <div className="relative space-y-0.5">
        {layers.map((layer, index) => {
          const number = 7 - index;
          const active = layer === "Application" || layer === "Data Link";

          return (
            <div
              key={layer}
              className={`grid grid-cols-[28px_1fr] items-center rounded-md px-2 py-1.5 text-xs ${
                active
                  ? "bg-gradient-to-r from-emerald-400/20 to-transparent text-emerald-200 ring-1 ring-emerald-400/25"
                  : "text-slate-400"
              }`}
            >
              <span className="font-mono text-slate-500">{number}</span>
              <span className={active ? "font-semibold" : ""}>{layer}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TodayFocus() {
  return (
    <section className="rounded-xl border border-white/[0.08] bg-slate-950/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
      <SectionTitle icon="crosshair" title="Immediate Action" />
      <h3 className="text-lg font-semibold text-slate-100">
        Confirm DNS without skipping lower layers
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        Start with the smallest proof: can the affected PC reach its gateway,
        reach a known IP, and resolve a DNS name?
      </p>

      <p className="mt-7 text-[11px] uppercase tracking-widest text-slate-500">
        Response Sequence
      </p>

      <div className="mt-3 space-y-3">
        {practice.map(([label, time]) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-3 text-slate-300">
              <Icon name="check" className="h-4 w-4 text-emerald-300" />
              {label}
            </span>
            <span className="text-slate-500">{time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TrainingPlan() {
  return (
    <section
      id="training-path"
      className="scroll-mt-6 rounded-xl border border-white/[0.08] bg-slate-950/55 p-5"
    >
      <SectionTitle
        icon="layers"
        title="Training Path"
        right={<Icon name="activity" className="h-4 w-4 text-slate-500" />}
      />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-300">Troubleshooting Foundations</p>
        <p className="text-sm text-slate-500">Day 06</p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_18px_rgba(45,212,191,.3)]" />
      </div>

      <div className="mt-5 space-y-2">
        {["Observe symptoms", "Verify lower layers"].map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-lg py-1.5 text-sm text-slate-300"
          >
            <Icon name="check" className="h-4 w-4 text-emerald-300" />
            {item}
          </div>
        ))}

        <div className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
          <span className="flex items-center gap-3">
            <Icon name="circle" className="h-4 w-4 text-emerald-300" />
            DNS isolation drill
          </span>
          <Icon name="chevronRight" className="h-4 w-4 text-slate-500" />
        </div>

        {["Validate repair", "Explain evidence chain"].map((item) => (
          <div
            key={item}
            className="flex items-center justify-between rounded-lg py-1.5 text-sm text-slate-500"
          >
            <span className="flex items-center gap-3">
              <Icon name="circle" className="h-4 w-4" />
              {item}
            </span>
            <Icon name="lock" className="h-4 w-4" />
          </div>
        ))}
      </div>
    </section>
  );
}

function DashboardSnapshot() {
  return (
    <section
      id="dashboard-snapshot"
      className="scroll-mt-6 rounded-xl border border-white/[0.08] bg-slate-950/55 p-5"
    >
      <SectionTitle title="Dashboard Snapshot" />

      <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-white/[0.07] overflow-hidden rounded-lg border border-white/[0.06]">
        <div className="p-3">
          <p className="text-xs text-slate-500">Open Tickets</p>
          <p className="mt-2 text-2xl text-slate-100">02</p>
        </div>
        <div className="p-3">
          <p className="text-xs text-slate-500">Today’s Goal</p>
          <p className="mt-2 text-2xl text-slate-100">1</p>
        </div>
        <div className="p-3">
          <p className="text-xs text-slate-500">Next Focus</p>
          <p className="mt-2 text-lg text-slate-100">Layer 2 → DNS</p>
        </div>
        <div className="p-3">
          <p className="text-xs text-slate-500">Mode</p>
          <p className="mt-2 text-lg text-slate-100">Learning</p>
        </div>
      </div>

      <svg className="mt-4 h-16 w-full" viewBox="0 0 300 70" fill="none">
        <path
          d="M2 55 C18 55, 22 50, 36 52 C50 54, 48 33, 65 36 C78 39, 78 20, 95 28 C112 36, 118 32, 130 28 C146 22, 152 36, 168 40 C182 44, 192 30, 204 32 C218 34, 220 16, 232 22 C246 30, 250 44, 265 28 C278 14, 284 34, 298 30"
          stroke="#34d399"
          strokeWidth="2"
        />
      </svg>
    </section>
  );
}

function RightRail() {
  return (
    <aside className="space-y-4">
      <TodayFocus />
      <TrainingPlan />
      <DashboardSnapshot />
    </aside>
  );
}

export default function NetworkTroubleshootingDashboard() {
  const [notice, setNotice] = useState(
    "System ready. Select an action to continue lab response."
  );

  function focusArea(id: string, message: string) {
    setNotice(message);

    const target = document.getElementById(id);

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const actions = {
    continueLab: () =>
      focusArea("active-lab", "Opening lab. Continue from the active checkpoint."),
    openTicket: () =>
      focusArea(
        "ticket-queue",
        "Fault ticket queue opened. Showing a compact dashboard preview."
      ),
    reviewClosed: () =>
      focusArea(
        "dashboard-snapshot",
        "Dashboard snapshot opened. Full history belongs on the profile page."
      ),
    resetSession: () =>
      focusArea(
        "active-lab",
        "Session reset requested. Dashboard returned to the active lab."
      ),
  };

  return (
    <main className="min-h-screen bg-[#02060b] text-slate-200 antialiased">
      <div className="fixed inset-0 -z-0 bg-[radial-gradient(circle_at_18%_0%,rgba(16,185,129,.12),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(34,211,238,.09),transparent_24%),linear-gradient(135deg,#02060b_0%,#06111d_48%,#02050a_100%)]" />
      <div className="fixed inset-0 -z-0 opacity-[0.18] [background-image:linear-gradient(rgba(45,212,191,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,.08)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="fixed inset-x-0 top-0 -z-0 h-32 bg-gradient-to-b from-emerald-400/[0.08] to-transparent" />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <Header />

          <div className="grid gap-4 p-4 lg:p-5 2xl:grid-cols-[minmax(0,1fr)_344px]">
            <div className="min-w-0 space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.055] px-4 py-3 text-sm text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
                <span className="flex min-w-0 items-center gap-2">
                  <Icon
                    name="activity"
                    className="h-4 w-4 shrink-0 text-emerald-300"
                  />
                  <span className="truncate">{notice}</span>
                </span>

                <div className="hidden shrink-0 items-center gap-3 md:flex">
                  <Link
                    href={CHALLENGES_HREF}
                    className="rounded-full border border-emerald-300/25 bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-200 hover:bg-emerald-300/10"
                  >
                    Challenges
                  </Link>

                  <span className="text-[11px] uppercase tracking-widest text-emerald-300/80">
                    Command Status
                  </span>
                </div>
              </div>

              <ActiveIncident
                onContinueLab={actions.continueLab}
                onOpenTicket={actions.openTicket}
                onReviewClosed={actions.reviewClosed}
                onResetSession={actions.resetSession}
              />

              <div className="grid gap-4 xl:grid-cols-[1.35fr_.85fr_.72fr]">
                <IncidentQueue />
                <FaultDomains />
                <OSIFocus />
              </div>
            </div>

            <RightRail />
          </div>
        </div>
      </div>
    </main>
  );
}