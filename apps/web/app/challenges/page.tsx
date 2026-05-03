"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";

const DASHBOARD_HREF = "/dashboard";
const CHALLENGES_HREF = "/challenges";
const ACTIVE_LAB_HREF = "/labs/dns-failure";
const PROFILE_HREF = "/profile";

type IconName =
  | "search"
  | "bell"
  | "chevronDown"
  | "dashboard"
  | "warning"
  | "flask"
  | "file"
  | "route"
  | "list"
  | "chart"
  | "settings"
  | "collapse"
  | "play"
  | "check"
  | "circle"
  | "globe"
  | "terminal"
  | "layers"
  | "zap"
  | "activity"
  | "crosshair";

type ChallengeType = {
  id: string;
  slug: string;
  title: string;
  icon: IconName;
  count: number;
  bestFor: string;
  desc: string;
};

type Drill = {
  id: string;
  type: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  time: string;
  skill: string;
  prompt: string;
};

const iconPaths: Record<IconName, React.ReactNode> = {
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
  terminal: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="m8 10 3 2-3 2" />
      <path d="M13 15h4" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </>
  ),
  zap: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  activity: <path d="M3 12h4l2-6 4 12 2-6h6" />,
  crosshair: (
    <>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
    </>
  ),
};

const navItems = [
  { label: "Dashboard", icon: "dashboard" as IconName, href: DASHBOARD_HREF },
  { label: "Tickets", icon: "warning" as IconName, href: `${DASHBOARD_HREF}#ticket-queue` },
  { label: "Challenges", icon: "flask" as IconName, href: CHALLENGES_HREF, active: true },
  { label: "Evidence", icon: "file" as IconName, href: `${DASHBOARD_HREF}#evidence-snapshot` },
  { label: "Training Path", icon: "route" as IconName, href: `${DASHBOARD_HREF}#training-path` },
  { label: "Queue", icon: "list" as IconName, href: `${DASHBOARD_HREF}#ticket-queue` },
  { label: "Profile", icon: "chart" as IconName, href: PROFILE_HREF },
];

const challengeTypes: ChallengeType[] = [
  {
    id: "command",
    slug: "command-combat",
    title: "Command Combat",
    icon: "terminal",
    count: 24,
    bestFor: "CLI evidence",
    desc: "Know which command proves gateway, DNS, switchport, route, or ACL state.",
  },
  {
    id: "osi",
    slug: "osi-ladder",
    title: "OSI Ladder",
    icon: "layers",
    count: 18,
    bestFor: "Layer discipline",
    desc: "Use symptoms to decide whether to stay at Layer 1/2 or move upward.",
  },
  {
    id: "ports",
    slug: "port-recall",
    title: "Port Recall",
    icon: "globe",
    count: 22,
    bestFor: "Services",
    desc: "Learn ports through realistic service failures like DNS, SMTP, FTP, DHCP, and HTTPS.",
  },
  {
    id: "output",
    slug: "output-decoder",
    title: "Output Decoder",
    icon: "file",
    count: 16,
    bestFor: "Reading proof",
    desc: "Read CLI output and explain what it proves before selecting a fix.",
  },
  {
    id: "domain",
    slug: "fault-domain-finder",
    title: "Fault Domain Finder",
    icon: "crosshair",
    count: 20,
    bestFor: "Isolation",
    desc: "Classify failures into DNS, gateway, switching, routing, ACL/NAT, DHCP, or subnetting.",
  },
  {
    id: "validation",
    slug: "repair-proof",
    title: "Repair Proof",
    icon: "check",
    count: 14,
    bestFor: "Validation",
    desc: "Choose the follow-up test that proves a repair really worked.",
  },
];

const drills: Drill[] = [
  {
    id: "OSI-014",
    type: "osi",
    title: "Gateway works, names fail",
    difficulty: "Easy",
    time: "4 min",
    skill: "DNS vs gateway reasoning",
    prompt: "IP connectivity works, but domain names fail. Decide what to prove next.",
  },
  {
    id: "CMD-021",
    type: "command",
    title: "Which command proves DNS failure?",
    difficulty: "Easy",
    time: "3 min",
    skill: "Command selection",
    prompt: "Ping to 8.8.8.8 works. Choose the command that proves DNS resolution is failing.",
  },
  {
    id: "OUT-017",
    type: "output",
    title: "Decode APIPA address",
    difficulty: "Easy",
    time: "3 min",
    skill: "Output interpretation",
    prompt: "A PC shows 169.254.x.x. Identify what the evidence suggests.",
  },
  {
    id: "PRT-008",
    type: "ports",
    title: "Service Port Lockpick",
    difficulty: "Medium",
    time: "5 min",
    skill: "Service ports",
    prompt: "HTTPS fails while ICMP works. Identify the service and port to investigate.",
  },
  {
    id: "VAL-011",
    type: "validation",
    title: "Prove the repair",
    difficulty: "Medium",
    time: "5 min",
    skill: "Repair validation",
    prompt: "After enabling a switchport, choose the command and test that validates the fix.",
  },
  {
    id: "FDF-032",
    type: "domain",
    title: "DNS, gateway, or ACL?",
    difficulty: "Hard",
    time: "7 min",
    skill: "Fault isolation",
    prompt: "Only one application fails while routing is healthy. Decide the likely fault domain.",
  },
];

const portBank = [
  ["DNS", "53", "Resolve names"],
  ["HTTP", "80", "Web traffic"],
  ["HTTPS", "443", "Secure web"],
  ["SSH", "22", "Secure remote CLI"],
  ["FTP", "20/21", "File transfer"],
  ["SMTP", "25", "Send mail"],
  ["DHCP", "67/68", "IP leasing"],
  ["RDP", "3389", "Remote desktop"],
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
      {iconPaths[name] || iconPaths.circle}
    </svg>
  );
}

function difficultyTone(difficulty: Drill["difficulty"]) {
  if (difficulty === "Easy") return "green";
  if (difficulty === "Medium") return "cyan";
  return "red";
}

function StatusPill({
  tone = "slate",
  children,
}: {
  tone?: "red" | "amber" | "green" | "cyan" | "slate";
  children: React.ReactNode;
}) {
  const styles = {
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    amber: "text-amber-300 bg-amber-400/10 border-amber-400/20",
    green: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
    cyan: "text-cyan-300 bg-cyan-400/10 border-cyan-400/20",
    slate: "text-slate-300 bg-white/[0.05] border-white/[0.08]",
  };

  return (
    <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${styles[tone]}`}>
      {children}
    </span>
  );
}

function Logo() {
  return (
    <Link href={DASHBOARD_HREF} className="flex items-center gap-3">
      <div className="relative h-10 w-10">
        <div className="absolute inset-1 rotate-45 rounded-lg border-2 border-emerald-400/90 shadow-[0_0_25px_rgba(52,211,153,.35)]" />
        <div className="absolute left-1 top-3 h-4 w-7 -rotate-12 rounded-sm bg-emerald-400/80" />
        <div className="absolute right-1 top-2 h-2 w-2 rounded-full bg-cyan-300" />
      </div>
      <div>
        <h1 className="text-[23px] font-semibold tracking-[0.28em] text-slate-100">NETLABS</h1>
        <p className="-mt-1 text-[10px] tracking-[0.18em] text-slate-500">
          TROUBLESHOOTING SIMULATOR
        </p>
      </div>
    </Link>
  );
}

function Sidebar() {
  return (
    <aside className="relative hidden min-h-screen w-[188px] shrink-0 border-r border-white/[0.06] bg-black/35 px-4 py-5 xl:block">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-emerald-400/25 to-transparent" />
      <Logo />

      <nav className="mt-10 space-y-2">
        {navItems.map(({ label, icon, active, href }) => (
          <Link
            key={label}
            href={href}
            className={`group relative flex w-full items-center gap-4 rounded-xl px-3 py-3 text-sm transition-all duration-300 ${
              active
                ? "bg-emerald-400/10 text-slate-100 shadow-[inset_0_0_24px_rgba(16,185,129,.08)]"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
            }`}
          >
            {active ? (
              <span className="absolute -left-4 top-2 h-9 w-1 rounded-r-full bg-gradient-to-b from-cyan-300 to-emerald-400 shadow-[0_0_20px_rgba(45,212,191,.8)]" />
            ) : null}
            <Icon
              name={icon}
              className={`h-5 w-5 ${
                active ? "text-emerald-300" : "text-slate-500 group-hover:text-emerald-300"
              }`}
            />
            <span>{label}</span>
          </Link>
        ))}

        <button className="group relative flex w-full cursor-not-allowed items-center gap-4 rounded-xl px-3 py-3 text-sm text-slate-600">
          <Icon name="settings" className="h-5 w-5" />
          <span>Settings</span>
        </button>
      </nav>

      <Link
        href={ACTIVE_LAB_HREF}
        className="absolute bottom-5 left-5 right-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-3 text-sm font-semibold text-emerald-200"
      >
        Continue Lab
      </Link>
    </aside>
  );
}

function Header() {
  return (
    <header className="flex h-[78px] items-center justify-between gap-4 border-b border-white/[0.06] px-5 lg:px-7">
      <div className="xl:hidden">
        <Logo />
      </div>

      <div className="hidden w-[390px] items-center gap-3 rounded-xl border border-white/[0.08] bg-slate-950/70 px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] md:flex xl:ml-20">
        <Icon name="search" className="h-4 w-4 text-slate-500" />
        <span className="flex-1 text-sm text-slate-500">Search challenges, commands, ports...</span>
        <kbd className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[11px] text-slate-500">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden overflow-hidden rounded-xl border border-white/[0.08] bg-slate-950/65 lg:flex">
          <div className="border-r border-white/[0.06] px-4 py-2">
            <p className="text-[10px] text-slate-500">Challenge Mode</p>
            <p className="flex items-center gap-2 text-xs font-medium text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]" />
              Available
            </p>
          </div>
          <div className="px-4 py-2">
            <p className="text-[10px] text-slate-500">Daily Drill</p>
            <p className="flex items-center gap-2 text-xs font-medium text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]" />
              Ready
            </p>
          </div>
        </div>

        <button className="grid h-11 w-11 place-items-center rounded-xl border border-white/[0.06] bg-slate-950/45 text-slate-300">
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
    <div className="mb-4 flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em] text-emerald-300">
        {icon ? <Icon name={icon} className="h-4 w-4" /> : null}
        {title}
      </h3>
      {right}
    </div>
  );
}

function StartHere({ setSelectedType }: { setSelectedType: (type: string) => void }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-slate-950/45 p-6 shadow-[0_16px_50px_rgba(0,0,0,.35),inset_0_1px_0_rgba(255,255,255,.04)]">
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_18%_0%,rgba(45,212,191,.16),transparent_32%),radial-gradient(circle_at_90%_18%,rgba(52,211,153,.1),transparent_28%)]" />
      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(45,212,191,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,.16)_1px,transparent_1px)] [background-size:38px_38px]" />

      <div className="relative grid gap-6 xl:grid-cols-[1fr_390px]">
        <div>
          <p className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-emerald-300">
            <Icon name="zap" className="h-4 w-4" />
            Start Here
          </p>

          <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-100 lg:text-[50px]">
            Run one short drill. Learn what to prove first.
          </h2>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300">
            A challenge is a small troubleshooting exercise. Pick the recommended drill below,
            or choose a skill type and the list will narrow for you.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/challenges/osi-ladder"
              className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_28px_rgba(52,211,153,.22)]"
            >
              <Icon name="play" className="h-4 w-4 fill-slate-950" />
              Start Recommended
            </Link>

            <button
              onClick={() => setSelectedType("all")}
              className="rounded-lg border border-emerald-400/60 bg-emerald-400/[0.04] px-5 py-3 text-sm font-semibold text-emerald-300"
            >
              Browse All Challenges
            </button>
          </div>
        </div>

        <Link
          href="/challenges/osi-ladder"
          className="rounded-xl border border-emerald-300/18 bg-emerald-300/[0.055] p-5 transition hover:border-emerald-300/40 hover:bg-emerald-300/[0.08]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                Recommended First
              </p>
              <h3 className="mt-3 text-xl font-semibold text-slate-100">
                Gateway works, names fail
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Learn how to separate a DNS problem from a gateway problem without guessing.
              </p>
            </div>

            <span className="grid h-11 w-11 place-items-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
              <Icon name="layers" className="h-5 w-5" />
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <StatusPill tone="green">Easy</StatusPill>
            <StatusPill tone="slate">4 min</StatusPill>
            <StatusPill tone="cyan">OSI + DNS</StatusPill>
          </div>

          <div className="mt-5 rounded-lg border border-white/[0.07] bg-black/20 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              You will practice
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Check lower layers first, then prove DNS resolution.
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}

function ChallengeTypeSelector({
  selectedType,
}: {
  selectedType: string;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-slate-950/45 p-4">
      <SectionTitle
        icon="flask"
        title="Choose Challenge Type"
        right={<span className="text-[11px] text-slate-500">Step 2</span>}
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {challengeTypes.map((type) => {
          const active = selectedType === type.id;

          return (
            <Link
              key={type.id}
              href={`/challenges/${type.slug}`}
              className={`group relative overflow-hidden rounded-xl border p-4 text-left transition ${
                active
                  ? "border-emerald-300/50 bg-emerald-300/[0.08] shadow-[0_0_24px_rgba(52,211,153,.08)]"
                  : "border-white/[0.09] bg-white/[0.025] hover:border-emerald-300/35 hover:bg-emerald-300/[0.035]"
              }`}
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-400/10 blur-3xl" />

              <div className="relative flex items-start justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
                  <Icon name={type.icon} className="h-5 w-5" />
                </span>
                <StatusPill tone="cyan">{type.count} drills</StatusPill>
              </div>

              <h3 className="relative mt-5 text-base font-semibold text-slate-100">
                {type.title}
              </h3>

              <p className="relative mt-2 min-h-[44px] text-xs leading-relaxed text-slate-500">
                {type.desc}
              </p>

              <p className="relative mt-3 text-[11px] font-medium text-emerald-300">
                Best for: {type.bestFor}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function DrillList({
  selectedType,
  difficulty,
  setDifficulty,
}: {
  selectedType: string;
  difficulty: "All" | Drill["difficulty"];
  setDifficulty: (difficulty: "All" | Drill["difficulty"]) => void;
}) {
  const visible = useMemo(
    () =>
      drills.filter(
        (drill) =>
          (selectedType === "all" || drill.type === selectedType) &&
          (difficulty === "All" || drill.difficulty === difficulty),
      ),
    [selectedType, difficulty],
  );

  const selectedLabel =
    selectedType === "all"
      ? "All Challenges"
      : challengeTypes.find((type) => type.id === selectedType)?.title ?? "Challenges";

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-slate-950/45 p-4">
      <SectionTitle
        title={`Available Drills · ${selectedLabel}`}
        right={<span className="text-[11px] text-slate-500">Step 3</span>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(["All", "Easy", "Medium", "Hard"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setDifficulty(tab)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              difficulty === tab
                ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-200"
                : "border-white/[0.08] bg-white/[0.035] text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {visible.map((drill, index) => {
          const category = challengeTypes.find((type) => type.id === drill.type);
          const href = category ? `/challenges/${category.slug}` : CHALLENGES_HREF;

          return (
            <article
              key={drill.id}
              className={`grid items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 transition hover:border-emerald-300/30 hover:bg-emerald-300/[0.035] lg:grid-cols-[72px_1fr_210px_120px] ${
                index === 0 ? "ring-1 ring-emerald-300/20" : ""
              }`}
            >
              <span className="font-mono text-xs text-slate-500">{drill.id}</span>

              <div>
                <h4 className="text-base font-semibold text-slate-100">{drill.title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{drill.prompt}</p>
              </div>

              <div className="flex flex-wrap gap-2 lg:block lg:space-y-2">
                <StatusPill tone={difficultyTone(drill.difficulty)}>
                  {drill.difficulty}
                </StatusPill>
                <StatusPill>{drill.time}</StatusPill>
                <StatusPill tone="cyan">{drill.skill}</StatusPill>
              </div>

              <Link
                href={href}
                className={`${
                  index === 0
                    ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950"
                    : "border border-emerald-400/60 bg-emerald-400/[0.04] text-emerald-300"
                } flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition`}
              >
                <Icon name="play" className="h-4 w-4" />
                Start
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ReferenceAndProgress() {
  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="rounded-2xl border border-white/[0.08] bg-slate-950/45 p-4">
        <SectionTitle
          icon="globe"
          title="Quick Reference"
          right={<button className="text-[11px] font-medium text-emerald-300">Open full reference</button>}
        />

        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {portBank.map(([service, port, note]) => (
            <div
              key={service}
              className="grid grid-cols-[58px_58px_1fr] items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-xs"
            >
              <span className="font-semibold text-slate-200">{service}</span>
              <span className="font-mono text-emerald-300">{port}</span>
              <span className="truncate text-slate-500">{note}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-slate-950/45 p-4">
        <SectionTitle icon="chart" title="Progress" />

        <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-white/[0.07] overflow-hidden rounded-lg border border-white/[0.06]">
          {[
            ["Completed", "18"],
            ["Active", "03"],
            ["Best", "Evidence"],
            ["Focus", "Ports"],
          ].map(([label, value]) => (
            <div key={label} className="p-3">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-2 text-lg text-slate-100">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function NetworkTroubleshootingChallenges() {
  const [selectedType, setSelectedType] = useState("osi");
  const [difficulty, setDifficulty] = useState<"All" | Drill["difficulty"]>("All");

  return (
    <main className="min-h-screen bg-[#02060b] text-slate-200 antialiased">
      <div className="fixed inset-0 -z-0 bg-[radial-gradient(circle_at_18%_0%,rgba(16,185,129,.12),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(34,211,238,.09),transparent_24%),linear-gradient(135deg,#02060b_0%,#06111d_48%,#02050a_100%)]" />
      <div className="fixed inset-0 -z-0 opacity-[0.18] [background-image:linear-gradient(rgba(45,212,191,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,.08)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="fixed inset-x-0 top-0 -z-0 h-32 bg-gradient-to-b from-emerald-400/[0.08] to-transparent" />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <Header />

          <div className="mx-auto max-w-[1480px] space-y-4 p-4 lg:p-5">
            <div className="flex items-center justify-between rounded-xl border border-emerald-400/15 bg-emerald-400/[0.055] px-4 py-3 text-sm text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
              <span className="flex items-center gap-2">
                <Icon name="activity" className="h-4 w-4 text-emerald-300" />
                Start with the recommended drill, or choose a challenge type to open its dedicated page.
              </span>
              <span className="hidden text-[11px] uppercase tracking-widest text-emerald-300/80 md:inline">
                Challenge Status
              </span>
            </div>

            <StartHere setSelectedType={setSelectedType} />
            <ChallengeTypeSelector selectedType={selectedType} />
            <DrillList
              selectedType={selectedType}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
            />
            <ReferenceAndProgress />
          </div>
        </div>
      </div>
    </main>
  );
}