"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TopologyPanel } from "@/components/lab/TopologyPanel";
import { TerminalPanel } from "@/components/lab/TerminalPanel";
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
    return "bg-green-500/15 text-green-400 border-green-500/30";
  }

  if (status === "abandoned") {
    return "bg-red-500/15 text-red-400 border-red-500/30";
  }

  return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
}

function getDifficultyStyle(difficulty: string | undefined) {
  if (difficulty === "easy") {
    return "bg-green-500/15 text-green-400 border-green-500/30";
  }

  if (difficulty === "medium") {
    return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  }

  if (difficulty === "hard") {
    return "bg-red-500/15 text-red-400 border-red-500/30";
  }

  return "bg-slate-500/15 text-slate-400 border-slate-500/30";
}

function getCategoryStyle(category: string | undefined) {
  const styles: Record<string, string> = {
    dns: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    routing: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    switching: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    subnetting: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    "default-gateway": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };

  if (!category) {
    return "bg-slate-500/15 text-slate-400 border-slate-500/30";
  }

  return (
    styles[category] ||
    "bg-slate-500/15 text-slate-400 border-slate-500/30"
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

  async function runCommand() {
    if (!session || !command.trim()) return;

    if (session.status === "completed") {
      setLogs((prev) => [
        ...prev,
        {
          deviceId,
          command,
          output: "Lab is already completed. Start a new session.",
          ok: false,
        },
      ]);
      setCommand("");
      return;
    }

    if (session.status === "abandoned") {
      setLogs((prev) => [
        ...prev,
        {
          deviceId,
          command,
          output: "This session was abandoned. Start a new session.",
          ok: false,
        },
      ]);
      setCommand("");
      return;
    }

    const submittedCommand = command;
    const result = await executeCommand(
      session.sessionId,
      deviceId,
      submittedCommand
    );

    await refreshSession(session.sessionId);

    if (result.ok === false) {
      setLogs((prev) => [
        ...prev,
        {
          deviceId,
          command: submittedCommand,
          output: result.output,
          ok: false,
        },
      ]);
    }

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
      <main className="p-8 bg-slate-950 text-white min-h-screen">
        Checking login...
      </main>
    );
  }

  if (loading) {
    return (
      <main className="p-8 bg-slate-950 text-white min-h-screen">
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
            className={`border rounded-2xl px-4 py-3 text-sm font-semibold capitalize ${getStatusStyle(
              session?.status
            )}`}
          >
            {session?.status || "loading"}
          </span>

          <span
            className={`border rounded-2xl px-4 py-3 text-sm font-semibold capitalize ${getDifficultyStyle(
              lab?.difficulty
            )}`}
          >
            {lab?.difficulty || "lab"}
          </span>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Score
            </p>
            <p className="text-sm font-bold text-white">{session?.score ?? 0}</p>
          </div>
        </>
      }
    >
      <section className="grid grid-cols-1 2xl:grid-cols-12 gap-6 items-start">
        <section className="2xl:col-span-8">
          <TopologyPanel
            deviceId={deviceId}
            setDeviceId={setDeviceId}
            devices={session?.state.devices}
            topology={lab?.topology}
            getDeviceHealth={getDeviceHealth}
          />
        </section>

        <section className="2xl:col-span-4">
          <TerminalPanel
            logs={logs}
            command={command}
            setCommand={setCommand}
            runCommand={runCommand}
            terminalRef={terminalRef}
            disabled={session?.status === "completed"}
            deviceId={deviceId}
            devices={session?.state.devices}
            cliContexts={session?.cliContexts}
            allowedCommands={lab?.interaction?.allowedCommands}
          />
        </section>

        <section className="2xl:col-span-12 grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl shadow-black/15">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-blue-400 text-sm font-semibold mb-2">
                  Mission Briefing
                </p>
                <h2 className="text-2xl font-black">Objective</h2>
              </div>

              {lab?.category && (
                <span
                  className={`border rounded-full px-3 py-1 text-xs ${getCategoryStyle(
                    lab.category
                  )}`}
                >
                  {lab.category}
                </span>
              )}
            </div>

            <p className="text-slate-300 leading-relaxed mb-6">
              {lab?.scenario.objective}
            </p>

            {lab?.scenario.observedBehavior &&
              lab.scenario.observedBehavior.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-3">
                    Observed symptoms
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {lab.scenario.observedBehavior.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {session?.status === "completed" && (
              <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-green-300">
                <p className="font-bold">Lab completed</p>
                <p className="mt-1 text-sm">{lab?.scenario.completionMessage}</p>
              </div>
            )}
          </div>

          <div className="xl:col-span-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl shadow-black/15">
            <p className="text-blue-400 text-sm font-semibold mb-2">
              Assistance
            </p>
            <h2 className="text-2xl font-black mb-4">Hint System</h2>

            <p className="text-sm text-slate-400 mb-5">
              Hints reduce your score. Use them only when you are stuck.
            </p>

            <button
              type="button"
              onClick={getHint}
              disabled={session?.status === "completed"}
              className="w-full rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 px-4 py-3 font-bold"
            >
              Get Hint
            </button>

            {hint && (
              <div className="mt-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
                {hint}
              </div>
            )}

            <button
              type="button"
              onClick={startLab}
              className="mt-4 w-full rounded-2xl border border-slate-700 bg-slate-950 hover:bg-slate-900 px-4 py-3 font-semibold text-slate-300"
            >
              Restart Lab
            </button>
          </div>
        </section>
      </section>
    </AppShell>
  );
}