"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

type IconProps = {
  path: React.ReactNode;
  className?: string;
};

function Icon({ path, className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {path}
    </svg>
  );
}

const ArrowRight = ({ className }: { className?: string }) => (
  <Icon className={className} path={<path d="M5 12h14m-6-6 6 6-6 6" />} />
);

const Activity = ({ className }: { className?: string }) => (
  <Icon
    className={className}
    path={<path d="M22 12h-4l-3 8-4-16-3 8H2" />}
  />
);

const GitBranch = ({ className }: { className?: string }) => (
  <Icon
    className={className}
    path={
      <>
        <path d="M6 3v12" />
        <path d="M18 9a3 3 0 1 0-3-3" />
        <path d="M6 15a3 3 0 1 0 3 3" />
        <path d="M18 6H9a3 3 0 0 0-3 3" />
      </>
    }
  />
);

const Users = ({ className }: { className?: string }) => (
  <Icon
    className={className}
    path={
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    }
  />
);

const ShieldCheck = ({ className }: { className?: string }) => (
  <Icon
    className={className}
    path={
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </>
    }
  />
);

const labs: [string, string][] = [
  ["DNS Failure", "Diagnose resolver timeout while Layer 3 remains functional."],
  ["Gateway Misroute", "Restore outbound connectivity by tracing bad routes."],
  ["Subnet Conflict", "Identify addressing logic errors and repair segmentation."],
];

type ButtonProps = {
  children: React.ReactNode;
  href: string;
  light?: boolean;
};

function Button({ children, href, light = false }: ButtonProps) {
  return (
    <Link
      href={href}
      className={`${
        light
          ? "bg-white text-black hover:bg-zinc-200"
          : "border border-white/20 text-white hover:bg-white/5"
      } inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition-transform duration-200 hover:scale-105`}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

type TerminalLine =
  | {
      type: "command";
      prompt: string;
      text: string;
      afterDelay?: number;
    }
  | {
      type: "output";
      text: string;
      tone?: "normal" | "success" | "danger" | "hint";
      afterDelay?: number;
    };

const terminalScript: TerminalLine[] = [
  {
    type: "command",
    prompt: String.raw`C:\Users\Admin>`,
    text: "ipconfig /all",
    afterDelay: 500,
  },
  {
    type: "output",
    text: "IPv4 Address: 192.168.1.10",
    tone: "normal",
    afterDelay: 180,
  },
  {
    type: "output",
    text: "Default Gateway: 192.168.1.1",
    tone: "normal",
    afterDelay: 180,
  },
  {
    type: "output",
    text: "DNS Server: 192.168.1.99",
    tone: "normal",
    afterDelay: 520,
  },
  {
    type: "command",
    prompt: String.raw`C:\Users\Admin>`,
    text: "ping 8.8.8.8",
    afterDelay: 500,
  },
  {
    type: "output",
    text: "Reply from 8.8.8.8: bytes=32 time=18ms TTL=117",
    tone: "success",
    afterDelay: 520,
  },
  {
    type: "command",
    prompt: String.raw`C:\Users\Admin>`,
    text: "nslookup example.com",
    afterDelay: 520,
  },
  {
    type: "output",
    text: "DNS request timed out.",
    tone: "danger",
    afterDelay: 620,
  },
  {
    type: "output",
    text: "COACH> Routing passes. Investigate DNS resolver.",
    tone: "hint",
    afterDelay: 900,
  },
];

function useRealTerminalTyping(script: TerminalLine[]) {
  const [visibleLines, setVisibleLines] = useState<TerminalLine[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [cycleKey, setCycleKey] = useState(0);

  useEffect(() => {
    let timeoutId: number;
    let cancelled = false;
    const activeLine = script[activeIndex];

    if (!activeLine) {
      timeoutId = window.setTimeout(() => {
        if (!cancelled) {
          setVisibleLines([]);
          setActiveIndex(0);
          setTypedText("");
          setCycleKey((value) => value + 1);
        }
      }, 2400);

      return () => {
        cancelled = true;
        window.clearTimeout(timeoutId);
      };
    }

    if (activeLine.type === "output") {
      timeoutId = window.setTimeout(() => {
        if (!cancelled) {
          setVisibleLines((current) => [...current, activeLine]);
          setActiveIndex((current) => current + 1);
        }
      }, activeLine.afterDelay || 250);

      return () => {
        cancelled = true;
        window.clearTimeout(timeoutId);
      };
    }

    const fullText = activeLine.text || "";

    if (typedText.length < fullText.length) {
      timeoutId = window.setTimeout(() => {
        if (!cancelled) {
          setTypedText(fullText.slice(0, typedText.length + 1));
        }
      }, 35 + Math.random() * 25);
    } else {
      timeoutId = window.setTimeout(() => {
        if (!cancelled) {
          setVisibleLines((current) => [
            ...current,
            { ...activeLine, text: fullText },
          ]);
          setTypedText("");
          setActiveIndex((current) => current + 1);
        }
      }, activeLine.afterDelay || 400);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [activeIndex, typedText, script, cycleKey]);

  return {
    visibleLines,
    activeLine: script[activeIndex],
    typedText,
  };
}

function TerminalOutputLine({ line }: { line: TerminalLine }) {
  if (line.type === "command") {
    return (
      <div className="whitespace-nowrap text-emerald-300">
        <span>{line.prompt}</span> <span>{line.text}</span>
      </div>
    );
  }

  const color =
    line.tone === "danger"
      ? "text-red-400"
      : line.tone === "hint"
      ? "text-amber-300"
      : line.tone === "success"
      ? "text-zinc-300"
      : "text-zinc-300";

  return <div className={`${color} whitespace-nowrap`}>{line.text}</div>;
}

function ActiveTerminalLine({
  activeLine,
  typedText,
}: {
  activeLine?: TerminalLine;
  typedText: string;
}) {
  if (!activeLine || activeLine.type !== "command") return null;

  return (
    <div className="whitespace-nowrap text-emerald-300">
      <span>{activeLine.prompt}</span> <span>{typedText}</span>
      <span className="ml-1 inline-block h-5 w-2 animate-pulse bg-emerald-300 align-[-3px]" />
    </div>
  );
}

function IdleTerminalPrompt({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="whitespace-nowrap pt-4 text-emerald-300">
      <span>admin@pc1:~$</span>
      <span className="ml-1 inline-block h-5 w-2 animate-pulse bg-emerald-300 align-[-3px]" />
    </div>
  );
}

function TerminalDemo() {
  const { visibleLines, activeLine, typedText } =
    useRealTerminalTyping(terminalScript);

  return (
    <div className="relative w-full origin-center lg:scale-[1.04] xl:scale-[1.08]">
      <div className="absolute -inset-5 rounded-[2rem] bg-emerald-400/[0.06] blur-3xl" />
      <div className="absolute -inset-px rounded-[1.65rem] bg-gradient-to-br from-emerald-300/20 via-emerald-500/5 to-transparent" />

      <div className="relative overflow-hidden rounded-[1.6rem] border border-emerald-400/20 bg-[#010806] shadow-[0_35px_120px_rgba(0,0,0,0.85)]">
        <div className="flex items-center justify-between border-b border-emerald-400/10 bg-[#07110e] px-5 py-3">
          <div className="flex gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,.45)]" />
            <span className="h-3 w-3 rounded-full bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,.35)]" />
            <span className="h-3 w-3 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,.45)]" />
          </div>

          <div className="flex items-center gap-2 text-xs tracking-[0.34em] text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
            PC1-CONSOLE
          </div>

          <div className="text-xs text-zinc-600">LIVE NODE</div>
        </div>

        <div className="relative min-h-[470px] p-7 font-mono text-sm leading-8 text-emerald-300 md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[length:100%_4px] opacity-[0.045]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(16,185,129,.10),transparent_24%),radial-gradient(circle_at_20%_90%,rgba(16,185,129,.06),transparent_30%)]" />

          <div className="relative z-10 space-y-2 overflow-hidden">
            {visibleLines.map((line, index) => (
              <TerminalOutputLine
                key={`${line.type}-${line.text}-${index}`}
                line={line}
              />
            ))}

            <ActiveTerminalLine activeLine={activeLine} typedText={typedText} />

            <IdleTerminalPrompt
              show={!activeLine && visibleLines.length === terminalScript.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroAtmosphere() {
  const dots: [number, number, number][] = [
    [8, 22, 0],
    [14, 78, 1.1],
    [27, 36, 0.4],
    [41, 64, 1.7],
    [56, 18, 0.8],
    [68, 46, 1.3],
    [82, 72, 0.2],
    [94, 34, 1.9],
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,.14)_1px,transparent_1px)] bg-[size:90px_90px] opacity-[0.18] [mask-image:radial-gradient(circle_at_58%_45%,black,transparent_72%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_32%,rgba(16,185,129,.12),transparent_28%),radial-gradient(circle_at_18%_30%,rgba(45,212,191,.07),transparent_24%)]" />

      <motion.div
        className="absolute left-0 top-[42%] h-px w-full bg-gradient-to-r from-transparent via-emerald-400/25 to-transparent"
        animate={{ opacity: [0.08, 0.32, 0.08] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute left-0 top-[61%] h-px w-full bg-gradient-to-r from-transparent via-emerald-400/12 to-transparent"
        animate={{ opacity: [0.04, 0.22, 0.04] }}
        transition={{
          repeat: Infinity,
          duration: 6.5,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {dots.map(([left, top, delay], index) => (
        <motion.span
          key={index}
          className="absolute h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,.7)]"
          style={{ left: `${left}%`, top: `${top}%` }}
          animate={{
            opacity: [0.18, 0.95, 0.18],
            scale: [0.85, 1.25, 0.85],
            y: [0, -10, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 4.8 + index * 0.25,
            delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

const audienceCards = [
  {
    Icon: Users,
    title: "Students",
    text: "Practice structured troubleshooting.",
  },
  {
    Icon: GitBranch,
    title: "Teams",
    text: "Branch and compare diagnostic decisions.",
  },
  {
    Icon: ShieldCheck,
    title: "Instructors",
    text: "Track thinking, not guesses.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            NETWORKLAB
          </Link>

          <nav className="hidden gap-8 text-zinc-400 md:flex">
            <Link href="/dashboard" className="hover:text-white">
              Labs
            </Link>
            <Link href="/challenges" className="hover:text-white">
              Challenges
            </Link>
            <Link href="/login" className="hover:text-white">
              Login
            </Link>
          </nav>

          <Button href="/register" light>
            Start Free
          </Button>
        </div>
      </header>

      <section className="relative flex min-h-[860px] items-center overflow-hidden">
        <HeroAtmosphere />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="mb-6 text-sm uppercase tracking-[0.32em] text-emerald-300">
              Train like real infrastructure teams
            </div>

            <h1 className="max-w-3xl text-6xl font-semibold leading-[0.94] tracking-tight md:text-8xl">
              Master network failures like the engineer people rely on.
            </h1>

            <p className="mt-8 max-w-xl text-xl leading-8 text-zinc-400">
              Deploy broken environments, diagnose with live CLI, branch failed
              theories, and validate repairs through scored operational proof.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button href="/dashboard" light>
                Enter Labs
              </Button>
              <Button href="/challenges">Practice Commands</Button>
            </div>
          </div>

          <TerminalDemo />
        </div>
      </section>

      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0b0f19_0%,#111827_35%,#1f2937_65%,#0f766e_100%)] py-28 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_35%)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <h2 className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
            Professional, practical, and dynamic without feeling sterile.
          </h2>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {audienceCards.map(({ Icon, title, text }) => (
              <motion.div
                whileHover={{ y: -8 }}
                key={title}
                className="rounded-3xl border border-emerald-300/10 bg-white/[0.06] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition hover:border-emerald-300/30"
              >
                <Icon className="mb-6 h-10 w-10" />
                <h3 className="text-2xl font-semibold text-emerald-200">
                  {title}
                </h3>
                <p className="mt-3 leading-7 text-zinc-300">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="max-w-3xl text-5xl font-semibold">
            Failure scenarios that feel like real tickets.
          </h2>
          <div className="text-zinc-500">Scenario Library</div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {labs.map(([title, text], index) => (
            <div
              key={title}
              className="rounded-3xl border border-white/10 bg-zinc-950 p-8 transition hover:border-emerald-400/30"
            >
              <div className="mb-8 text-sm text-zinc-500">
                Lab {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="text-3xl font-semibold">{title}</h3>
              <p className="mt-4 text-zinc-400">{text}</p>
              <div className="mt-8 font-mono text-emerald-300">$ start-lab</div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 px-6 py-24 text-center">
        <Activity className="mx-auto mb-6 h-12 w-12 text-emerald-300" />
        <h2 className="text-5xl font-semibold">
          Build troubleshooting confidence now.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-zinc-500">
          From first command to validated repair, train with environments
          designed to build instinct.
        </p>
        <div className="mt-10">
          <Button href="/dashboard" light>
            Launch First Lab
          </Button>
        </div>
      </section>
    </main>
  );
}