"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

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
      } inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition-transform duration-200 hover:scale-105`}
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
      <div className="whitespace-pre text-emerald-300">
        <span>{line.prompt}</span> <span>{line.text}</span>
      </div>
    );
  }

  const color =
    line.tone === "danger"
      ? "text-red-400"
      : line.tone === "hint"
      ? "text-amber-300"
      : "text-zinc-300";

  return <div className={`${color} whitespace-pre`}>{line.text}</div>;
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
    <div className="whitespace-pre text-emerald-300">
      <span>{activeLine.prompt}</span> <span>{typedText}</span>
      <span className="ml-1 inline-block h-5 w-2 animate-pulse bg-emerald-300 align-[-3px]" />
    </div>
  );
}

function IdleTerminalPrompt({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="whitespace-pre pt-4 text-emerald-300">
      <span>admin@pc1:~$</span>
      <span className="ml-1 inline-block h-5 w-2 animate-pulse bg-emerald-300 align-[-3px]" />
    </div>
  );
}

function TerminalDemo() {
  const { visibleLines, activeLine, typedText } =
    useRealTerminalTyping(terminalScript);

  return (
    <div className="relative w-full origin-center">
      <div className="absolute -inset-5 rounded-[2rem] bg-emerald-400/[0.06] blur-3xl" />
      <div className="absolute -inset-px rounded-[1.65rem] bg-gradient-to-br from-emerald-300/20 via-emerald-500/5 to-transparent" />

      <div className="relative overflow-hidden rounded-[1.6rem] border border-emerald-400/20 bg-[#010806] shadow-[0_35px_120px_rgba(0,0,0,0.85)]">
        <div className="flex items-center justify-between gap-4 border-b border-emerald-400/10 bg-[#07110e] px-4 py-3 sm:px-5">
          <div className="flex gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,.45)]" />
            <span className="h-3 w-3 rounded-full bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,.35)]" />
            <span className="h-3 w-3 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,.45)]" />
          </div>

          <div className="flex items-center gap-2 text-[10px] tracking-[0.24em] text-emerald-300 sm:text-xs sm:tracking-[0.34em]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
            PC1-CONSOLE
          </div>

          <div className="hidden text-xs text-zinc-600 sm:block">LIVE NODE</div>
        </div>

        <div className="relative min-h-[360px] p-5 font-mono text-xs leading-7 text-emerald-300 sm:min-h-[420px] sm:p-7 sm:text-sm md:min-h-[470px] md:p-8 md:leading-8">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[length:100%_4px] opacity-[0.045]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(16,185,129,.10),transparent_24%),radial-gradient(circle_at_20%_90%,rgba(16,185,129,.06),transparent_30%)]" />

          <div className="relative z-10 space-y-2 overflow-x-auto overflow-y-hidden pb-2">
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
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,.14)_1px,transparent_1px)] bg-[size:70px_70px] opacity-[0.16] [mask-image:radial-gradient(circle_at_58%_45%,black,transparent_72%)] md:bg-[size:90px_90px]" />
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

function TopAmbientStrip() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[60] h-[9px] overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-90 blur-[0.5px]"
        style={{
          background:
            "linear-gradient(90deg, rgba(245,158,11,.75) 0%, rgba(16,185,129,.75) 24%, rgba(240,249,255,.55) 48%, rgba(16,185,129,.75) 72%, rgba(245,158,11,.72) 100%)",
          backgroundSize: "220% 100%",
        }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

function NeonLightField({ className = "" }: { className?: string }) {
  const { scrollY } = useScroll();
  const slowY = useTransform(scrollY, [0, 1200], [0, -70]);
  const fastY = useTransform(scrollY, [0, 1200], [0, -140]);
  const glowY = useTransform(scrollY, [0, 1200], [0, -40]);

  const wideBars = [
    { left: "4%", top: "18%", width: 32, height: 280, color: "rgba(34,211,238,.22)", opacity: 0.2, duration: 10, delay: 0 },
    { left: "22%", top: "10%", width: 54, height: 360, color: "rgba(16,185,129,.22)", opacity: 0.22, duration: 11, delay: 0.4 },
    { left: "56%", top: "6%", width: 78, height: 460, color: "rgba(240,249,255,.18)", opacity: 0.16, duration: 9, delay: 0.8 },
    { left: "84%", top: "30%", width: 48, height: 220, color: "rgba(34,211,238,.16)", opacity: 0.15, duration: 13, delay: 0.9 },
  ];

  const thinBars = [
    { left: "8%", top: "22%", width: 8, height: 240, color: "rgba(16,185,129,.35)", opacity: 0.22, duration: 6.5, delay: 0.2 },
    { left: "31%", top: "26%", width: 9, height: 210, color: "rgba(16,185,129,.32)", opacity: 0.2, duration: 6.8, delay: 0.5 },
    { left: "61%", top: "4%", width: 14, height: 470, color: "rgba(250,250,250,.25)", opacity: 0.2, duration: 7.2, delay: 0.6 },
    { left: "91%", top: "34%", width: 8, height: 230, color: "rgba(34,211,238,.2)", opacity: 0.15, duration: 7.8, delay: 0.9 },
  ];

  return (
    <div
      className={`pointer-events-none absolute inset-0 hidden overflow-hidden md:block ${className}`}
    >
      <motion.div style={{ y: glowY }} className="absolute inset-0">
        <div className="absolute left-[7%] top-[18%] h-[320px] w-[280px] rounded-full bg-emerald-400/[0.07] blur-3xl" />
        <div className="absolute left-[52%] top-[8%] h-[420px] w-[320px] rounded-full bg-cyan-300/[0.06] blur-3xl" />
        <div className="absolute right-[5%] top-[24%] h-[300px] w-[240px] rounded-full bg-white/[0.04] blur-3xl" />
      </motion.div>

      <motion.div style={{ y: slowY }} className="absolute inset-0">
        {wideBars.map((bar, index) => (
          <motion.div
            key={`wide-bar-${index}`}
            className="absolute rounded-full mix-blend-screen"
            style={{
              left: bar.left,
              top: bar.top,
              width: `${bar.width}px`,
              height: `${bar.height}px`,
              opacity: bar.opacity,
              filter: "blur(14px)",
              background: `linear-gradient(to bottom, transparent 0%, ${bar.color} 30%, ${bar.color} 70%, transparent 100%)`,
            }}
            animate={{
              opacity: [bar.opacity * 0.5, bar.opacity, bar.opacity * 0.55],
              scaleY: [0.94, 1.08, 0.96],
              x: [0, 8, 0],
            }}
            transition={{
              duration: bar.duration,
              delay: bar.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      <motion.div style={{ y: fastY }} className="absolute inset-0">
        {thinBars.map((bar, index) => (
          <motion.div
            key={`thin-bar-${index}`}
            className="absolute rounded-full mix-blend-screen"
            style={{
              left: bar.left,
              top: bar.top,
              width: `${bar.width}px`,
              height: `${bar.height}px`,
              opacity: bar.opacity,
              filter: "blur(8px)",
              background: `linear-gradient(to bottom, transparent 0%, ${bar.color} 28%, ${bar.color} 72%, transparent 100%)`,
            }}
            animate={{
              opacity: [bar.opacity * 0.45, bar.opacity, bar.opacity * 0.5],
              scaleY: [0.92, 1.1, 0.95],
              x: [0, -6, 0],
            }}
            transition={{
              duration: bar.duration,
              delay: bar.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,.06)_0%,rgba(0,0,0,.16)_25%,rgba(0,0,0,.5)_68%,rgba(0,0,0,.85)_100%)]" />
    </div>
  );
}

type AudienceCard = {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
};

const audienceCards: AudienceCard[] = [
  { Icon: Users, title: "Students", text: "Practice structured troubleshooting." },
  { Icon: GitBranch, title: "Teams", text: "Branch and compare operational decisions." },
  { Icon: ShieldCheck, title: "Instructors", text: "Track diagnostic thinking." },
];

type TraceFailure = {
  name: string;
  layer: string;
  point: "pc-switch" | "switch" | "router";
  severity: string;
  failPoint: string;
  accent: "red" | "yellow";
  symptom: string;
  command: string;
  fix: string;
};

const traceFailures: TraceFailure[] = [
  {
    name: "Bad Cable",
    layer: "Layer 1",
    point: "pc-switch",
    severity: "Physical link down",
    failPoint: "PC1 → SW1 link",
    accent: "red",
    symptom: "PC link light is amber. Packet never reaches SW1.",
    command: `SW1# show interfaces fa0/3 status
Port      Name       Status       Vlan
Fa0/3     PC1        notconnect   10`,
    fix: "Check patch cable, wall jack, and switch port. Replace cable or move to a known-good port.",
  },
  {
    name: "Wrong VLAN",
    layer: "Layer 2",
    point: "switch",
    severity: "Broadcast domain mismatch",
    failPoint: "SW1 access VLAN",
    accent: "yellow",
    symptom: "PC reaches the switch, but traffic is placed in the wrong broadcast domain.",
    command: `SW1# show vlan brief
VLAN Name      Status   Ports
20   GUEST     active   Fa0/3
10   USERS     active`,
    fix: "Move Fa0/3 into the correct access VLAN. Example: switchport access vlan 10.",
  },
  {
    name: "Port Security",
    layer: "Layer 2",
    point: "switch",
    severity: "Access port violation",
    failPoint: "SW1 access port",
    accent: "red",
    symptom: "SW1 learned an unexpected MAC address and disabled the access port.",
    command: `SW1# show port-security interface fa0/3
Port Security: Enabled
Port Status: Secure-shutdown
Violation Mode: Shutdown`,
    fix: "Clear the violation, verify the endpoint MAC, and re-enable the interface.",
  },
  {
    name: "Wrong Gateway",
    layer: "Layer 3",
    point: "router",
    severity: "Default route incorrect",
    failPoint: "PC1 gateway config",
    accent: "yellow",
    symptom: "PC can send traffic locally, but the default gateway is incorrect.",
    command: `PC1> ipconfig
IPv4 Address: 192.168.10.25
Subnet Mask: 255.255.255.0
Default Gateway: 192.168.20.1`,
    fix: "Correct the default gateway to the router interface for the PC subnet.",
  },
  {
    name: "ACL Block",
    layer: "Layer 3/4",
    point: "router",
    severity: "Policy deny detected",
    failPoint: "R1 ACL policy",
    accent: "yellow",
    symptom: "Packet reaches R1, then gets denied by a policy rule.",
    command: `R1# show access-lists
Extended IP access list USERS-IN
10 deny icmp any any
20 permit ip any any`,
    fix: "Review the ACL order and allow required traffic before the deny statement.",
  },
];

function SignalIcon({
  type,
  size = 20,
}: {
  type: "cable" | "terminal" | "route" | "alert";
  size?: number;
}) {
  const common: React.SVGProps<SVGSVGElement> = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (type === "cable") {
    return (
      <svg {...common}>
        <path d="M7 7l10 10" />
        <path d="M5 9l4-4" />
        <path d="M15 19l4-4" />
        <path d="M8 12l-2 2a3 3 0 0 0 4 4l2-2" />
      </svg>
    );
  }

  if (type === "terminal") {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 9l3 3-3 3M13 15h4" />
      </svg>
    );
  }

  if (type === "route") {
    return (
      <svg {...common}>
        <path d="M4 7h9a4 4 0 0 1 0 8H8" />
        <path d="M8 11l-4-4 4-4" />
        <path d="M16 13l4 4-4 4" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 3l10 18H2L12 3z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

function StatusPill({
  children,
  tone = "emerald",
}: {
  children: React.ReactNode;
  tone?: "emerald" | "yellow" | "red" | "cyan";
}) {
  const styles = {
    emerald:
      "border-emerald-300/25 bg-emerald-300/10 text-emerald-200 shadow-emerald-500/10",
    yellow:
      "border-yellow-300/25 bg-yellow-300/10 text-yellow-200 shadow-yellow-500/10",
    red: "border-red-300/25 bg-red-300/10 text-red-200 shadow-red-500/10",
    cyan: "border-cyan-300/25 bg-cyan-300/10 text-cyan-200 shadow-cyan-500/10",
  };

  return (
    <div
      className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] shadow-lg ${styles[tone]}`}
    >
      {children}
    </div>
  );
}

function TraceDeviceLabel({
  title,
  subtitle,
  active,
  warning,
}: {
  title: string;
  subtitle: string;
  active: boolean;
  warning?: boolean;
}) {
  return (
    <div className="mt-4 text-center">
      <div className="text-sm font-semibold tracking-wide text-white">{title}</div>
      <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
        {subtitle}
      </div>
      <div
        className={`mx-auto mt-2 w-fit rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${
          active
            ? warning
              ? "border-yellow-300/40 bg-yellow-300/10 text-yellow-200"
              : "border-emerald-300/40 bg-emerald-300/10 text-emerald-200"
            : "border-white/10 bg-white/[0.03] text-zinc-500"
        }`}
      >
        {active ? "Inspect" : "Online"}
      </div>
    </div>
  );
}

function TraceGlowWrap({
  active,
  warning,
  children,
}: {
  active: boolean;
  warning?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      animate={{ y: active ? -8 : 0, scale: active ? 1.025 : 1 }}
      transition={{ type: "spring", stiffness: 160, damping: 18 }}
      className="relative flex flex-col items-center"
    >
      <motion.div
        animate={{ opacity: active ? [0.25, 0.55, 0.25] : 0 }}
        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
        className={`absolute inset-0 -z-10 rounded-full blur-3xl ${
          warning ? "bg-yellow-400/25" : "bg-emerald-400/25"
        }`}
      />
      {children}
    </motion.div>
  );
}

function TracePC({ active, warning }: { active: boolean; warning?: boolean }) {
  return (
    <TraceGlowWrap active={active} warning={warning}>
      <div className="relative flex scale-90 items-end gap-4 pb-7 sm:scale-100 sm:gap-5">
        <div className="relative">
          <div className="h-28 w-16 rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-800 via-zinc-900 to-black shadow-2xl sm:h-32 sm:w-20" />
          <div className="absolute left-2 top-4 h-6 w-10 rounded-md border border-white/5 bg-black/50 sm:left-3 sm:h-7 sm:w-12" />
          <div className="absolute left-2 top-12 h-6 w-10 rounded-md border border-white/5 bg-black/50 sm:left-3 sm:top-14 sm:h-7 sm:w-12" />
          <motion.div
            animate={{ opacity: active ? [0.45, 1, 0.45] : [0.75, 1, 0.75] }}
            transition={{ repeat: Infinity, duration: active ? 0.8 : 2 }}
            className={`absolute bottom-4 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full ${
              warning
                ? "bg-yellow-300 shadow-[0_0_16px_rgba(253,224,71,.9)]"
                : "bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,.8)]"
            }`}
          />
        </div>

        <div className="relative">
          <div className="h-24 w-32 rounded-xl border border-zinc-500/40 bg-gradient-to-b from-zinc-200 to-zinc-500 p-2 shadow-2xl sm:h-28 sm:w-40">
            <div className="relative h-full w-full overflow-hidden rounded-md border border-black/10 bg-slate-200">
              <div className="absolute left-4 top-4 h-10 w-16 rounded-md bg-slate-300" />
              <div className="absolute right-4 top-5 h-10 w-10 rounded-md bg-emerald-200" />
              <motion.div
                animate={{ x: ["-120%", "120%"] }}
                transition={{ repeat: Infinity, duration: 2.8, ease: "linear" }}
                className="absolute inset-y-0 w-1/2 -skew-x-12 bg-white/25"
              />
            </div>
          </div>
          <div className="mx-auto h-5 w-6 rounded-b-sm bg-zinc-500" />
          <div className="mx-auto h-3 w-20 rounded-full bg-zinc-700 shadow-md" />
        </div>
      </div>

      <TraceDeviceLabel
        title="PC1"
        subtitle="Workstation"
        active={active}
        warning={warning}
      />
    </TraceGlowWrap>
  );
}

function TraceSwitch({
  active,
  warning,
}: {
  active: boolean;
  warning?: boolean;
}) {
  function portColor(index: number) {
    if (!active) return "bg-emerald-300";
    const alertPorts = [1, 5, 10, 15];
    return alertPorts.includes(index)
      ? warning
        ? "bg-yellow-300"
        : "bg-rose-400"
      : "bg-emerald-300";
  }

  return (
    <TraceGlowWrap active={active} warning={warning}>
      <div className="relative w-full max-w-[290px]">
        <div className="relative mx-auto h-24 w-full -skew-x-6 rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-300 via-zinc-500 to-zinc-700 shadow-2xl sm:h-28">
          <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(to_bottom,rgba(255,255,255,.22),transparent_38%,rgba(0,0,0,.2))]" />
          <div className="absolute left-5 top-4 h-2 w-20 rounded-full bg-black/20" />
          <div className="absolute left-7 top-9 grid grid-cols-8 gap-1.5 sm:gap-2">
            {Array.from({ length: 16 }).map((_, index) => (
              <motion.div
                key={index}
                animate={{
                  opacity:
                    active && [1, 5, 10, 15].includes(index)
                      ? [0.35, 1, 0.35]
                      : 1,
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.75,
                  delay: index * 0.02,
                }}
                className={`h-6 w-5 rounded-[5px] border border-black/30 shadow-inner sm:h-7 sm:w-6 ${portColor(
                  index
                )}`}
              />
            ))}
          </div>
        </div>
      </div>

      <TraceDeviceLabel
        title="SW1"
        subtitle="Access Switch"
        active={active}
        warning={warning}
      />
    </TraceGlowWrap>
  );
}

function TraceRouter({
  active,
  warning,
}: {
  active: boolean;
  warning?: boolean;
}) {
  return (
    <TraceGlowWrap active={active} warning={warning}>
      <div className="relative w-full max-w-[290px]">
        <div className="relative mx-auto h-24 w-full rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 shadow-2xl sm:h-28">
          <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(to_bottom,rgba(255,255,255,.08),transparent_35%,rgba(0,0,0,.25))]" />

          <div className="absolute left-6 top-4 space-y-1.5">
            <div className="h-1.5 w-24 rounded bg-white/10" />
            <div className="h-1.5 w-20 rounded bg-white/10" />
            <div className="h-1.5 w-14 rounded bg-white/10" />
          </div>

          <div className="absolute bottom-5 left-7 flex items-end gap-4">
            {["G0/0", "G0/1", "CON"].map((label, index) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <motion.div
                  animate={{
                    opacity: active && index === 0 ? [0.45, 1, 0.45] : 1,
                  }}
                  transition={{ repeat: Infinity, duration: 0.85 }}
                  className={`h-7 w-8 rounded border ${
                    active && index === 0
                      ? warning
                        ? "border-yellow-300/60 bg-yellow-300/40 shadow-[0_0_12px_rgba(253,224,71,.45)]"
                        : "border-red-300/60 bg-red-300/40 shadow-[0_0_12px_rgba(252,165,165,.45)]"
                      : "border-zinc-600 bg-black/70"
                  }`}
                />
                <span className="text-[9px] text-zinc-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TraceDeviceLabel
        title="R1"
        subtitle="Gateway Router"
        active={active}
        warning={warning}
      />
    </TraceGlowWrap>
  );
}

function TraceLinkLine({
  broken = false,
  warning = false,
}: {
  broken?: boolean;
  warning?: boolean;
}) {
  const line = broken
    ? "bg-red-400/85"
    : warning
    ? "bg-yellow-300/85"
    : "bg-emerald-300/75";

  return (
    <div className="relative hidden h-28 items-center justify-center lg:flex">
      <div className={`h-[3px] w-20 rounded-full xl:w-28 ${line}`} />

      {!broken && (
        <>
          <motion.div
            initial={{ x: -46 }}
            animate={{ x: 46 }}
            transition={{ repeat: Infinity, duration: 1.15, ease: "linear" }}
            className="absolute h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_22px_rgba(103,232,249,.9)]"
          />
          <motion.div
            initial={{ x: -46, opacity: 0 }}
            animate={{ x: 46, opacity: [0, 0.65, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1.15,
              ease: "linear",
              delay: 0.38,
            }}
            className="absolute h-2 w-2 rounded-full bg-emerald-200 shadow-[0_0_16px_rgba(167,243,208,.85)]"
          />
        </>
      )}

      {broken && (
        <motion.span
          animate={{ scale: [1, 1.15, 1], opacity: [0.75, 1, 0.75] }}
          transition={{ repeat: Infinity, duration: 0.9 }}
          className="absolute rounded-full bg-black/70 p-2 text-red-300 shadow-[0_0_24px_rgba(248,113,113,.45)]"
        >
          <SignalIcon type="alert" size={22} />
        </motion.span>
      )}
    </div>
  );
}

function FailureBackgroundEffects() {
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, index) => ({
        left: `${(index * 41) % 100}%`,
        top: `${(index * 29) % 100}%`,
        delay: index * 0.18,
        duration: 5 + (index % 5),
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(16,185,129,.16),transparent_34%),radial-gradient(circle_at_15%_65%,rgba(6,182,212,.1),transparent_28%),radial-gradient(circle_at_85%_55%,rgba(250,204,21,.07),transparent_24%),linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:auto,auto,auto,64px_64px,64px_64px]" />

      <motion.div
        animate={{ x: ["-20%", "120%"] }}
        transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
        className="absolute top-0 h-full w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-cyan-300/[0.035] to-transparent"
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,.45))]" />

      {particles.map((particle, index) => (
        <motion.div
          key={index}
          animate={{ y: [-18, -58], opacity: [0, 0.7, 0] }}
          transition={{
            repeat: Infinity,
            duration: particle.duration,
            delay: particle.delay,
            ease: "easeOut",
          }}
          className="absolute h-1 w-1 rounded-full bg-emerald-200/70 shadow-[0_0_10px_rgba(167,243,208,.75)]"
          style={{ left: particle.left, top: particle.top }}
        />
      ))}
    </div>
  );
}

function TelemetryStrip({ selected }: { selected: TraceFailure }) {
  const tone = selected.accent === "red" ? "text-red-200" : "text-yellow-200";
  const isAcl = selected.name === "ACL Block";
  const isPortSecurity = selected.name === "Port Security";

  const metrics: [string, string, string][] = [
    ["PING TX", "004", "text-emerald-200"],
    [
      "PING RX",
      isPortSecurity ? "003" : isAcl ? "002" : "000",
      isPortSecurity || isAcl ? "text-emerald-200" : tone,
    ],
    ["LOSS", isPortSecurity ? "001" : isAcl ? "002" : "004", tone],
    ["FAIL POINT", selected.failPoint, "text-cyan-200"],
  ];

  return (
    <div className="mx-auto mt-8 max-w-5xl">
      <div className="mb-3 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-500">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,.75)]" />
        Live test: ping gateway
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(([label, value, color]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 backdrop-blur"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
              {label}
            </div>
            <motion.div
              key={`${selected.name}-${label}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-1 font-mono text-2xl font-black ${color} ${
                label === "FAIL POINT" ? "text-base tracking-tight" : ""
              }`}
            >
              {value}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}

const signalStripWords = [
  "VLAN failures",
  "ACL blocks",
  "DNS issues",
  "Gateway errors",
  "Routing gaps",
  "NAT misconfigurations",
  "Trunk problems",
  "STP loops",
  "DHCP failures",
  "ARP issues",
  "Subnet conflicts",
  "Port security violations",
];

function SignalWordStrip() {
  const words = [...signalStripWords, ...signalStripWords, ...signalStripWords];

  return (
    <section className="bg-black px-6 pb-10 pt-0 text-white">
      <div className="mx-auto max-w-7xl border-t border-white/10 pt-8">
        <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <motion.div
            className="flex w-max items-center gap-10 whitespace-nowrap font-mono text-sm uppercase tracking-[0.22em] text-zinc-300"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 130, ease: "linear" }}
          >
            {words.map((word, index) => (
              <span key={`${word}-${index}`} className="inline-flex items-center gap-10">
                <span className="opacity-85 transition hover:text-emerald-200 hover:opacity-100">
                  {word}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/65" />
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FailureFlowSection() {
  const [selected, setSelected] = useState<TraceFailure>(traceFailures[0]);

  const pcActive = selected.point === "pc-switch";
  const switchActive = selected.point === "switch";
  const routerActive = selected.point === "router";
  const warning = selected.accent === "yellow";

  return (
    <section className="relative overflow-hidden bg-black py-16 text-white md:py-20">
      <FailureBackgroundEffects />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            className="text-xs font-bold uppercase tracking-[0.45em] text-emerald-300"
          >
            Troubleshooting signals
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: 0.08 }}
            className="mx-auto mt-8 max-w-5xl text-[clamp(2.6rem,6vw,5.8rem)] font-black leading-[1.02] tracking-tight"
          >
            Trace failures from{" "}
            <span className="text-emerald-300">workstation</span> to gateway.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: 0.16 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400"
          >
            Watch packets move through a live PC, switch, and router topology.
            Learn where traffic fails, which command proves it, and how engineers
            fix it.
          </motion.p>
        </div>

        <TelemetryStrip selected={selected} />

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {traceFailures.map((failure) => (
            <button
              key={failure.name}
              type="button"
              onClick={() => setSelected(failure)}
              className={`group rounded-full border px-5 py-3 text-xs uppercase tracking-[0.22em] transition ${
                selected.name === failure.name
                  ? failure.accent === "red"
                    ? "border-red-300 bg-red-300/10 text-red-100 shadow-[0_0_24px_rgba(248,113,113,.12)]"
                    : "border-yellow-300 bg-yellow-300/10 text-yellow-100 shadow-[0_0_24px_rgba(250,204,21,.12)]"
                  : "border-white/10 bg-white/[0.03] text-zinc-500 hover:border-emerald-300/30 hover:text-white"
              }`}
            >
              <span className="inline-block transition group-hover:-translate-y-0.5">
                {failure.name}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-14 rounded-[2rem] border border-white/10 bg-white/[0.025] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur-sm md:p-8">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <StatusPill tone="cyan">Live Packet Path</StatusPill>
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill tone={selected.accent === "red" ? "red" : "yellow"}>
                {selected.layer} issue detected
              </StatusPill>
              <StatusPill tone={selected.accent === "red" ? "red" : "yellow"}>
                {selected.severity}
              </StatusPill>
            </div>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto_1.1fr_auto_1fr]">
            <TracePC active={pcActive} warning={warning && pcActive} />
            <TraceLinkLine broken={selected.point === "pc-switch"} />
            <TraceSwitch
              active={switchActive}
              warning={warning || selected.name === "Wrong VLAN"}
            />
            <TraceLinkLine warning={selected.point === "router"} />
            <TraceRouter
              active={routerActive}
              warning={warning || selected.point === "router"}
            />
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            key={`diag-${selected.name}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/10 bg-zinc-950/75 p-6 shadow-2xl backdrop-blur"
          >
            <div className="flex items-center gap-3 text-emerald-200">
              <SignalIcon type="route" size={20} />
              <h3 className="font-bold">Current Diagnosis</h3>
            </div>
            <p className="mt-4 leading-7 text-zinc-300">{selected.symptom}</p>
            <div className="mt-5 rounded-2xl border border-emerald-300/10 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-100">
              <span className="font-bold">Fix:</span> {selected.fix}
            </div>
          </motion.div>

          <motion.div
            key={`cli-${selected.name}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/85 shadow-2xl backdrop-blur"
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-6 py-4">
              <div className="flex items-center gap-3 text-cyan-200">
                <SignalIcon type="terminal" size={20} />
                <h3 className="font-bold">CLI Evidence</h3>
              </div>
            </div>
            <pre className="overflow-x-auto bg-black/70 p-6 text-sm leading-6 text-zinc-300">
              <code>{selected.command}</code>
            </pre>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <TopAmbientStrip />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-black tracking-tight sm:text-2xl">
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

      <section className="relative flex min-h-[calc(100svh-80px)] items-center overflow-hidden py-16 lg:py-24">
        <HeroAtmosphere />
        <NeonLightField />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 lg:grid-cols-[0.92fr_1.08fr] xl:gap-16">
          <div>
            <div className="mb-6 text-sm uppercase tracking-[0.32em] text-emerald-300">
              Train like real infrastructure teams
            </div>

            <h1 className="max-w-3xl text-[clamp(3rem,7vw,6.8rem)] font-semibold leading-[0.94] tracking-tight">
              Master network failures like the engineer people rely on.
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-zinc-400 sm:text-xl">
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

      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0b0f19_0%,#111827_35%,#1f2937_65%,#0f766e_100%)] py-20 text-white md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_35%)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <h2 className="max-w-4xl text-[clamp(2.4rem,5vw,4.5rem)] font-semibold leading-tight tracking-tight text-white">
            Professional, practical, and dynamic without feeling sterile.
          </h2>

          <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-3">
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

      <SignalWordStrip />
      <FailureFlowSection />

      <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="max-w-3xl text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-tight">
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

      <section className="border-t border-white/10 px-6 py-20 text-center md:py-24">
        <Activity className="mx-auto mb-6 h-12 w-12 text-emerald-300" />
        <h2 className="text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-tight">
          Build troubleshooting confidence now.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-500 sm:text-xl">
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