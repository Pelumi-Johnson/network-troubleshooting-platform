"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TopologyPanel } from "@/components/lab/TopologyPanel";
import { DeviceWorkspacePanel } from "@/components/lab/DeviceWorkspacePanel";
import { LearningCoachPanel } from "@/components/lab/LearningCoachPanel";
import { BrandBackground } from "@/components/ui/BrandSurfaces";
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
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  }

  if (status === "abandoned") {
    return "bg-red-500/15 text-red-300 border-red-500/30";
  }

  return "bg-yellow-500/15 text-yellow-300 border-yellow-500/30";
}

function getDifficultyStyle(difficulty: string | undefined) {
  if (difficulty === "easy") {
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  }

  if (difficulty === "medium") {
    return "bg-yellow-500/15 text-yellow-300 border-yellow-500/30";
  }

  if (difficulty === "hard") {
    return "bg-red-500/15 text-red-300 border-red-500/30";
  }

  return "bg-white/5 text-zinc-300 border-white/10";
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

  const terminalRef = useRef<HTMLDivElement | null>(null);

  function getLogsFromSession(sessionData: LabSession): CommandLog[] {
    return (sessionData.commandHistory || []).map((log) => ({
      deviceId: log.deviceId,
      command: log.command,
      output: log.output,
      ok: log.ok,
    }));
  }

  async function createNewSession(slug: string): Promise<LabSession> {
    const newSession = (await startLabSession(slug)) as LabSession;
    localStorage.setItem(storageKey, newSession.sessionId);
    return newSession;
  }

  async function loadLabSession(slug: string, forceNew = false) {
    setLoading(true);
    setHint("");
    setCommand("");
    setDeviceId("pc1");

    const labData = (await getLabBySlug(slug)) as Lab;

    if (forceNew) {
      const newSession = await createNewSession(slug);
      setLab(labData);
      setSession(newSession);
      setLogs(getLogsFromSession(newSession));
      setLoading(false);
      return;
    }

    const savedSessionId = localStorage.getItem(storageKey);

    if (savedSessionId) {
      try {
        const savedSession = (await getLabSession(savedSessionId)) as LabSession;

        if (savedSession.labSlug === slug && savedSession.status !== "abandoned") {
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

    const newSession = await createNewSession(slug);
    setLab(labData);
    setSession(newSession);
    setLogs(getLogsFromSession(newSession));
    setLoading(false);
  }

  useEffect(() => {
    if (checkingAuth) return;

    let cancelled = false;

    async function loadInitialLab() {
      setLoading(true);

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
  }

  async function runCommand() {
    if (!command.trim()) return;

    const submittedCommand = command;
    await runRawCommand(submittedCommand);
    setCommand("");
  }

  async function getHint() {
    if (!session) return;

    const result = await requestHint(session.sessionId);

    if (result.ok) {
      setHint(result.text);
      await refreshSession(session.sessionId);
    } else {
      setHint(result.message);
    }
  }

  function getDeviceHealth(deviceIdToCheck: string) {
    const device = session?.state?.devices?.[deviceIdToCheck];

    if (!device) return "hidden";

    const rules = lab?.successConditions?.rules || [];
    const rulesForDevice = rules.filter(
      (rule) => rule.deviceId === deviceIdToCheck
    );

    if (rulesForDevice.length === 0) {
      return "normal";
    }

    const allDeviceRulesSatisfied = rulesForDevice.every((rule) =>
      isRuleSatisfied(device, rule)
    );

    return allDeviceRulesSatisfied ? "fixed" : "broken";
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <BrandBackground />
        Checking login...
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <BrandBackground />
        Loading lab...
      </main>
    );
  }

  return (
    <AppShell
      title={lab?.title || "Lab Simulator"}
      subtitle={lab?.scenario.summary || "Troubleshoot the network fault."}
      actions={
        <>
          <span
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold capitalize ${getStatusStyle(
              session?.status
            )}`}
          >
            {session?.status || "loading"}
          </span>

          <span
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold capitalize ${getDifficultyStyle(
              lab?.difficulty
            )}`}
          >
            {lab?.difficulty || "lab"}
          </span>

          <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              Score
            </p>
            <p className="text-sm font-bold text-white">{session?.score ?? 0}</p>
          </div>
        </>
      }
    >
      <BrandBackground />

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
        <div className="xl:col-span-4 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="border-b border-white/10 bg-black/30 px-6 py-5">
            <p className="mb-2 text-sm font-semibold text-emerald-300">
              Mission Briefing
            </p>
            <h2 className="text-2xl font-black">Objective & Symptoms</h2>
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
                className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-bold text-black transition hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500"
              >
                Get Hint
              </button>

              {hint && (
                <div className="mt-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
                  {hint}
                </div>
              )}
            </div>

            {session?.status === "completed" && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
                <p className="font-bold">Lab completed</p>
                <p className="mt-1 text-sm">{lab?.scenario.completionMessage}</p>
              </div>
            )}

            <button
              type="button"
              onClick={startLab}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold text-zinc-300 transition hover:bg-white/[0.08]"
            >
              Restart Lab
            </button>
          </div>
        </div>

        <div className="xl:col-span-8">
          <LearningCoachPanel category={lab?.category} title={lab?.title} />
        </div>
      </section>
    </AppShell>
  );
}