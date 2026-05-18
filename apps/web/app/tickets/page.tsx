"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";

type TicketStatus = "All" | "Active" | "New" | "Closed";
type Severity = "Low" | "Medium" | "High";
type IconName =
  | "activity"
  | "check"
  | "chevronRight"
  | "clock"
  | "file"
  | "globe"
  | "layers"
  | "network"
  | "route"
  | "terminal"
  | "warning"
  | "zap";

type Ticket = {
  id: string;
  slug: string;
  title: string;
  userReport: string;
  status: Exclude<TicketStatus, "All">;
  severity: Severity;
  domain: string;
  affected: string;
  linkedLab: string;
  labHref: string;
  nextAction: string;
  evidenceCount: number;
  icon: IconName;
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
  warning: (
    <>
      <path d="M12 3 22 20H2L12 3Z" />
      <path d="M12 9v5" />
      <path d="M12 17h.01" />
    </>
  ),
  zap: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
};

const tickets: Ticket[] = [
  {
    id: "INC-014",
    slug: "inc-014-dns-failure",
    title: "DNS Failure — Websites Not Resolving",
    userReport: "User can reach external IP addresses, but websites do not open by name.",
    status: "Active",
    severity: "Medium",
    domain: "DNS",
    affected: "PC-02",
    linkedLab: "DNS Failure",
    labHref: "/labs/dns-failure",
    nextAction: "Compare IP reachability against name resolution.",
    evidenceCount: 3,
    icon: "globe",
  },
  {
    id: "INC-011",
    slug: "inc-011-wrong-default-gateway",
    title: "Wrong Default Gateway",
    userReport: "Workstation can reach local devices but cannot reach outside networks.",
    status: "New",
    severity: "Low",
    domain: "Gateway",
    affected: "PC-01",
    linkedLab: "Wrong Default Gateway",
    labHref: "/labs/dns-failure",
    nextAction: "Verify endpoint IP, mask, and default gateway.",
    evidenceCount: 1,
    icon: "route",
  },
  {
    id: "INC-017",
    slug: "inc-017-switch-port-shutdown",
    title: "Switch Port Shutdown",
    userReport: "A wired endpoint suddenly lost network access.",
    status: "New",
    severity: "Medium",
    domain: "Switching",
    affected: "SW1 Fa0/3",
    linkedLab: "Switch Port Shutdown",
    labHref: "/labs/dns-failure",
    nextAction: "Check switchport status before moving up the OSI model.",
    evidenceCount: 0,
    icon: "layers",
  },
  {
    id: "INC-020",
    slug: "inc-020-dhcp-apipa",
    title: "DHCP / APIPA Address",
    userReport: "A host has a 169.254.x.x address and cannot reach the gateway.",
    status: "New",
    severity: "Medium",
    domain: "DHCP",
    affected: "PC-03",
    linkedLab: "DHCP / APIPA Failure",
    labHref: "/labs/dns-failure",
    nextAction: "Prove whether the client received a valid DHCP lease.",
    evidenceCount: 0,
    icon: "network",
  },
  {
    id: "INC-008",
    slug: "inc-008-router-interface-down",
    title: "Router Interface Down",
    userReport: "One subnet could not reach the rest of the network.",
    status: "Closed",
    severity: "High",
    domain: "Routing",
    affected: "R1 G0/1",
    linkedLab: "Routing Failure",
    labHref: "/labs/dns-failure",
    nextAction: "Closed after interface state was restored and validated.",
    evidenceCount: 5,
    icon: "terminal",
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

function statusTone(status: Ticket["status"]) {
  if (status === "Active") return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
  if (status === "New") return "border-cyan-400/25 bg-cyan-400/10 text-cyan-300";
  return "border-white/10 bg-white/[0.05] text-slate-400";
}

function severityTone(severity: Severity) {
  if (severity === "High") return "border-red-400/25 bg-red-500/10 text-red-300";
  if (severity === "Medium") return "border-amber-400/25 bg-amber-400/10 text-amber-300";
  return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
}

function TicketHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-slate-950/45 p-6 shadow-[0_16px_50px_rgba(0,0,0,.35),inset_0_1px_0_rgba(255,255,255,.04)] lg:p-7">
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_18%_0%,rgba(45,212,191,.14),transparent_30%),radial-gradient(circle_at_90%_18%,rgba(52,211,153,.08),transparent_28%)]" />
      <div className="absolute inset-0 opacity-[0.1] [background-image:linear-gradient(rgba(45,212,191,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,.16)_1px,transparent_1px)] [background-size:38px_38px]" />

      <div className="relative flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div className="max-w-4xl">
          <p className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-emerald-300">
            <Icon name="warning" className="h-4 w-4" />
            Incident Queue
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-100 lg:text-[44px]">
            Tickets are case files. Labs are where you investigate.
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 lg:text-base">
            Pick an incident, read the user report, review the expected evidence,
            then launch the linked simulator only when you are ready to investigate.
          </p>
        </div>

        <div className="grid gap-2 rounded-2xl border border-white/[0.08] bg-black/25 p-4 text-xs text-slate-400 sm:grid-cols-3 xl:w-[440px]">
          {[
            ["01", "Triage", "Read the report"],
            ["02", "Plan", "Choose evidence"],
            ["03", "Investigate", "Open linked lab"],
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

function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <article className="group rounded-3xl border border-white/[0.08] bg-slate-950/45 p-5 transition hover:border-emerald-300/30 hover:bg-emerald-300/[0.035]">
      <div className="grid gap-4 xl:grid-cols-[56px_1fr_240px_150px] xl:items-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
          <Icon name={ticket.icon} className="h-5 w-5" />
        </span>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-slate-500">{ticket.id}</span>
            <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${statusTone(ticket.status)}`}>
              {ticket.status}
            </span>
            <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${severityTone(ticket.severity)}`}>
              {ticket.severity}
            </span>
          </div>

          <h2 className="mt-2 text-lg font-semibold text-slate-100">
            {ticket.title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {ticket.userReport}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Next Action
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-300">
            {ticket.nextAction}
          </p>
        </div>

        <Link
          href={`/tickets/${ticket.slug}`}
          className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/50 bg-emerald-400/[0.06] px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/[0.12]"
        >
          Open Case
          <Icon name="chevronRight" className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export default function TicketsPage() {
  const [status, setStatus] = useState<TicketStatus>("All");

  const visibleTickets = useMemo(
    () => tickets.filter((ticket) => status === "All" || ticket.status === status),
    [status],
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-[1480px] space-y-4 p-4 lg:p-5">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.055] px-4 py-3 text-sm text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
          <span className="flex min-w-0 items-center gap-2">
            <Icon name="activity" className="h-4 w-4 shrink-0 text-emerald-300" />
            <span className="truncate">
              Ticket queue loaded. Select a case file before launching the linked simulator.
            </span>
          </span>

          <span className="hidden text-[11px] uppercase tracking-widest text-emerald-300/80 md:inline">
            Tickets
          </span>
        </div>

        <TicketHero />

        <section className="rounded-3xl border border-white/[0.08] bg-slate-950/40 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-emerald-300">
                Incident Board
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-100">
                Assigned case files
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["All", "Active", "New", "Closed"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatus(tab)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    status === tab
                      ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-200"
                      : "border-white/[0.08] bg-white/[0.035] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {visibleTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}