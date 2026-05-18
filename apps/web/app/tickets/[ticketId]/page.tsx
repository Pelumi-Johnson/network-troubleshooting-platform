"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";
import AppShell from "@/components/layout/AppShell";

const tickets = {
  "inc-014-dns-failure": {
    id: "INC-014",
    title: "DNS Failure — Websites Not Resolving",
    status: "Active",
    severity: "Medium",
    domain: "DNS",
    affected: "PC-02",
    linkedLab: "DNS Failure",
    labHref: "/labs/dns-failure?ticket=inc-014-dns-failure",
    userReport:
      "User can reach external IP addresses, but websites do not open by name.",
    businessImpact:
      "Single workstation affected. Web-based tools are unavailable for the user, but general IP connectivity appears healthy.",
    nextAction:
      "Compare IP reachability against name resolution. Do not change DNS until you prove the failure.",
    expectedEvidence: [
      ["Ping known IP", "Proves basic IP connectivity and gateway/routing path."],
      ["Ping domain name", "Shows whether name-based access fails."],
      ["nslookup", "Directly tests DNS resolution behavior."],
      ["ipconfig /all", "Confirms endpoint IP, gateway, and DNS server configuration."],
    ],
    investigationRules: [
      "Do not assume DNS just because websites fail.",
      "Prove IP connectivity first.",
      "Compare IP test against name test.",
      "Validate the repair with a name lookup and browser-style test.",
    ],
  },
  "inc-011-wrong-default-gateway": {
    id: "INC-011",
    title: "Wrong Default Gateway",
    status: "New",
    severity: "Low",
    domain: "Gateway",
    affected: "PC-01",
    linkedLab: "Wrong Default Gateway",
    labHref: "/labs/dns-failure?ticket=inc-011-wrong-default-gateway",
    userReport:
      "Workstation can reach local devices but cannot reach outside networks.",
    businessImpact:
      "One workstation cannot access off-subnet resources. Local connectivity appears available.",
    nextAction:
      "Verify endpoint IP, subnet mask, and default gateway before testing DNS or services.",
    expectedEvidence: [
      ["ipconfig", "Shows endpoint address, mask, and configured gateway."],
      ["Ping gateway", "Proves whether the local default gateway is reachable."],
      ["Ping external IP", "Shows whether routed connectivity works."],
    ],
    investigationRules: [
      "Stay at endpoint and gateway evidence first.",
      "Do not troubleshoot DNS until external IP reachability is proven.",
      "Validate with gateway ping and off-subnet ping.",
    ],
  },
} as const;

function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "green" | "cyan" | "amber" | "red" | "slate";
}) {
  const styles = {
    green: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    cyan: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
    amber: "border-amber-400/25 bg-amber-400/10 text-amber-300",
    red: "border-red-400/25 bg-red-500/10 text-red-300",
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

function severityTone(severity: string) {
  if (severity === "High") return "red";
  if (severity === "Medium") return "amber";
  return "green";
}

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = String(params.ticketId);
  const ticket = tickets[ticketId as keyof typeof tickets];

  if (!ticket) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[1480px] p-4 lg:p-5">
          <div className="rounded-3xl border border-red-500/30 bg-red-950/40 p-8 text-red-200">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-300">
              Ticket not found
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-white">
              This case file does not exist yet.
            </h1>
            <Link
              href="/tickets"
              className="mt-6 inline-flex rounded-xl border border-red-300/30 bg-red-300/10 px-5 py-3 text-sm font-semibold text-red-100"
            >
              Back to tickets
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1480px] space-y-4 p-4 lg:p-5">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.055] px-4 py-3 text-sm text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
          <span className="truncate">
            Case file opened. Review the report, plan your evidence, then start the investigation.
          </span>
          <Link
            href="/tickets"
            className="hidden text-[11px] font-bold uppercase tracking-widest text-emerald-300/80 md:inline"
          >
            Back to Tickets
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-slate-950/45 p-6 shadow-[0_16px_50px_rgba(0,0,0,.35),inset_0_1px_0_rgba(255,255,255,.04)] lg:p-7">
          <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_18%_0%,rgba(45,212,191,.14),transparent_30%),radial-gradient(circle_at_90%_18%,rgba(52,211,153,.08),transparent_28%)]" />

          <div className="relative grid gap-6 xl:grid-cols-[1fr_360px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-slate-500">
                  {ticket.id}
                </span>
                <Badge tone="green">{ticket.status}</Badge>
                <Badge tone={severityTone(ticket.severity)}>
                  {ticket.severity}
                </Badge>
                <Badge tone="cyan">{ticket.domain}</Badge>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-100 lg:text-[44px]">
                {ticket.title}
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 lg:text-base">
                {ticket.userReport}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-300/18 bg-emerald-300/[0.055] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                Linked Simulator
              </p>

              <h3 className="mt-3 text-xl font-semibold text-slate-100">
                {ticket.linkedLab}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Launch the simulator when you are ready to investigate this case.
              </p>

              <Link
                href={ticket.labHref}
                className="mt-5 flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_28px_rgba(52,211,153,.18)]"
              >
                Start Investigation
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
          <section className="rounded-3xl border border-white/[0.08] bg-slate-950/45 p-5">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-emerald-300">
              Evidence Plan
            </p>

            <div className="mt-4 space-y-3">
              {ticket.expectedEvidence.map(([test, meaning]) => (
                <div
                  key={test}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
                >
                  <h3 className="text-sm font-semibold text-slate-100">
                    {test}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {meaning}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-3xl border border-white/[0.08] bg-slate-950/45 p-5">
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-emerald-300">
                Case Summary
              </p>

              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                  <p className="text-xs text-slate-500">Affected</p>
                  <p className="mt-1 text-slate-200">{ticket.affected}</p>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                  <p className="text-xs text-slate-500">Business Impact</p>
                  <p className="mt-1 leading-6 text-slate-300">
                    {ticket.businessImpact}
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                  <p className="text-xs text-slate-500">Next Action</p>
                  <p className="mt-1 leading-6 text-slate-300">
                    {ticket.nextAction}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.045] p-5">
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-cyan-300">
                Investigation Rules
              </p>

              <div className="mt-4 space-y-2">
                {ticket.investigationRules.map((rule, index) => (
                  <div
                    key={rule}
                    className="flex gap-3 rounded-xl border border-white/[0.07] bg-black/25 p-3 text-sm text-slate-300"
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-cyan-300/35 bg-cyan-300/10 text-[11px] font-bold text-cyan-200">
                      {index + 1}
                    </span>
                    {rule}
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}