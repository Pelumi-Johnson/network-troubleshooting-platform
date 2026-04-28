"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { InstructionsPanel } from "@/components/lab/InstructionsPanel";
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
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-slate-800 bg-slate-950/95">
        <div className="px-6 py-5">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 text-sm mb-3">
                <Link
                  href="/dashboard"
                  className="text-slate-400 hover:text-white transition"
                >
                  Dashboard
                </Link>
                <span className="text-slate-700">/</span>
                <span className="text-slate-300">Lab Simulator</span>
              </div>

              <h1 className="text-3xl font-black tracking-tight">
                {lab?.title}
              </h1>

              <p className="text-slate-400 mt-2 max-w-3xl">
                {lab?.scenario.summary}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-3">
              <span
                className={`border rounded-xl px-4 py-2 text-sm font-semibold capitalize ${getStatusStyle(
                  session?.status
                )}`}
              >
                {session?.status || "loading"}
              </span>

              <span
                className={`border rounded-xl px-4 py-2 text-sm font-semibold capitalize ${getDifficultyStyle(
                  lab?.difficulty
                )}`}
              >
                {lab?.difficulty || "lab"}
              </span>

              <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
                <p className="text-[11px] text-slate-500 uppercase tracking-wide">
                  Score
                </p>
                <p className="font-bold text-white">{session?.score ?? 0}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
                <p className="text-[11px] text-slate-500 uppercase tracking-wide">
                  Hints
                </p>
                <p className="font-bold text-white">
                  {session?.hintsUsed ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <aside className="xl:col-span-3">
            <InstructionsPanel
              lab={lab}
              session={session}
              hint={hint}
              onGetHint={getHint}
              onRestart={startLab}
            />
          </aside>

          <section className="xl:col-span-4">
            <TopologyPanel
              deviceId={deviceId}
              setDeviceId={setDeviceId}
              devices={session?.state.devices}
              topology={lab?.topology}
              getDeviceHealth={getDeviceHealth}
            />
          </section>

          <section className="xl:col-span-5">
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
        </div>
      </section>
    </main>
  );
}