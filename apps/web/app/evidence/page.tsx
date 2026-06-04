"use client";

import Link from "next/link";
import React, { useMemo, useState, useSyncExternalStore } from "react";
import AppShell from "@/components/layout/AppShell";

type EvidenceStatus = "All" | "Collected" | "Pending" | "Validated";
type EvidenceResult = "PASS" | "FAIL" | "MISMATCH" | "PENDING" | "INFO";
type IconName =
  | "activity"
  | "check"
  | "chevronRight"
  | "clock"
  | "database"
  | "file"
  | "globe"
  | "route"
  | "terminal"
  | "warning"
  | "zap";

type EvidenceItem = {
  id: string;
  ticketId: string;
  ticketSlug: string;
  ticketTitle: string;
  lab: string;
  test: string;
  command: string;
  output?: string;
  result: EvidenceResult;
  status: Exclude<EvidenceStatus, "All">;
  proves: string;
  eliminates: string;
  domain: string;
  collectedAt: string;
  icon: IconName;
  source: "saved" | "starter";
};

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

function getSavedEvidenceSnapshot() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(EVIDENCE_STORAGE_KEY) || "";
}

function getSavedEvidenceServerSnapshot() {
  return "";
}

function subscribeToSavedEvidence(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleChange = () => onStoreChange();

  window.addEventListener("storage", handleChange);
  window.addEventListener(EVIDENCE_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(EVIDENCE_CHANGE_EVENT, handleChange);
  };
}

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

const starterEvidenceItems: EvidenceItem[] = [
  {
    id: "EVD-014-01",
    ticketId: "INC-014",
    ticketSlug: "inc-014-dns-failure",
    ticketTitle: "DNS Failure — Websites Not Resolving",
    lab: "DNS Failure",
    test: "Known IP reachability",
    command: "ping 8.8.8.8",
    result: "PASS",
    status: "Collected",
    proves:
      "The endpoint can reach an external IP address, so basic IP connectivity is working.",
    eliminates:
      "This reduces suspicion on local link, default gateway, and general routing.",
    domain: "Connectivity",
    collectedAt: "Today",
    icon: "activity",
    source: "starter",
  },
  {
    id: "EVD-014-02",
    ticketId: "INC-014",
    ticketSlug: "inc-014-dns-failure",
    ticketTitle: "DNS Failure — Websites Not Resolving",
    lab: "DNS Failure",
    test: "Name resolution",
    command: "nslookup google.com",
    result: "FAIL",
    status: "Collected",
    proves: "DNS resolution is failing even though IP connectivity works.",
    eliminates: "This separates the problem from general internet reachability.",
    domain: "DNS",
    collectedAt: "Today",
    icon: "globe",
    source: "starter",
  },
  {
    id: "EVD-014-03",
    ticketId: "INC-014",
    ticketSlug: "inc-014-dns-failure",
    ticketTitle: "DNS Failure — Websites Not Resolving",
    lab: "DNS Failure",
    test: "Endpoint DNS configuration",
    command: "ipconfig /all",
    result: "MISMATCH",
    status: "Collected",
    proves: "The endpoint DNS server setting does not match the expected resolver.",
    eliminates:
      "This points to endpoint configuration instead of a complete network outage.",
    domain: "DNS",
    collectedAt: "Today",
    icon: "terminal",
    source: "starter",
  },
  {
    id: "EVD-014-04",
    ticketId: "INC-014",
    ticketSlug: "inc-014-dns-failure",
    ticketTitle: "DNS Failure — Websites Not Resolving",
    lab: "DNS Failure",
    test: "Repair validation",
    command: "nslookup google.com",
    result: "PASS",
    status: "Validated",
    proves: "After correcting DNS settings, name resolution works again.",
    eliminates: "This confirms the repair addressed the reported symptom.",
    domain: "Validation",
    collectedAt: "After fix",
    icon: "check",
    source: "starter",
  },
  {
    id: "EVD-011-01",
    ticketId: "INC-011",
    ticketSlug: "inc-011-wrong-default-gateway",
    ticketTitle: "Wrong Default Gateway",
    lab: "Wrong Default Gateway",
    test: "Gateway reachability",
    command: "ping default-gateway",
    result: "PENDING",
    status: "Pending",
    proves: "This will prove whether the endpoint can reach its local gateway.",
    eliminates:
      "If it fails, stay at endpoint configuration, VLAN, or local access path.",
    domain: "Gateway",
    collectedAt: "Not collected",
    icon: "route",
    source: "starter",
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

function resultTone(result: EvidenceResult) {
  if (result === "PASS") {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
  }

  if (result === "FAIL") {
    return "border-red-400/25 bg-red-500/10 text-red-300";
  }

  if (result === "MISMATCH") {
    return "border-amber-400/25 bg-amber-400/10 text-amber-300";
  }

  if (result === "INFO") {
    return "border-cyan-400/25 bg-cyan-400/10 text-cyan-300";
  }

  return "border-white/10 bg-white/[0.05] text-slate-400";
}

function statusTone(status: EvidenceItem["status"]) {
  if (status === "Validated") {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
  }

  if (status === "Collected") {
    return "border-cyan-400/25 bg-cyan-400/10 text-cyan-300";
  }

  return "border-white/10 bg-white/[0.05] text-slate-400";
}

function formatCollectedAt(value: string) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTicketSlugFromSavedRecord(record: SavedEvidenceRecord) {
  if (record.ticketId === "inc-014-dns-failure") {
    return "inc-014-dns-failure";
  }

  if (record.ticketId === "inc-011-wrong-default-gateway") {
    return "inc-011-wrong-default-gateway";
  }

  if (record.ticketLabel === "INC-014") {
    return "inc-014-dns-failure";
  }

  if (record.ticketLabel === "INC-011") {
    return "inc-011-wrong-default-gateway";
  }

  return "";
}

function getIconForCommand(command: string): IconName {
  const normalizedCommand = command.toLowerCase();

  if (normalizedCommand.includes("nslookup") || normalizedCommand.includes("dns")) {
    return "globe";
  }

  if (normalizedCommand.includes("ping")) {
    return "activity";
  }

  if (
    normalizedCommand.includes("ipconfig") ||
    normalizedCommand.includes("show") ||
    normalizedCommand.includes("config")
  ) {
    return "terminal";
  }

  return "file";
}

function getDomainForCommand(command: string) {
  const normalizedCommand = command.toLowerCase();

  if (normalizedCommand.includes("nslookup") || normalizedCommand.includes("dns")) {
    return "DNS";
  }

  if (normalizedCommand.includes("gateway")) {
    return "Gateway";
  }

  if (normalizedCommand.includes("ping")) {
    return "Connectivity";
  }

  if (normalizedCommand.includes("ipconfig") || normalizedCommand.includes("config")) {
    return "Configuration";
  }

  return "Observation";
}

function getProofText(record: SavedEvidenceRecord) {
  if (record.result === "PASS") {
    return "This command produced a successful result and supports the current troubleshooting direction.";
  }

  if (record.result === "FAIL") {
    return "This command failed and helps isolate where the reported symptom still exists.";
  }

  return "This command output was saved as supporting evidence for the investigation.";
}

function getEliminationText(record: SavedEvidenceRecord) {
  if (record.result === "PASS") {
    return "A successful result reduces suspicion around this specific test path.";
  }

  if (record.result === "FAIL") {
    return "A failed result keeps this area in scope for deeper investigation.";
  }

  return "Review the saved output to decide what this observation confirms or eliminates.";
}

function mapSavedEvidenceToItems(records: SavedEvidenceRecord[]): EvidenceItem[] {
  return records.map((record, index) => {
    const ticketSlug = getTicketSlugFromSavedRecord(record);
    const ticketLabel = record.ticketLabel || "Standalone Lab";

    return {
      id: `EVD-LAB-${String(records.length - index).padStart(3, "0")}`,
      ticketId: ticketLabel,
      ticketSlug,
      ticketTitle: record.ticketTitle || record.labTitle,
      lab: record.labTitle,
      test: `${record.deviceId} · Saved command output`,
      command: record.command,
      output: record.output,
      result: record.result,
      status: "Collected",
      proves: getProofText(record),
      eliminates: getEliminationText(record),
      domain: getDomainForCommand(record.command),
      collectedAt: formatCollectedAt(record.createdAt),
      icon: getIconForCommand(record.command),
      source: "saved",
    };
  });
}

function EvidenceHero({ savedCount }: { savedCount: number }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-slate-950/45 p-6 shadow-[0_16px_50px_rgba(0,0,0,.35),inset_0_1px_0_rgba(255,255,255,.04)] lg:p-7">
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_18%_0%,rgba(45,212,191,.14),transparent_30%),radial-gradient(circle_at_90%_18%,rgba(52,211,153,.08),transparent_28%)]" />
      <div className="absolute inset-0 opacity-[0.1] [background-image:linear-gradient(rgba(45,212,191,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,.16)_1px,transparent_1px)] [background-size:38px_38px]" />

      <div className="relative flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div className="max-w-4xl">
          <p className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-emerald-300">
            <Icon name="file" className="h-4 w-4" />
            Proof Notebook
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-100 lg:text-[44px]">
            Evidence is where guesses become proof.
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 lg:text-base">
            Track the commands, tests, and observations that support or eliminate
            a fault domain during ticket investigations.
          </p>
        </div>

        <div className="grid gap-2 rounded-2xl border border-white/[0.08] bg-black/25 p-4 text-xs text-slate-400 sm:grid-cols-3 xl:w-[440px]">
          {[
            ["01", "Collect", `${savedCount} saved`],
            ["02", "Explain", "State what it proves"],
            ["03", "Validate", "Confirm the fix"],
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

function EvidenceCard({ item }: { item: EvidenceItem }) {
  return (
    <article className="group rounded-3xl border border-white/[0.08] bg-slate-950/45 p-5 transition hover:border-emerald-300/30 hover:bg-emerald-300/[0.035]">
      <div className="grid gap-4 xl:grid-cols-[56px_1fr_220px_150px] xl:items-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
          <Icon name={item.icon} className="h-5 w-5" />
        </span>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-slate-500">{item.id}</span>

            {item.source === "saved" ? (
              <span className="rounded-md border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                Saved from Lab
              </span>
            ) : null}

            <span
              className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${resultTone(
                item.result,
              )}`}
            >
              {item.result}
            </span>

            <span
              className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${statusTone(
                item.status,
              )}`}
            >
              {item.status}
            </span>

            <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[11px] font-medium text-slate-300">
              {item.domain}
            </span>
          </div>

          <h2 className="mt-2 text-lg font-semibold text-slate-100">
            {item.test}
          </h2>

          <p className="mt-1 font-mono text-xs text-emerald-300">
            {item.command}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">{item.proves}</p>

          {item.output ? (
            <pre className="mt-3 max-h-28 overflow-auto rounded-xl border border-white/[0.07] bg-black/30 p-3 text-xs leading-5 text-slate-500">
              {item.output}
            </pre>
          ) : null}
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Eliminates / Reduces
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-300">
            {item.eliminates}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {item.ticketSlug ? (
            <Link
              href={`/tickets/${item.ticketSlug}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/50 bg-emerald-400/[0.06] px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/[0.12]"
            >
              Case File
              <Icon name="chevronRight" className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/labs"
              className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-400/[0.06] px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/[0.12]"
            >
              Lab Library
              <Icon name="chevronRight" className="h-4 w-4" />
            </Link>
          )}

          <span className="text-center text-[11px] text-slate-500">
            {item.ticketId} · {item.collectedAt}
          </span>
        </div>
      </div>
    </article>
  );
}

function EvidenceStats({ items }: { items: EvidenceItem[] }) {
  const collected = items.filter((item) => item.status === "Collected").length;
  const validated = items.filter((item) => item.status === "Validated").length;
  const pending = items.filter((item) => item.status === "Pending").length;
  const saved = items.filter((item) => item.source === "saved").length;

  const stats = [
    ["Collected", String(collected).padStart(2, "0")],
    ["Validated", String(validated).padStart(2, "0")],
    ["Pending", String(pending).padStart(2, "0")],
    ["Saved From Labs", String(saved).padStart(2, "0")],
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

export default function EvidencePage() {
  const [status, setStatus] = useState<EvidenceStatus>("All");

  const savedEvidenceSnapshot = useSyncExternalStore(
    subscribeToSavedEvidence,
    getSavedEvidenceSnapshot,
    getSavedEvidenceServerSnapshot,
  );

  const savedEvidence = useMemo(() => {
    try {
      const parsedRecords = savedEvidenceSnapshot
        ? JSON.parse(savedEvidenceSnapshot)
        : [];

      return Array.isArray(parsedRecords)
        ? mapSavedEvidenceToItems(parsedRecords)
        : [];
    } catch {
      return [];
    }
  }, [savedEvidenceSnapshot]);

  const allEvidence = useMemo(
    () => [...savedEvidence, ...starterEvidenceItems],
    [savedEvidence],
  );

  const visibleEvidence = useMemo(
    () =>
      allEvidence.filter(
        (item) => status === "All" || item.status === status,
      ),
    [allEvidence, status],
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-[1480px] space-y-4 p-4 lg:p-5">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.055] px-4 py-3 text-sm text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
          <span className="flex min-w-0 items-center gap-2">
            <Icon
              name="activity"
              className="h-4 w-4 shrink-0 text-emerald-300"
            />
            <span className="truncate">
              Evidence notebook loaded. Saved lab proof appears at the top of the board.
            </span>
          </span>

          <span className="hidden text-[11px] uppercase tracking-widest text-emerald-300/80 md:inline">
            Evidence
          </span>
        </div>

        <EvidenceHero savedCount={savedEvidence.length} />

        <EvidenceStats items={allEvidence} />

        <section className="rounded-3xl border border-white/[0.08] bg-slate-950/40 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-emerald-300">
                Evidence Board
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-100">
                Proof collected across investigations
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["All", "Collected", "Pending", "Validated"] as const).map(
                (tab) => (
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
                ),
              )}
            </div>
          </div>

          <div className="space-y-3">
            {visibleEvidence.length > 0 ? (
              visibleEvidence.map((item) => (
                <EvidenceCard
                  key={`${item.source}-${item.id}-${item.command}`}
                  item={item}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-6 text-sm text-slate-500">
                No evidence matches this filter.
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}