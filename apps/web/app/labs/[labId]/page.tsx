"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { TopologyPanel } from "@/components/lab/TopologyPanel";
import { DeviceWorkspacePanel } from "@/components/lab/DeviceWorkspacePanel";
import { LearningCoachPanel } from "@/components/lab/LearningCoachPanel";
import { getLabBySlug, startLabSession } from "@/lib/api/labsApi";
import {
  executeCommand,
  getLabSession,
  requestHint,
} from "@/lib/api/labSessionsApi";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";

type DeviceType = "pc" | "switch" | "router";

type DeviceState = {
  type: DeviceType;
  network?: {
    ip: string;
    mask: string;
    gateway: string;
    dns?: string;
  };
  interfaces?: Record<
    string,
    {
      ip?: string;
      mask?: string;
      status: "up" | "down";
      vlan?: string;
    }
  >;
  ports?: Record<
    string,
    {
      status: "up" | "down";
    }
  >;
};

type CliMode = "user" | "privileged" | "global_config" | "interface_config";

type CliContext = {
  mode: CliMode;
  interfaceName?: string | null;
};

type SuccessRule = {
  type: "fieldEquals";
  deviceId: string;
  path: string;
  value: string | number | boolean;
};

type TopologyDevice = {
  id: string;
  label: string;
  type: DeviceType;
  position: {
    x: number;
    y: number;
  };
};

type TopologyLink = {
  id: string;
  from: string;
  to: string;
};

type Lab = {
  id: string;
  slug: string;
  title: string;
  category?: string;
  difficulty?: string;
  estimatedMinutes?: number;
  scenario: {
    summary: string;
    objective: string;
    completionMessage: string;
    observedBehavior?: string[];
  };
  topology?: {
    devices: TopologyDevice[];
    links: TopologyLink[];
  };
  interaction?: {
    allowedCommands?: Partial<Record<DeviceType, string[]>>;
  };
  successConditions?: {
    mode: "all" | "any";
    rules: SuccessRule[];
  };
};

type CommandLog = {
  deviceId: string;
  command: string;
  output: string;
  ok?: boolean;
};

type LabSession = {
  sessionId: string;
  labId: string;
  labSlug: string;
  status: string;
  score: number;
  hintsUsed: number;
  state: {
    devices: Record<string, DeviceState>;
  };
  cliContexts?: Record<string, CliContext>;
  commandHistory?: CommandLog[];
};

function getValueAtPath(source: unknown, path: string): unknown {
  const pathParts = path.split(".");
  let currentValue: unknown = source;

  for (const part of pathParts) {
    if (
      currentValue === null ||
      typeof currentValue !== "object" ||
      !(part in currentValue)
    ) {
      return undefined;
    }

    currentValue = (currentValue as Record<string, unknown>)[part];
  }

  return currentValue;
}

function isRuleSatisfied(device: DeviceState | undefined, rule: SuccessRule) {
  if (!device) return false;

  if (rule.type === "fieldEquals") {
    return getValueAtPath(device, rule.path) === rule.value;
  }

  return false;
}

function getStatusStyle(status: string | undefined) {
  if (status === "completed") {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
  }

  if (status === "abandoned") {
    return "border-red-400/25 bg-red-500/10 text-red-300";
  }

  return "border-yellow-400/25 bg-yellow-400/10 text-yellow-300";
}

function getDifficultyStyle(difficulty: string | undefined) {
  if (difficulty === "easy") {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
  }

  if (difficulty === "medium") {
    return "border-yellow-400/25 bg-yellow-400/10 text-yellow-300";
  }

  if (difficulty === "hard") {
    return "border-red-400/25 bg-red-500/10 text-red-300";
  }

  return "border-white/10 bg-white/[0.05] text-slate-300";
}

function getLogsFromSession(sessionData: LabSession): CommandLog[] {
  return (sessionData.commandHistory || []).map((log) => ({
    deviceId: log.deviceId,
    command: log.command,
    output: log.output,
    ok: log.ok,
  }));
}

function LoadingState({ message }: { message: string }) {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1480px] p-4 lg:p-5">
        <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-8 text-slate-400 shadow-[0_24px_90px_rgba(0,0,0,.35)]">
          {message}
        </div>
      </div>
    </AppShell>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1480px] p-4 lg:p-5">
        <div className="rounded-3xl border border-red-500/30 bg-red-950/40 p-8 text-red-300 shadow-[0_24px_90px_rgba(0,0,0,.35)]">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-300">
            Lab failed to load
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-white">
            Simulator could not start this lab.
          </h1>
          <p className="mt-2 text-sm leading-6 text-red-200/80">{message}</p>

          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-6 rounded-xl border border-red-300/30 bg-red-300/10 px-5 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-300/15"
            >
              Retry Lab Load
            </button>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}

function LabNotice({
  status,
  difficulty,
  score,
}: {
  status?: string;
  difficulty?: string;
  score?: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`rounded-xl border px-3 py-2 text-xs font-semibold capitalize ${getStatusStyle(
          status,
        )}`}
      >
        {status || "loading"}
      </span>

      <span
        className={`rounded-xl border px-3 py-2 text-xs font-semibold capitalize ${getDifficultyStyle(
          difficulty,
        )}`}
      >
        {difficulty || "lab"}
      </span>

      <span className="rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-semibold text-slate-300">
        Score {score ?? 0}
      </span>
    </div>
  );
}

function MissionBriefing({
  lab,
  session,
  hint,
  getHint,
  startLab,
}: {
  lab: Lab | null;
  session: LabSession | null;
  hint: string;
  getHint: () => void;
  startLab: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="border-b border-white/10 bg-black/30 px-6 py-5">
        <p className="mb-2 text-sm font-semibold text-emerald-300">
          Mission Briefing
        </p>
        <h2 className="text-2xl font-black text-white">
          Objective & Symptoms
        </h2>
      </div>

      <div className="space-y-6 p-6">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
            Objective
          </p>
          <p className="leading-relaxed text-zinc-300">
            {lab?.scenario.objective}
          </p>
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
            Observed symptoms
          </p>

          <div className="space-y-3">
            {(lab?.scenario.observedBehavior || []).length > 0 ? (
              lab?.scenario.observedBehavior?.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-zinc-300"
                >
                  {item}
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">
                No observed symptoms were provided for this lab.
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
            Hint system
          </p>

          <button
            type="button"
            onClick={getHint}
            disabled={session?.status === "completed"}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-3 font-bold text-slate-950 transition hover:brightness-110 disabled:bg-slate-800 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500"
          >
            Get Hint
          </button>

          {hint ? (
            <div className="mt-4 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm text-yellow-200">
              {hint}
            </div>
          ) : null}
        </div>

        {session?.status === "completed" ? (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-300">
            <p className="font-bold">Lab completed</p>
            <p className="mt-1 text-sm">{lab?.scenario.completionMessage}</p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={startLab}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold text-zinc-300 transition hover:bg-white/[0.08]"
        >
          Restart Lab
        </button>
      </div>
    </div>
  );
}

export default function LabPage() {
  const { checkingAuth } = useRequireAuth();

  const params = useParams();
  const labSlug = String(params.labId);
  const storageKey = `active-session-${labSlug}`;

  const [lab, setLab] = useState<Lab | null>(null);
  const [session, setSession] = useState<LabSession | null>(null);
  const [deviceId, setDeviceId] = useState("pc1");
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState<CommandLog[]>([]);
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const terminalRef = useRef<HTMLDivElement | null>(null);

  async function createNewSession(slug: string): Promise<LabSession> {
    const newSession = (await startLabSession(slug)) as LabSession;
    localStorage.setItem(storageKey, newSession.sessionId);
    return newSession;
  }

  async function loadLabSession(slug: string, forceNew = false) {
    setLoading(true);
    setLoadError("");
    setHint("");
    setCommand("");
    setDeviceId("pc1");

    try {
      const labData = (await getLabBySlug(slug)) as Lab;

      if (forceNew) {
        const newSession = await createNewSession(slug);
        setLab(labData);
        setSession(newSession);
        setLogs(getLogsFromSession(newSession));
        return;
      }

      const savedSessionId = localStorage.getItem(storageKey);

      if (savedSessionId) {
        try {
          const savedSession = (await getLabSession(savedSessionId)) as LabSession;

          if (
            savedSession.labSlug === slug &&
            savedSession.status !== "abandoned"
          ) {
            setLab(labData);
            setSession(savedSession);
            setLogs(getLogsFromSession(savedSession));
            return;
          }

          localStorage.removeItem(storageKey);
        } catch {
          localStorage.removeItem(storageKey);
        }
      }

      const newSession = await createNewSession(slug);
      setLab(labData);
      setSession(newSession);
      setLogs(getLogsFromSession(newSession));
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load lab session.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (checkingAuth) return;

    let cancelled = false;

    async function loadInitialLab() {
      setLoading(true);
      setLoadError("");

      try {
        const labData = (await getLabBySlug(labSlug)) as Lab;
        const savedSessionId = localStorage.getItem(storageKey);

        if (savedSessionId) {
          try {
            const savedSession = (await getLabSession(savedSessionId)) as LabSession;

            if (cancelled) return;

            if (
              savedSession.labSlug === labSlug &&
              savedSession.status !== "abandoned"
            ) {
              setLab(labData);
              setSession(savedSession);
              setLogs(getLogsFromSession(savedSession));
              setLoading(false);
              return;
            }

            localStorage.removeItem(storageKey);
          } catch {
            localStorage.removeItem(storageKey);
          }
        }

        const newSession = (await startLabSession(labSlug)) as LabSession;
        localStorage.setItem(storageKey, newSession.sessionId);

        if (cancelled) return;

        setLab(labData);
        setSession(newSession);
        setLogs(getLogsFromSession(newSession));
        setLoading(false);
      } catch (err) {
        if (cancelled) return;

        setLoadError(
          err instanceof Error ? err.message : "Failed to load lab session.",
        );
        setLoading(false);
      }
    }

    loadInitialLab();

    return () => {
      cancelled = true;
    };
  }, [labSlug, storageKey, checkingAuth]);

  useEffect(() => {
    terminalRef.current?.scrollTo({
      top: terminalRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [logs, deviceId]);

  async function startLab() {
    localStorage.removeItem(storageKey);
    await loadLabSession(labSlug, true);
  }

  async function refreshSession(sessionId: string): Promise<LabSession> {
    const updatedSession = (await getLabSession(sessionId)) as LabSession;
    setSession(updatedSession);
    setLogs(getLogsFromSession(updatedSession));
    return updatedSession;
  }

  async function runRawCommand(rawCommand: string) {
    if (!session || !rawCommand.trim()) return;

    if (session.status === "completed") {
      setLogs((prev) => [
        ...prev,
        {
          deviceId,
          command: rawCommand,
          output: "Lab is already completed. Start a new session.",
          ok: false,
        },
      ]);
      return;
    }

    if (session.status === "abandoned") {
      setLogs((prev) => [
        ...prev,
        {
          deviceId,
          command: rawCommand,
          output: "This session was abandoned. Start a new session.",
          ok: false,
        },
      ]);
      return;
    }

    try {
      const result = await executeCommand(session.sessionId, deviceId, rawCommand);
      await refreshSession(session.sessionId);

      if (result.ok === false) {
        setLogs((prev) => [
          ...prev,
          {
            deviceId,
            command: rawCommand,
            output: result.output,
            ok: false,
          },
        ]);
      }
    } catch (err) {
      setLogs((prev) => [
        ...prev,
        {
          deviceId,
          command: rawCommand,
          output:
            err instanceof Error
              ? err.message
              : "Command failed. Check backend connection.",
          ok: false,
        },
      ]);
    }
  }

  async function runCommand() {
    if (!command.trim()) return;

    const submittedCommand = command;
    await runRawCommand(submittedCommand);
    setCommand("");
  }

  async function getHint() {
    if (!session) return;

    try {
      const result = await requestHint(session.sessionId);

      if (result.ok) {
        setHint(result.text);
        await refreshSession(session.sessionId);
      } else {
        setHint(result.message);
      }
    } catch (err) {
      setHint(err instanceof Error ? err.message : "Failed to request hint.");
    }
  }

  function getDeviceHealth(deviceIdToCheck: string) {
    const device = session?.state?.devices?.[deviceIdToCheck];

    if (!device) return "hidden";

    const rules = lab?.successConditions?.rules || [];
    const rulesForDevice = rules.filter(
      (rule) => rule.deviceId === deviceIdToCheck,
    );

    if (rulesForDevice.length === 0) {
      return "normal";
    }

    const allDeviceRulesSatisfied = rulesForDevice.every((rule) =>
      isRuleSatisfied(device, rule),
    );

    return allDeviceRulesSatisfied ? "fixed" : "broken";
  }

  if (checkingAuth) {
    return <LoadingState message="Checking login..." />;
  }

  if (loading) {
    return <LoadingState message="Loading lab..." />;
  }

  if (loadError) {
    return (
      <ErrorState
        message={loadError}
        onRetry={() => {
          void loadLabSession(labSlug);
        }}
      />
    );
  }

  return (
    <AppShell
      title={lab?.title || "Lab Simulator"}
      subtitle={lab?.scenario.summary || "Troubleshoot the network fault."}
      actions={
        <LabNotice
          status={session?.status}
          difficulty={lab?.difficulty}
          score={session?.score}
        />
      }
    >
      <div className="mx-auto max-w-[1480px] p-4 lg:p-5">
        <section className="grid grid-cols-1 items-stretch gap-6 2xl:grid-cols-12">
          <section className="h-full 2xl:col-span-8">
            <TopologyPanel
              deviceId={deviceId}
              setDeviceId={setDeviceId}
              devices={session?.state.devices}
              topology={lab?.topology}
              getDeviceHealth={getDeviceHealth}
            />
          </section>

          <section className="h-full 2xl:col-span-4">
            <DeviceWorkspacePanel
              logs={logs}
              command={command}
              setCommand={setCommand}
              runCommand={runCommand}
              runRawCommand={runRawCommand}
              terminalRef={terminalRef}
              disabled={session?.status === "completed"}
              deviceId={deviceId}
              devices={session?.state.devices}
              cliContexts={session?.cliContexts}
              allowedCommands={lab?.interaction?.allowedCommands}
            />
          </section>
        </section>

        <section className="mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
          <div className="xl:col-span-4">
            <MissionBriefing
              lab={lab}
              session={session}
              hint={hint}
              getHint={getHint}
              startLab={startLab}
            />
          </div>

          <div className="xl:col-span-8">
            <LearningCoachPanel category={lab?.category} title={lab?.title} />
          </div>
        </section>
      </div>
    </AppShell>
  );
}