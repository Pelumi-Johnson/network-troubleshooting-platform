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
      ip: string;
      status: "up" | "down";
    }
  >;
};

type CliMode = "user" | "privileged" | "global_config" | "interface_config";

type CliContext = {
  mode: CliMode;
  interfaceName?: string | null;
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
        setLab(labData);
        setSession(savedSession);
        setLogs(getLogsFromSession(savedSession));
        setLoading(false);
        return;
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

          setLab(labData);
          setSession(savedSession);
          setLogs(getLogsFromSession(savedSession));
          setLoading(false);
          return;
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

    if (lab?.slug === "office-network-down") {
      if (device.type === "pc") {
        return device.network?.gateway === "192.168.1.1" ? "fixed" : "broken";
      }

      return "normal";
    }

    if (lab?.slug === "router-interface-down") {
      if (device.type === "router") {
        const hasDownInterface = Object.values(device.interfaces || {}).some(
          (iface) => iface.status === "down"
        );

        return hasDownInterface ? "broken" : "fixed";
      }

      return "normal";
    }

    if (lab?.slug === "dns-failure") {
      if (device.type === "pc") {
        return device.network?.dns === "8.8.8.8" ? "fixed" : "broken";
      }

      return "normal";
    }

    return "normal";
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