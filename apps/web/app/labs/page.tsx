"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";

type Difficulty = "All" | "Easy" | "Medium" | "Hard";
type LabStatus = "Ready" | "Coming Soon";

type IconName =
  | "activity"
  | "check"
  | "chevronRight"
  | "clock"
  | "database"
  | "globe"
  | "layers"
  | "network"
  | "play"
  | "route"
  | "shield"
  | "terminal"
  | "warning"
  | "zap";

type LabCard = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  difficulty: Exclude<Difficulty, "All">;
  status: LabStatus;
  duration: string;
  domain: string;
  icon: IconName;
  accent: string;
  href: string;
  symptoms: string[];
  skills: string[];
};

const iconPaths: Record<IconName, React.ReactNode> = {
  activity: <path d="M3 12h4l2-6 4 12 2-6h6" />,
  check: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  chevronRight: <path d="m9 6 6 6-6 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5" rx="7" ry="3" />
      <path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
      <path d="M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
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
  play: <path d="M8 5v14l11-7L8 5Z" />,
  route: (
    <>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M8 6h5a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h7" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z" />
      <path d="m9 12 2 2 4-5" />
    </>
  ),
  terminal: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="m8 10 3 2-3 2" />
      <path d="M13 15h4" />
    </>
  ),
  warning: (
    <>
      <path d="M12 3 22 20H2L12 3Z" />
      <path d="M12 9v5" />
      <path d="M12 17h.01" />
    </>
  ),
  zap: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
};

const labs: LabCard[] = [
  {
    id: "LAB-014",
    slug: "dns-failure",
    title: "DNS Failure",
    eyebrow: "Websites Not Resolving",
    description:
      "A workstation can reach external IP addresses, but domain names fail. Prove whether DNS is the fault and repair the endpoint configuration.",
    difficulty: "Medium",
    status: "Ready",
    duration: "12 min",
    domain: "DNS",
    icon: "globe",
    accent: "from-emerald-400 to-cyan-300",
    href: "/labs/dns-failure",
    symptoms: [
      "Ping to known IP works",
      "Website names fail",
      "Endpoint DNS mismatch",
    ],
    skills: ["ipconfig /all", "nslookup", "DNS isolation"],
  },
  {
    id: "LAB-011",
    slug: "wrong-default-gateway",
    title: "Wrong Default Gateway",
    eyebrow: "Endpoint Routing Fault",
    description:
      "A PC can talk locally but cannot leave the subnet. Identify the gateway problem and validate restored reachability.",
    difficulty: "Easy",
    status: "Coming Soon",
    duration: "10 min",
    domain: "Gateway",
    icon: "route",
    accent: "from-cyan-400 to-blue-300",
    href: "/labs/dns-failure",
    symptoms: [
      "Local subnet works",
      "External network fails",
      "Gateway setting is incorrect",
    ],
    skills: ["ipconfig", "ping gateway", "default gateway logic"],
  },
  {
    id: "LAB-017",
    slug: "switch-port-shutdown",
    title: "Switch Port Shutdown",
    eyebrow: "Layer 1/2 Access Fault",
    description:
      "A wired client loses network access. Use switch evidence to identify the disabled access port and validate the repair.",
    difficulty: "Medium",
    status: "Coming Soon",
    duration: "12 min",
    domain: "Switching",
    icon: "layers",
    accent: "from-emerald-400 to-teal-300",
    href: "/labs/dns-failure",
    symptoms: [
      "Client link unavailable",
      "Gateway unreachable",
      "Switchport administratively down",
    ],
    skills: ["show interfaces status", "no shutdown", "Layer 1/2 proof"],
  },
  {
    id: "LAB-020",
    slug: "dhcp-apipa",
    title: "DHCP / APIPA Failure",
    eyebrow: "Address Assignment Fault",
    description:
      "A host receives a 169.254.x.x address. Determine why DHCP failed and prove the client received a valid lease.",
    difficulty: "Medium",
    status: "Coming Soon",
    duration: "14 min",
    domain: "DHCP",
    icon: "database",
    accent: "from-sky-400 to-cyan-300",
    href: "/labs/dns-failure",
    symptoms: [
      "APIPA address present",
      "No valid gateway",
      "DHCP lease missing",
    ],
    skills: ["ipconfig /all", "ipconfig /renew", "DHCP lease evidence"],
  },
  {
    id: "LAB-024",
    slug: "vlan-mismatch",
    title: "VLAN Mismatch",
    eyebrow: "Access VLAN Fault",
    description:
      "A device is connected, but placed in the wrong VLAN. Use switch evidence to isolate and correct the access VLAN.",
    difficulty: "Hard",
    status: "Coming Soon",
    duration: "18 min",
    domain: "VLAN",
    icon: "network",
    accent: "from-amber-300 to-emerald-300",
    href: "/labs/dns-failure",
    symptoms: [
      "Link is up",
      "Wrong subnet behavior",
      "Access VLAN mismatch",
    ],
    skills: ["show vlan brief", "switchport access vlan", "VLAN isolation"],
  },
  {
    id: "LAB-031",
    slug: "acl-block",
    title: "ACL Blocking Service",
    eyebrow: "Policy vs Broken Network",
    description:
      "ICMP works, but one service fails. Separate routing health from an access-control or service-port restriction.",
    difficulty: "Hard",
    status: "Coming Soon",
    duration: "20 min",
    domain: "ACL / Security",
    icon: "shield",
    accent: "from-rose-400 to-amber-300",
    href: "/labs/dns-failure",
    symptoms: [
      "Ping works",
      "Application traffic fails",
      "Policy may be blocking service",
    ],
    skills: ["show access-lists", "service ports", "policy reasoning"],
  },
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

function difficultyTone(difficulty: Difficulty) {
  if (difficulty === "Easy") {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
  }

  if (difficulty === "Medium") {
    return "border-cyan-400/25 bg-cyan-400/10 text-cyan-300";
  }

  if (difficulty === "Hard") {
    return "border-red-400/25 bg-red-500/10 text-red-300";
  }

  return "border-white/10 bg-white/[0.05] text-slate-300";
}

function statusTone(status: LabStatus) {
  if (status === "Ready") {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
  }

  return "border-white/10 bg-white/[0.05] text-slate-400";
}

function StatusPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${className}`}>
      {children}
    </span>
  );
}

function LabsHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-slate-950/45 p-6 shadow-[0_16px_50px_rgba(0,0,0,.35),inset_0_1px_0_rgba(255,255,255,.04)] lg:p-7">
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_18%_0%,rgba(45,212,191,.14),transparent_30%),radial-gradient(circle_at_90%_18%,rgba(52,211,153,.08),transparent_28%)]" />
      <div className="absolute inset-0 opacity-[0.1] [background-image:linear-gradient(rgba(45,212,191,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,.16)_1px,transparent_1px)] [background-size:38px_38px]" />

      <div className="relative flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div className="max-w-4xl">
          <p className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-emerald-300">
            <Icon name="zap" className="h-4 w-4" />
            NETLABS Simulator Library
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-100 lg:text-[44px]">
            Choose a lab. Enter the simulator. Prove the fault.
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 lg:text-base">
            Labs are hands-on simulator environments. Each card opens a focused
            topology workspace where you gather evidence, fix the issue, and
            validate the repair.
          </p>
        </div>

        <div className="grid gap-2 rounded-2xl border border-white/[0.08] bg-black/25 p-4 text-xs text-slate-400 sm:grid-cols-3 xl:w-[440px]">
          {[
            ["01", "Observe", "Read the symptom"],
            ["02", "Investigate", "Run commands"],
            ["03", "Validate", "Prove the repair"],
          ].map(([number, title, body]) => (
            <div key={title}>
              <p className="font-mono text-emerald-300">{number}</p>
              <p className="mt-1 font-semibold text-slate-200">{title}</p>
              <p className="mt-1 leading-4">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LabCardView({ lab }: { lab: LabCard }) {
  const ready = lab.status === "Ready";

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-slate-950/45 p-5 transition hover:border-emerald-300/30 hover:bg-emerald-300/[0.035]">
      <div
        className={`absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br ${lab.accent} opacity-0 blur-3xl transition group-hover:opacity-20`}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
            <Icon name={lab.icon} className="h-5 w-5" />
          </span>

          <div className="flex flex-wrap justify-end gap-2">
            <StatusPill className={statusTone(lab.status)}>{lab.status}</StatusPill>
            <StatusPill className={difficultyTone(lab.difficulty)}>
              {lab.difficulty}
            </StatusPill>
          </div>
        </div>

        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
          {lab.eyebrow}
        </p>

        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-100">
          {lab.title}
        </h2>

        <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-400">
          {lab.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[11px] font-medium text-slate-300">
            {lab.id}
          </span>
          <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[11px] font-medium text-slate-300">
            {lab.duration}
          </span>
          <span className="rounded-md border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.5 text-[11px] font-medium text-cyan-300">
            {lab.domain}
          </span>
        </div>

        <div className="mt-5 rounded-2xl border border-white/[0.07] bg-black/20 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Expected Evidence
          </p>

          <div className="mt-3 space-y-2">
            {lab.symptoms.map((symptom) => (
              <div key={symptom} className="flex gap-2 text-xs leading-5 text-slate-400">
                <Icon name="activity" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                {symptom}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {lab.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1 text-[11px] text-slate-400"
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="mt-6">
          {ready ? (
            <Link
              href={lab.href}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_28px_rgba(52,211,153,.18)] transition hover:brightness-110"
            >
              <Icon name="play" className="h-4 w-4 fill-slate-950" />
              Enter Simulator
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm font-semibold text-slate-500"
            >
              Coming Soon
              <Icon name="chevronRight" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function LabStats() {
  const stats = [
    ["Ready", "01"],
    ["Planned", "05"],
    ["Domains", "06"],
    ["Mode", "Simulator"],
  ];

  return (
    <section className="rounded-3xl border border-white/[0.08] bg-slate-950/45 p-4">
      <div className="grid gap-0 divide-x divide-y divide-white/[0.07] overflow-hidden rounded-2xl border border-white/[0.06] md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-xl text-slate-100">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function LabsPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>("All");

  const visibleLabs = useMemo(
    () =>
      labs.filter(
        (lab) => difficulty === "All" || lab.difficulty === difficulty,
      ),
    [difficulty],
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-[1480px] space-y-4 p-4 lg:p-5">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.055] px-4 py-3 text-sm text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
          <span className="flex min-w-0 items-center gap-2">
            <Icon name="activity" className="h-4 w-4 shrink-0 text-emerald-300" />
            <span className="truncate">
              Lab library loaded. Choose a simulator environment to begin troubleshooting.
            </span>
          </span>

          <span className="hidden text-[11px] uppercase tracking-widest text-emerald-300/80 md:inline">
            Labs
          </span>
        </div>

        <LabsHero />

        <LabStats />

        <section className="rounded-3xl border border-white/[0.08] bg-slate-950/40 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-emerald-300">
                Simulator Labs
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-100">
                Select an environment
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["All", "Easy", "Medium", "Hard"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
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
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {visibleLabs.map((lab) => (
              <LabCardView key={lab.id} lab={lab} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}