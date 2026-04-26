"use client";

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

type DeviceState = {
  type: "pc" | "switch" | "router";
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

type Lab = {
  id: string;
  slug: string;
  title: string;
  scenario: {
    summary: string;
    objective: string;
    completionMessage: string;
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

export default function LabPage() {
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
  }, [labSlug, storageKey]);

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

  if (loading) {
    return (
      <main className="p-8 bg-slate-950 text-white min-h-screen">
        Loading lab...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InstructionsPanel
          lab={lab}
          session={session}
          hint={hint}
          onGetHint={getHint}
          onRestart={startLab}
        />

        <TopologyPanel
          deviceId={deviceId}
          setDeviceId={setDeviceId}
          devices={session?.state.devices}
          getDeviceHealth={getDeviceHealth}
        />

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
        />
      </div>
    </main>
  );
}