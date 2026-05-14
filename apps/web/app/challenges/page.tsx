"use client";

import Link from "next/link";
import React, { useMemo, useRef, useState } from "react";
import AppShell from "@/components/layout/AppShell";

type IconName =
  | "play"
  | "flask"
  | "file"
  | "globe"
  | "terminal"
  | "layers"
  | "check"
  | "crosshair"
  | "activity"
  | "zap"
  | "chart";

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
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  time: string;
  skill: string;
  prompt: string;
};

const iconPaths: Record<IconName, React.ReactNode> = {
  play: <path d="M8 5v14l11-7L8 5Z" />,
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
  check: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="m8 12 3 3 5-6" />
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
  zap: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  chart: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8 16v-5" />
      <path d="M12 16V8" />
      <path d="M16 16v-8" />
    </>
  ),
};

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
    slug: "gateway-works-names-fail",
    difficulty: "Easy",
    time: "4 min",
    skill: "DNS vs gateway reasoning",
    prompt: "IP connectivity works, but domain names fail. Decide what to prove next.",
  },
  {
    id: "CMD-021",
    type: "command",
    title: "Which command proves DNS failure?",
    slug: "which-command-proves-dns-failure",
    difficulty: "Easy",
    time: "3 min",
    skill: "Command selection",
    prompt:
      "Ping to 8.8.8.8 works. Choose the command that proves DNS resolution is failing.",
  },
  {
    id: "OUT-017",
    type: "output",
    title: "Decode APIPA address",
    slug: "decode-apipa-address",
    difficulty: "Easy",
    time: "3 min",
    skill: "Output interpretation",
    prompt: "A PC shows 169.254.x.x. Identify what the evidence suggests.",
  },
  {
    id: "PRT-008",
    type: "ports",
    title: "Service Port Lockpick",
    slug: "service-port-lockpick",
    difficulty: "Medium",
    time: "5 min",
    skill: "Service ports",
    prompt: "HTTPS fails while ICMP works. Identify the service and port to investigate.",
  },
  {
    id: "VAL-011",
    type: "validation",
    title: "Prove the repair",
    slug: "prove-the-repair",
    difficulty: "Medium",
    time: "5 min",
    skill: "Repair validation",
    prompt: "After enabling a switchport, choose the command and test that validates the fix.",
  },
  {
    id: "FDF-032",
    type: "domain",
    title: "DNS, gateway, or ACL?",
    slug: "dns-gateway-or-acl",
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
      {iconPaths[name]}
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
      <h3 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-emerald-300">
        {icon ? <Icon name={icon} className="h-4 w-4" /> : null}
        {title}
      </h3>
      {right}
    </div>
  );
}

function StartHere({ onBrowseAll }: { onBrowseAll: () => void }) {
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
              href="/challenges/osi-ladder/gateway-works-names-fail"
              className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_28px_rgba(52,211,153,.22)]"
            >
              <Icon name="play" className="h-4 w-4 fill-slate-950" />
              Start Recommended
            </Link>

            <button
              type="button"
              onClick={onBrowseAll}
              className="rounded-lg border border-emerald-400/60 bg-emerald-400/[0.04] px-5 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/[0.09]"
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

function ChallengeTypeSelector() {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-slate-950/45 p-4">
      <SectionTitle
        icon="flask"
        title="Choose Challenge Type"
        right={<span className="text-[11px] text-slate-500">Step 2</span>}
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {challengeTypes.map((type) => (
          <Link
            key={type.id}
            href={`/challenges/${type.slug}`}
            className="group relative overflow-hidden rounded-xl border border-white/[0.09] bg-white/[0.025] p-4 text-left transition hover:border-emerald-300/35 hover:bg-emerald-300/[0.035] hover:shadow-[0_0_24px_rgba(52,211,153,.08)]"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-400/0 blur-3xl transition group-hover:bg-emerald-400/10" />

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
        ))}
      </div>
    </section>
  );
}

function DrillList({
  selectedType,
  difficulty,
  setDifficulty,
  sectionRef,
}: {
  selectedType: string;
  difficulty: "All" | Drill["difficulty"];
  setDifficulty: (difficulty: "All" | Drill["difficulty"]) => void;
  sectionRef: React.RefObject<HTMLElement | null>;
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
    <section
      ref={sectionRef}
      id="available-drills"
      className="scroll-mt-6 rounded-2xl border border-white/[0.08] bg-slate-950/45 p-4"
    >
      <SectionTitle
        title={`Available Drills · ${selectedLabel}`}
        right={<span className="text-[11px] text-slate-500">Step 3</span>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
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

      <div className="space-y-2">
        {visible.map((drill) => {
          const category = challengeTypes.find((type) => type.id === drill.type);
          const href = category
            ? `/challenges/${category.slug}/${drill.slug}`
            : "/challenges";

          return (
            <article
              key={drill.id}
              className="grid items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 transition hover:border-emerald-300/30 hover:bg-emerald-300/[0.035] hover:shadow-[0_0_20px_rgba(52,211,153,.07)] lg:grid-cols-[72px_1fr_210px_120px]"
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
                className="flex items-center justify-center gap-2 rounded-lg border border-emerald-400/60 bg-emerald-400/[0.04] px-4 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-gradient-to-r hover:from-emerald-400 hover:to-teal-400 hover:text-slate-950"
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
  const drillListRef = useRef<HTMLElement | null>(null);

  function browseAllChallenges() {
    setSelectedType("all");
    setDifficulty("All");

    requestAnimationFrame(() => {
      drillListRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <AppShell>
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

        <StartHere onBrowseAll={browseAllChallenges} />

        <ChallengeTypeSelector />

        <DrillList
          selectedType={selectedType}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          sectionRef={drillListRef}
        />

        <ReferenceAndProgress />
      </div>
    </AppShell>
  );
}