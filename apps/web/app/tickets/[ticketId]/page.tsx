"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useMemo, useSyncExternalStore } from "react";
import AppShell from "@/components/layout/AppShell";

type SavedEvidenceRecord = {
  id: string;
  ticketId: string | null;
  ticketLabel: string;
  ticketTitle: string;
  labSlug: string;
  labTitle: string;
  sessionId: string;
  deviceId: string;
  command: string;
  output: string;
  result: "PASS" | "FAIL" | "INFO";
  createdAt: string;
};

const EVIDENCE_STORAGE_KEY = "netlabs-evidence-records";
const EVIDENCE_CHANGE_EVENT = "netlabs-evidence-records-change";

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

function getEvidenceSnapshot() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(EVIDENCE_STORAGE_KEY) || "";
}

function getEvidenceServerSnapshot() {
  return "";
}

function subscribeToEvidence(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleChange = () => onStoreChange();

  window.addEventListener("storage", handleChange);
  window.addEventListener(EVIDENCE_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(EVIDENCE_CHANGE_EVENT, handleChange);
  };
}

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

function resultTone(result: SavedEvidenceRecord["result"]) {
  if (result === "PASS") {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
  }

  if (result === "FAIL") {
    return "border-red-400/25 bg-red-500/10 text-red-300";
  }

  return "border-cyan-400/25 bg-cyan-400/10 text-cyan-300";
}

function formatEvidenceTime(value: string) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Saved evidence";
  }

  return parsedDate.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseSavedEvidence(snapshot: string): SavedEvidenceRecord[] {
  try {
    const parsed = snapshot ? JSON.parse(snapshot) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function CollectedEvidence({
  ticketId,
  ticketLabel,
}: {
  ticketId: string;
  ticketLabel: string;
}) {
  const evidenceSnapshot = useSyncExternalStore(
    subscribeToEvidence,
    getEvidenceSnapshot,
    getEvidenceServerSnapshot,
  );

  const collectedEvidence = useMemo(() => {
    return parseSavedEvidence(evidenceSnapshot).filter(
      (record) =>
        record.ticketId === ticketId ||
        record.ticketLabel === ticketLabel ||
        record.ticketLabel === ticketId,
    );
  }, [evidenceSnapshot, ticketId, ticketLabel]);

  return (
    <section className="rounded-3xl border border-white/[0.08] bg-slate-950/45 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-emerald-300">
            Collected Evidence
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-100">
            Proof saved during this investigation
          </h2>
        </div>

        <Link
          href="/evidence"
          className="rounded-xl border border-emerald-400/35 bg-emerald-400/[0.06] px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/[0.12]"
        >
          Open Evidence
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {collectedEvidence.length > 0 ? (
          collectedEvidence.map((record) => (
            <article
              key={record.id}
              className="rounded-2xl border border-white/[0.07] bg-black/25 p-4"
            >
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 font-mono text-[11px] text-slate-400">
                      {record.deviceId}
                    </span>

                    <span
                      className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${resultTone(
                        record.result,
                      )}`}
                    >
                      {record.result}
                    </span>

                    <span className="rounded-md border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.5 text-[11px] font-medium text-cyan-300">
                      Saved From Lab
                    </span>
                  </div>

                  <p className="mt-3 font-mono text-sm text-emerald-300">
                    {record.command}
                  </p>

                  <pre className="mt-3 max-h-32 overflow-auto rounded-xl border border-white/[0.07] bg-black/35 p-3 text-xs leading-5 text-slate-500">
                    {record.output}
                  </pre>
                </div>

                <div className="shrink-0 text-left md:text-right">
                  <p className="text-xs text-slate-500">Collected</p>
                  <p className="mt-1 text-sm text-slate-300">
                    {formatEvidenceTime(record.createdAt)}
                  </p>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-5 text-sm leading-6 text-slate-500">
            No saved evidence for this case yet. Start the investigation, run
            diagnostic commands, then save important outputs as proof.
          </div>
        )}
      </div>
    </section>
  );
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
          <div className="space-y-4">
            <CollectedEvidence ticketId={ticketId} ticketLabel={ticket.id} />

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
          </div>

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