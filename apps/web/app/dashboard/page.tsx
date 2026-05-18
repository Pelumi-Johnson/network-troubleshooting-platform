"use client";

import Link from "next/link";
import React, { useState } from "react";
import AppShell from "@/components/layout/AppShell";

const ACTIVE_LAB_HREF = "/labs/dns-failure?ticket=inc-014-dns-failure";
const ACTIVE_TICKET_HREF = "/tickets/inc-014-dns-failure";
const TICKETS_HREF = "/tickets";
const LABS_HREF = "/labs";
const EVIDENCE_HREF = "/evidence";
const TRAINING_HREF = "/training";
const CHALLENGES_HREF = "/challenges";
const PROFILE_HREF = "/profile";

const iconPaths = {
  chevronRight: <path d="m9 6 6 6-6 6" />,
  circle: <circle cx="12" cy="12" r="7" />,
  play: <path d="M8 5v14l11-7L8 5Z" />,
  check: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="m8 12 3 3 5-6" />
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
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M8 6h5a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h7" />
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
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
} satisfies Record<string, React.ReactNode>;

type IconName = keyof typeof iconPaths;
type Tone = "red" | "amber" | "green" | "cyan" | "slate";

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

function Pill({
  tone = "slate",
  children,
}: {
  tone?: Tone;
  children: React.ReactNode;
}) {
  const styles: Record<Tone, string> = {
    red: "border-red-400/25 bg-red-500/10 text-red-300",
    amber: "border-amber-400/25 bg-amber-400/10 text-amber-300",
    green: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    cyan: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
    slate: "border-white/10 bg-white/[0.05] text-slate-300",
  };

  return (
    <span
      className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${styles[tone]}`}
    >
      {children}
    </span>
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
      <h3 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-emerald-300">
        {icon ? <Icon name={icon} className="h-4 w-4" /> : null}
        {title}
      </h3>
      {right}
    </div>
  );
}

const commandCards: {
  title: string;
  body: string;
  href: string;
  icon: IconName;
  tone: Tone;
  meta: string;
}[] = [
  {
    title: "Tickets",
    body: "Open real-world incident cases before entering a simulator.",
    href: TICKETS_HREF,
    icon: "warning",
    tone: "amber",
    meta: "Case queue",
  },
  {
    title: "Labs",
    body: "Practice by topic when you already know the skill you want.",
    href: LABS_HREF,
    icon: "flask",
    tone: "green",
    meta: "Skill practice",
  },
  {
    title: "Evidence",
    body: "Review proof collected from commands, tests, and validations.",
    href: EVIDENCE_HREF,
    icon: "file",
    tone: "cyan",
    meta: "Proof notebook",
  },
  {
    title: "Training",
    body: "Follow the structured path from beginner to job-ready workflow.",
    href: TRAINING_HREF,
    icon: "route",
    tone: "slate",
    meta: "Guided roadmap",
  },
];

const evidencePreview: {
  label: string;
  value: string;
  tone: Tone;
  icon: IconName;
}[] = [
  { label: "Ping 8.8.8.8", value: "PASS", tone: "green", icon: "activity" },
  { label: "nslookup google.com", value: "FAIL", tone: "red", icon: "globe" },
  {
    label: "Endpoint DNS server",
    value: "MISMATCH",
    tone: "amber",
    icon: "terminal",
  },
];

const responseSequence: [string, string][] = [
  ["Compare affected endpoint with a known-good host", "Next"],
  ["Run DNS lookup from PC-02", "Then"],
  ["Validate the repair with name resolution", "After"],
];

function StatusStrip({ notice }: { notice: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.055] px-4 py-3 text-sm text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
      <span className="flex min-w-0 items-center gap-2">
        <Icon name="activity" className="h-4 w-4 shrink-0 text-emerald-300" />
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
          Command Center
        </span>
      </div>
    </div>
  );
}

function ActiveCase({ onNotice }: { onNotice: (message: string) => void }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-slate-950/45 p-5 shadow-[0_16px_50px_rgba(0,0,0,.35),inset_0_1px_0_rgba(255,255,255,.04)]">
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_30%_0%,rgba(45,212,191,.12),transparent_30%),radial-gradient(circle_at_95%_20%,rgba(52,211,153,.08),transparent_26%)]" />
      <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-300/30 to-transparent" />

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-emerald-300">
              <Icon name="warning" className="h-4 w-4" />
              Active Case
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-100 lg:text-[30px]">
                INC-014 · DNS Failure — Websites Not Resolving
              </h1>
              <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,.8)]" />
              <Pill tone="cyan">Medium · Active</Pill>
            </div>

            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
              A workstation can reach external IP addresses, but website names
              fail. Use the case file to understand the report, the lab to
              investigate, and evidence to prove the result.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-black/25 px-4 py-3 text-right">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">
              Current State
            </p>
            <p className="font-mono text-2xl text-slate-100">Active</p>
          </div>
        </div>

        <div className="mt-5 grid rounded-xl border border-white/[0.08] bg-slate-950/45 p-3 md:grid-cols-4">
          {[
            ["1", "Case", "Read report"],
            ["2", "Investigate", "Use simulator"],
            ["3", "Evidence", "Record proof"],
            ["4", "Validate", "Confirm fix"],
          ].map(([num, label, sub], index) => (
            <div key={label} className="relative flex items-center gap-3 px-2 py-2">
              {index < 3 ? (
                <span className="absolute right-2 top-1/2 hidden h-px w-12 bg-gradient-to-r from-slate-700 to-emerald-400/30 lg:block" />
              ) : null}
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-sm font-bold ${
                  index === 1
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

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Link
            href={ACTIVE_TICKET_HREF}
            onClick={() => onNotice("Opening active case file.")}
            className="flex items-center justify-center gap-2 rounded-lg border border-emerald-400/70 bg-emerald-400/[0.04] px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/10"
          >
            <Icon name="warning" className="h-4 w-4" />
            Case File
          </Link>

          <Link
            href={ACTIVE_LAB_HREF}
            onClick={() => onNotice("Opening simulator with active case context.")}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_28px_rgba(52,211,153,.22)] transition hover:scale-[1.01]"
          >
            <Icon name="play" className="h-4 w-4 fill-slate-950" />
            Continue Lab
          </Link>

          <Link
            href={EVIDENCE_HREF}
            onClick={() => onNotice("Opening evidence notebook.")}
            className="flex items-center justify-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-300/[0.055] px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-300/10"
          >
            <Icon name="file" className="h-4 w-4" />
            Evidence
          </Link>

          <Link
            href={TRAINING_HREF}
            onClick={() => onNotice("Opening training path.")}
            className="flex items-center justify-center gap-2 rounded-lg border border-white/[0.09] bg-slate-800/60 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700/70"
          >
            <Icon name="route" className="h-4 w-4" />
            Training
          </Link>
        </div>
      </div>
    </section>
  );
}

function CommandCards() {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {commandCards.map(({ title, body, href, icon, tone, meta }) => (
        <Link
          key={title}
          href={href}
          className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-950/45 p-4 transition hover:border-emerald-300/30 hover:bg-emerald-300/[0.035]"
        >
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative flex items-start justify-between gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
              <Icon name={icon} className="h-5 w-5" />
            </span>
            <Pill tone={tone}>{meta}</Pill>
          </div>

          <h3 className="relative mt-5 text-base font-semibold text-slate-100">
            {title}
          </h3>
          <p className="relative mt-2 min-h-[44px] text-xs leading-relaxed text-slate-500">
            {body}
          </p>
          <p className="relative mt-3 flex items-center gap-1 text-[11px] font-medium text-emerald-300">
            Open <Icon name="chevronRight" className="h-3 w-3" />
          </p>
        </Link>
      ))}
    </section>
  );
}

function NextActionBrief() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-950/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
      <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(45,212,191,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,.12)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative">
        <SectionTitle icon="crosshair" title="Next Action Brief" />

        <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.055] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-300">
            Recommended first move
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-100">
            Prove whether this is a DNS issue before changing anything.
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
            Check known IP reachability, then compare it against name
            resolution. The difference between those two tests points the
            investigation.
          </p>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {[
            [
              "1",
              "Known IP",
              "If a known IP works, the endpoint still has usable network reachability.",
            ],
            [
              "2",
              "DNS name",
              "If names fail while IP works, focus on resolver configuration or DNS service.",
            ],
            [
              "3",
              "Validate",
              "After repair, prove the symptom is gone with another lookup.",
            ],
          ].map(([num, title, body]) => (
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
      </div>
    </section>
  );
}

function EvidencePreview() {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-slate-950/45 p-4">
      <SectionTitle
        icon="file"
        title="Evidence Preview"
        right={
          <Link
            href={EVIDENCE_HREF}
            className="flex items-center gap-1 text-[11px] font-medium text-emerald-300"
          >
            Open Notebook <Icon name="chevronRight" className="h-3 w-3" />
          </Link>
        }
      />

      <div className="overflow-hidden rounded-lg border border-white/[0.06]">
        {evidencePreview.map(({ label, value, tone, icon }) => (
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
            <Pill tone={tone}>{value}</Pill>
          </div>
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
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-950/45 p-4">
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
      <h3 className="mb-3 text-xl font-semibold text-slate-100">Layer 2 → DNS</h3>

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
    <section className="rounded-2xl border border-white/[0.08] bg-slate-950/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
      <SectionTitle icon="crosshair" title="Immediate Action" />
      <h3 className="text-lg font-semibold text-slate-100">
        Confirm DNS without skipping lower layers
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        Start with the smallest proof: can the affected PC reach a known IP and
        resolve a DNS name?
      </p>

      <p className="mt-7 text-[11px] uppercase tracking-widest text-slate-500">
        Response Sequence
      </p>

      <div className="mt-3 space-y-3">
        {responseSequence.map(([label, time]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-3 text-slate-300">
              <Icon name="check" className="h-4 w-4 shrink-0 text-emerald-300" />
              <span className="truncate">{label}</span>
            </span>
            <span className="shrink-0 text-slate-500">{time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TrainingPlan() {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-slate-950/55 p-5">
      <SectionTitle
        icon="layers"
        title="Training Path"
        right={
          <Link
            href={TRAINING_HREF}
            className="text-[11px] font-medium text-emerald-300"
          >
            Open
          </Link>
        }
      />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-300">Troubleshooting Foundations</p>
        <p className="text-sm text-slate-500">Day 06</p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_18px_rgba(45,212,191,.3)]" />
      </div>

      <div className="mt-5 space-y-2">
        {["Observe symptoms", "Verify lower layers", "DNS isolation drill"].map(
          (item, index) => (
            <div
              key={item}
              className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-sm ${
                index === 2 ? "bg-white/[0.04] text-slate-200" : "text-slate-300"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon
                  name={index === 2 ? "circle" : "check"}
                  className="h-4 w-4 text-emerald-300"
                />
                {item}
              </span>
              {index === 2 ? (
                <Icon name="chevronRight" className="h-4 w-4 text-slate-500" />
              ) : null}
            </div>
          ),
        )}
      </div>
    </section>
  );
}

function DashboardSnapshot() {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-slate-950/55 p-5">
      <SectionTitle title="Snapshot" />

      <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-white/[0.07] overflow-hidden rounded-lg border border-white/[0.06]">
        <div className="p-3">
          <p className="text-xs text-slate-500">Open Tickets</p>
          <p className="mt-2 text-2xl text-slate-100">02</p>
        </div>
        <div className="p-3">
          <p className="text-xs text-slate-500">Evidence</p>
          <p className="mt-2 text-2xl text-slate-100">04</p>
        </div>
        <div className="p-3">
          <p className="text-xs text-slate-500">Next Focus</p>
          <p className="mt-2 text-lg text-slate-100">DNS</p>
        </div>
        <div className="p-3">
          <p className="text-xs text-slate-500">Mode</p>
          <p className="mt-2 text-lg text-slate-100">Case</p>
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

function ProfileMini() {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-slate-950/55 p-5">
      <SectionTitle
        icon="user"
        title="Progress"
        right={
          <Link
            href={PROFILE_HREF}
            className="text-[11px] font-medium text-emerald-300"
          >
            Profile
          </Link>
        }
      />

      <div className="rounded-xl border border-emerald-300/15 bg-emerald-300/[0.055] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300">
          Strong habit
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-100">
          Evidence-first workflow
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          Keep proving the fault before applying a fix.
        </p>
      </div>
    </section>
  );
}

function RightRail() {
  return (
    <aside className="space-y-4">
      <TodayFocus />
      <TrainingPlan />
      <DashboardSnapshot />
      <ProfileMini />
    </aside>
  );
}

export default function NetworkTroubleshootingDashboard() {
  const [notice, setNotice] = useState(
    "Command center ready. Continue the active case or jump into a workspace.",
  );

  return (
    <AppShell>
      <div className="mx-auto grid max-w-[1480px] gap-4 p-4 lg:p-5 2xl:grid-cols-[minmax(0,1fr)_344px]">
        <div className="min-w-0 space-y-4">
          <StatusStrip notice={notice} />

          <ActiveCase onNotice={setNotice} />

          <CommandCards />

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <NextActionBrief />
            <EvidencePreview />
          </div>

          <OSIFocus />
        </div>

        <RightRail />
      </div>
    </AppShell>
  );
}