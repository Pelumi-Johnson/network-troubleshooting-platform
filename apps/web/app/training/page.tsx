"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";

type TrackId = "foundations" | "packet-tracer" | "field-work";

type IconName =
  | "activity"
  | "book"
  | "check"
  | "chevronRight"
  | "external"
  | "network"
  | "play"
  | "route"
  | "terminal"
  | "zap";

type TrainingTrack = {
  id: TrackId;
  title: string;
  eyebrow: string;
  description: string;
  icon: IconName;
  badge: string;
  accent: string;
  outcome: string;
  primaryAction: {
    label: string;
    href: string;
  };
  modules: string[];
  method: {
    title: string;
    body: string;
    steps: string[];
  };
};

const iconPaths: Record<IconName, React.ReactNode> = {
  activity: <path d="M3 12h4l2-6 4 12 2-6h6" />,
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" />
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 8H20" />
    </>
  ),
  check: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  chevronRight: <path d="m9 6 6 6-6 6" />,
  external: (
    <>
      <path d="M14 4h6v6" />
      <path d="M10 14 20 4" />
      <path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
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
  terminal: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="m8 10 3 2-3 2" />
      <path d="M13 15h4" />
    </>
  ),
  zap: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
};

const tracks: TrainingTrack[] = [
  {
    id: "foundations",
    title: "Learn From Scratch",
    eyebrow: "Network Engineering Path",
    description:
      "Start with devices, IP addressing, default gateways, DNS, switching, routing, and packet flow.",
    icon: "book",
    badge: "Beginner",
    accent: "from-emerald-400 to-teal-300",
    outcome:
      "Build the foundation a new network engineer needs before touching real troubleshooting tickets.",
    primaryAction: {
      label: "Practice Foundations",
      href: "/challenges/osi-ladder",
    },
    modules: [
      "What a network is",
      "PC, switch, router, and server roles",
      "IP address, subnet mask, and default gateway",
      "DNS and DHCP basics",
      "Switching and routing fundamentals",
    ],
    method: {
      title: "Concept-first learning",
      body:
        "This track explains the topic in plain language, then immediately ties it to proof: what command shows it, what output matters, and what failure looks like.",
      steps: [
        "Read the concept",
        "Learn the command that proves it",
        "Answer a checkpoint",
        "Practice with a related drill",
      ],
    },
  },
  {
    id: "packet-tracer",
    title: "Packet Tracer Field Work",
    eyebrow: "Cisco Practice Layer",
    description:
      "Follow NETLABS prompts, then build and test the topology inside Cisco Packet Tracer.",
    icon: "external",
    badge: "Build",
    accent: "from-cyan-400 to-blue-300",
    outcome:
      "Use Cisco Packet Tracer as the external build environment while NETLABS provides the guided assignment and validation questions.",
    primaryAction: {
      label: "Start DNS Lab",
      href: "/labs/dns-failure",
    },
    modules: [
      "Build PC → Switch → Router",
      "Configure PC IP settings",
      "Configure router interfaces",
      "Add DNS and DHCP services",
      "Break and repair common faults",
    ],
    method: {
      title: "Prompt-to-practice workflow",
      body:
        "NETLABS gives the scenario. The learner builds it in Packet Tracer, runs the required tests, then returns to NETLABS to explain the evidence.",
      steps: [
        "Read the NETLABS assignment",
        "Build the topology in Packet Tracer",
        "Run the required tests",
        "Return with proof and answers",
      ],
    },
  },
  {
    id: "field-work",
    title: "Real-World Troubleshooting",
    eyebrow: "Industry Simulation",
    description:
      "Handle tickets like a junior network engineer: observe, prove, isolate, fix, and validate.",
    icon: "terminal",
    badge: "Job Ready",
    accent: "from-amber-300 to-emerald-300",
    outcome:
      "Turn theory into field behavior: no guessing, no random fixes, only evidence-driven troubleshooting.",
    primaryAction: {
      label: "Open Command Center",
      href: "/dashboard",
    },
    modules: [
      "No internet access",
      "IP works but names fail",
      "Switchport shutdown",
      "Wrong default gateway",
      "DHCP/APIPA failure",
    ],
    method: {
      title: "Engineer workflow",
      body:
        "This track trains the troubleshooting rhythm a beginner should repeat until it becomes natural.",
      steps: [
        "Observe the symptom",
        "Check lower layers first",
        "Use commands to prove the fault",
        "Apply the repair",
        "Validate and explain the fix",
      ],
    },
  },
];

const pathSequence = [
  ["01", "Learn", "Concepts and commands"],
  ["02", "Build", "Packet Tracer topology"],
  ["03", "Break", "Create realistic faults"],
  ["04", "Troubleshoot", "Use NETLABS tickets"],
  ["05", "Validate", "Prove the repair"],
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

function TrainingCard({
  track,
  active,
  onClick,
}: {
  track: TrainingTrack;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative min-h-[190px] overflow-hidden rounded-3xl border p-5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/40 ${
        active
          ? "border-emerald-300/35 bg-emerald-300/[0.065] shadow-[0_0_26px_rgba(52,211,153,.08)]"
          : "border-white/[0.08] bg-slate-950/45 hover:border-emerald-300/30 hover:bg-emerald-300/[0.035]"
      }`}
    >
      <div
        className={`absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${track.accent} opacity-0 blur-3xl transition group-hover:opacity-20 ${
          active ? "opacity-15" : ""
        }`}
      />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <span className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
            <Icon name={track.icon} className="h-5 w-5" />
          </span>

          <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 text-[11px] font-medium text-slate-300">
            {track.badge}
          </span>
        </div>

        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
          {track.eyebrow}
        </p>

        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-100">
          {track.title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          {track.description}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-4 text-sm font-semibold text-emerald-300">
          Open section
          <Icon
            name="chevronRight"
            className={`h-4 w-4 transition ${active ? "rotate-90" : ""}`}
          />
        </div>
      </div>
    </button>
  );
}

function SelectedTrackPanel({ track }: { track: TrainingTrack }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-slate-950/45 p-5 shadow-[0_16px_50px_rgba(0,0,0,.35),inset_0_1px_0_rgba(255,255,255,.04)] lg:p-6">
      <div
        className={`absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br ${track.accent} opacity-16 blur-3xl`}
      />

      <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-emerald-300">
            <Icon name={track.icon} className="h-4 w-4" />
            {track.title}
          </p>

          <h3 className="mt-3 max-w-4xl text-2xl font-semibold tracking-tight text-slate-100 lg:text-3xl">
            {track.outcome}
          </h3>

          <div className="mt-5 grid gap-2 md:grid-cols-2">
            {track.modules.map((module) => (
              <div
                key={module}
                className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-3 text-sm text-slate-300"
              >
                <Icon name="check" className="h-4 w-4 shrink-0 text-emerald-300" />
                {module}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={track.primaryAction.href}
              className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_28px_rgba(52,211,153,.22)]"
            >
              <Icon name="play" className="h-4 w-4 fill-slate-950" />
              {track.primaryAction.label}
            </Link>

            <Link
              href="/profile"
              className="rounded-lg border border-emerald-400/60 bg-emerald-400/[0.04] px-5 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/[0.09]"
            >
              View Progress
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.045] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-300">
            Method
          </p>

          <h4 className="mt-3 text-lg font-semibold text-slate-100">
            {track.method.title}
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {track.method.body}
          </p>

          <div className="mt-5 space-y-2">
            {track.method.steps.map((step, index) => (
              <div
                key={step}
                className="flex gap-3 rounded-xl border border-white/[0.07] bg-black/25 p-3 text-sm text-slate-300"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-cyan-300/35 bg-cyan-300/10 text-[11px] font-bold text-cyan-200">
                  {index + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TrainingHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-slate-950/45 p-6 shadow-[0_16px_50px_rgba(0,0,0,.35),inset_0_1px_0_rgba(255,255,255,.04)] lg:p-7">
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_18%_0%,rgba(45,212,191,.14),transparent_30%),radial-gradient(circle_at_90%_18%,rgba(52,211,153,.08),transparent_28%)]" />
      <div className="absolute inset-0 opacity-[0.1] [background-image:linear-gradient(rgba(45,212,191,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,.16)_1px,transparent_1px)] [background-size:38px_38px]" />

      <div className="relative flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div className="max-w-4xl">
          <p className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-emerald-300">
            <Icon name="zap" className="h-4 w-4" />
            NETLABS Training
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-100 lg:text-[44px]">
            Learn it, build it, break it, troubleshoot it.
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 lg:text-base">
            A practical network engineering path that connects fundamentals,
            Cisco Packet Tracer practice, and real-world troubleshooting tickets.
          </p>
        </div>

        <div className="grid gap-2 rounded-2xl border border-white/[0.08] bg-black/25 p-4 text-xs text-slate-400 sm:grid-cols-3 xl:w-[440px]">
          {pathSequence.slice(0, 3).map(([number, title, body]) => (
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

function PathSequence() {
  return (
    <section className="rounded-3xl border border-white/[0.08] bg-slate-950/45 p-4">
      <div className="grid gap-3 md:grid-cols-5">
        {pathSequence.map(([number, title, body]) => (
          <div
            key={title}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
          >
            <span className="font-mono text-xs text-emerald-300">{number}</span>
            <h4 className="mt-2 text-sm font-semibold text-slate-100">{title}</h4>
            <p className="mt-1 text-xs leading-5 text-slate-500">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TrainingPage() {
  const [selectedTrackId, setSelectedTrackId] = useState<TrackId>("foundations");

  const selectedTrack = useMemo(
    () => tracks.find((track) => track.id === selectedTrackId) || tracks[0],
    [selectedTrackId],
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-[1480px] space-y-4 p-4 lg:p-5">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.055] px-4 py-3 text-sm text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
          <span className="flex min-w-0 items-center gap-2">
            <Icon name="activity" className="h-4 w-4 shrink-0 text-emerald-300" />
            <span className="truncate">
              Choose a training mode: learn concepts, build in Packet Tracer, or troubleshoot real tickets.
            </span>
          </span>

          <span className="hidden text-[11px] uppercase tracking-widest text-emerald-300/80 md:inline">
            Training Path
          </span>
        </div>

        <TrainingHero />

        <section className="grid gap-4 xl:grid-cols-3">
          {tracks.map((track) => (
            <TrainingCard
              key={track.id}
              track={track}
              active={selectedTrack.id === track.id}
              onClick={() => setSelectedTrackId(track.id)}
            />
          ))}
        </section>

        <SelectedTrackPanel track={selectedTrack} />

        <PathSequence />
      </div>
    </AppShell>
  );
}