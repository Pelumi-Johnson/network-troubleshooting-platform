"use client";

import { RefObject, useState } from "react";
import { TerminalPanel } from "@/components/lab/TerminalPanel";

type DeviceType = "pc" | "switch" | "router";

type CliMode = "user" | "privileged" | "global_config" | "interface_config";

type CliContext = {
  mode: CliMode;
  interfaceName?: string | null;
};

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

type CommandLog = {
  deviceId: string;
  command: string;
  output: string;
  ok?: boolean;
};

type Props = {
  logs: CommandLog[];
  command: string;
  setCommand: (value: string) => void;
  runCommand: () => void;
  runRawCommand: (command: string) => Promise<void>;
  terminalRef: RefObject<HTMLDivElement | null>;
  disabled: boolean;
  deviceId: string;
  devices: Record<string, DeviceState> | undefined;
  cliContexts?: Record<string, CliContext>;
  allowedCommands?: Partial<Record<DeviceType, string[]>>;
};

type PcApp = "home" | "command" | "ip-config";

function AppIcon({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-5 transition hover:border-blue-500/40 hover:bg-blue-500/10"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-300 group-hover:text-white">
        {children}
      </div>
      <span className="text-xs font-semibold text-slate-300">{label}</span>
    </button>
  );
}

function PcIpConfigurationPanel({
  device,
  disabled,
  runRawCommand,
}: {
  device: DeviceState;
  disabled: boolean;
  runRawCommand: (command: string) => Promise<void>;
}) {
  const network = device.network;

  const [assignmentMode, setAssignmentMode] = useState<"dhcp" | "static">(
    "static"
  );
  const [ip] = useState(network?.ip || "");
  const [mask, setMask] = useState(network?.mask || "");
  const [gateway, setGateway] = useState(network?.gateway || "");
  const [dns, setDns] = useState(network?.dns || "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function applyConfiguration() {
    if (!network || disabled || saving) return;

    setSaving(true);
    setMessage("");

    try {
      const commandsToRun: string[] = [];

      if (mask.trim() && mask.trim() !== network.mask) {
        commandsToRun.push(`set subnet-mask ${mask.trim()}`);
      }

      if (gateway.trim() && gateway.trim() !== network.gateway) {
        commandsToRun.push(`set default-gateway ${gateway.trim()}`);
      }

      if (dns.trim() && dns.trim() !== (network.dns || "")) {
        commandsToRun.push(`set dns ${dns.trim()}`);
      }

      if (commandsToRun.length === 0) {
        setMessage("No supported configuration changes to apply.");
        return;
      }

      for (const commandToRun of commandsToRun) {
        await runRawCommand(commandToRun);
      }

      setMessage("Configuration applied.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to apply configuration."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm font-semibold mb-3">IP Assignment</p>

          <div className="flex gap-5">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="radio"
                checked={assignmentMode === "dhcp"}
                onChange={() => setAssignmentMode("dhcp")}
                className="accent-blue-500"
                disabled={disabled}
              />
              DHCP
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="radio"
                checked={assignmentMode === "static"}
                onChange={() => setAssignmentMode("static")}
                className="accent-blue-500"
                disabled={disabled}
              />
              Static
            </label>
          </div>

          {assignmentMode === "dhcp" && (
            <p className="text-xs text-yellow-400 mt-3">
              DHCP mode is visual for now. Current labs use static edits.
            </p>
          )}
        </div>

        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-slate-500">
            IPv4 Address
          </span>
          <input
            value={ip}
            disabled
            readOnly
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-500 outline-none"
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Subnet Mask
          </span>
          <input
            value={mask}
            onChange={(event) => setMask(event.target.value)}
            disabled={disabled || assignmentMode === "dhcp"}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-black px-4 py-3 font-mono text-sm text-slate-100 outline-none focus:border-blue-500/60"
            placeholder="255.255.255.0"
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Default Gateway
          </span>
          <input
            value={gateway}
            onChange={(event) => setGateway(event.target.value)}
            disabled={disabled || assignmentMode === "dhcp"}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-black px-4 py-3 font-mono text-sm text-slate-100 outline-none focus:border-blue-500/60"
            placeholder="192.168.1.1"
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-slate-500">
            DNS Server
          </span>
          <input
            value={dns}
            onChange={(event) => setDns(event.target.value)}
            disabled={disabled || assignmentMode === "dhcp"}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-black px-4 py-3 font-mono text-sm text-slate-100 outline-none focus:border-blue-500/60"
            placeholder="8.8.8.8"
          />
        </label>

        <button
          type="button"
          onClick={applyConfiguration}
          disabled={disabled || assignmentMode === "dhcp" || saving}
          className="w-full rounded-2xl bg-blue-600 px-5 py-3 font-bold hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500"
        >
          {saving ? "Applying..." : "Apply Configuration"}
        </button>

        {message && (
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-200">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

function PcWorkspace({
  logs,
  command,
  setCommand,
  runCommand,
  runRawCommand,
  terminalRef,
  disabled,
  deviceId,
  devices,
  cliContexts,
  allowedCommands,
  selectedDevice,
}: Props & { selectedDevice: DeviceState }) {
  const [activeApp, setActiveApp] = useState<PcApp>("home");

  const activeTitle =
    activeApp === "command"
      ? "Command Prompt"
      : activeApp === "ip-config"
      ? "IP Configuration"
      : "Desktop";

  return (
    <section className="flex h-full min-h-[640px] flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/25">
      <div className="border-b border-slate-800 bg-slate-950 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Device Workspace
            </p>
            <h2 className="mt-1 text-xl font-black">
              {deviceId.toUpperCase()} · {activeTitle}
            </h2>
          </div>

          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/15 px-4 py-2">
            <p className="text-xs font-mono text-blue-300">
              {deviceId.toUpperCase()}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">PC</p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.08),transparent_28%)]">
        {activeApp === "home" && (
          <div className="h-full p-5">
            <div className="h-full rounded-3xl border border-slate-800 bg-slate-950/90 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Desktop
              </p>
              <h3 className="mt-1 text-lg font-black">Open an application</h3>

              <div className="mt-6 grid max-w-sm grid-cols-2 gap-4">
                <AppIcon
                  label="Command Prompt"
                  onClick={() => setActiveApp("command")}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M4 5h16v14H4z" />
                    <path d="M7 10l2 2-2 2" />
                    <path d="M11 16h5" />
                  </svg>
                </AppIcon>

                <AppIcon
                  label="IP Configuration"
                  onClick={() => setActiveApp("ip-config")}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M4 6h16v12H4z" />
                    <path d="M8 10h8" />
                    <path d="M8 14h4" />
                  </svg>
                </AppIcon>
              </div>
            </div>
          </div>
        )}

        {activeApp !== "home" && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-4 py-3">
              <button
                type="button"
                onClick={() => setActiveApp("home")}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
              >
                Back
              </button>

              <p className="text-sm font-semibold text-slate-200">
                {activeTitle}
              </p>
            </div>

            <div className="min-h-0 flex-1">
              {activeApp === "command" && (
                <TerminalPanel
                  logs={logs}
                  command={command}
                  setCommand={setCommand}
                  runCommand={runCommand}
                  terminalRef={terminalRef}
                  disabled={disabled}
                  deviceId={deviceId}
                  devices={devices}
                  cliContexts={cliContexts}
                  allowedCommands={allowedCommands}
                  embedded
                />
              )}

              {activeApp === "ip-config" && (
                <PcIpConfigurationPanel
                  key={`${deviceId}-${selectedDevice.network?.ip || ""}-${
                    selectedDevice.network?.mask || ""
                  }-${selectedDevice.network?.gateway || ""}-${
                    selectedDevice.network?.dns || ""
                  }`}
                  device={selectedDevice}
                  disabled={disabled}
                  runRawCommand={runRawCommand}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function DeviceWorkspacePanel({
  logs,
  command,
  setCommand,
  runCommand,
  runRawCommand,
  terminalRef,
  disabled,
  deviceId,
  devices,
  cliContexts,
  allowedCommands,
}: Props) {
  const selectedDevice = devices?.[deviceId];
  const deviceType = selectedDevice?.type;

  if (deviceType !== "pc" || !selectedDevice) {
    return (
      <div className="h-full min-h-[640px] overflow-hidden rounded-3xl">
        <TerminalPanel
          logs={logs}
          command={command}
          setCommand={setCommand}
          runCommand={runCommand}
          terminalRef={terminalRef}
          disabled={disabled}
          deviceId={deviceId}
          devices={devices}
          cliContexts={cliContexts}
          allowedCommands={allowedCommands}
        />
      </div>
    );
  }

  return (
    <PcWorkspace
      key={deviceId}
      logs={logs}
      command={command}
      setCommand={setCommand}
      runCommand={runCommand}
      runRawCommand={runRawCommand}
      terminalRef={terminalRef}
      disabled={disabled}
      deviceId={deviceId}
      devices={devices}
      cliContexts={cliContexts}
      allowedCommands={allowedCommands}
      selectedDevice={selectedDevice}
    />
  );
}

export default DeviceWorkspacePanel;