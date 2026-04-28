"use client";

import { KeyboardEvent, RefObject, useState } from "react";

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
  terminalRef: RefObject<HTMLDivElement | null>;
  disabled: boolean;
  deviceId: string;
  devices: Record<string, DeviceState> | undefined;
  cliContexts?: Record<string, CliContext>;
  allowedCommands?: Partial<Record<DeviceType, string[]>>;
};

const defaultAllowedCommands: Record<DeviceType, string[]> = {
  pc: ["ipconfig", "ping 192.168.1.1"],
  router: ["show ip interface brief", "enable"],
  switch: ["show interfaces status", "show vlan brief", "enable"],
};

function normalizeCommand(command: string) {
  return command
    .replace("{ip}", "192.168.1.1")
    .replace("{domain}", "google.com")
    .trim();
}

function isConfigurationCommand(command: string) {
  return (
    command === "configure terminal" ||
    command === "config t" ||
    command === "conf t"
  );
}

function isInterfaceCommand(command: string) {
  return command.startsWith("interface ");
}

function isInterfaceModeCommand(command: string) {
  return command === "shutdown" || command === "no shutdown";
}

function getFallbackCommandForDns(device: DeviceState | undefined) {
  if (device?.type === "pc" && device.network?.dns !== undefined) {
    return ["ping google.com", "set dns 8.8.8.8"];
  }

  return [];
}

function getCommandsForDevice(
  deviceType: DeviceType | undefined,
  device: DeviceState | undefined,
  allowedCommands?: Partial<Record<DeviceType, string[]>>
) {
  if (!deviceType) return [];

  const commandsFromLab =
    allowedCommands?.[deviceType] || defaultAllowedCommands[deviceType] || [];

  const normalized = commandsFromLab.map(normalizeCommand);

  return Array.from(
    new Set([...normalized, ...getFallbackCommandForDns(device)])
  );
}

function filterCommandsByMode(commands: string[], mode: CliMode | undefined) {
  const currentMode = mode || "user";

  if (currentMode === "user") {
    return commands.filter((cmd) => {
      if (cmd === "enable") return true;
      if (cmd.startsWith("show ")) return true;
      if (cmd === "ipconfig") return true;
      if (cmd.startsWith("ping ")) return true;
      if (cmd.startsWith("set ")) return true;
      return false;
    });
  }

  if (currentMode === "privileged") {
    return commands.filter((cmd) => {
      if (isConfigurationCommand(cmd)) return true;
      if (cmd.startsWith("show ")) return true;
      if (cmd === "exit") return true;
      return false;
    });
  }

  if (currentMode === "global_config") {
    return commands.filter((cmd) => {
      if (isInterfaceCommand(cmd)) return true;
      if (cmd === "exit") return true;
      if (cmd === "end") return true;
      return false;
    });
  }

  if (currentMode === "interface_config") {
    return commands.filter((cmd) => {
      if (isInterfaceModeCommand(cmd)) return true;
      if (cmd === "exit") return true;
      if (cmd === "end") return true;
      return false;
    });
  }

  return commands;
}

function getSuggestions(
  deviceType: DeviceType | undefined,
  device: DeviceState | undefined,
  cliContext: CliContext | undefined,
  allowedCommands?: Partial<Record<DeviceType, string[]>>
) {
  const commands = getCommandsForDevice(deviceType, device, allowedCommands);

  if (deviceType === "pc") {
    return commands;
  }

  return filterCommandsByMode(commands, cliContext?.mode);
}

function getPrompt(
  deviceId: string,
  deviceType: string | undefined,
  cliContext?: CliContext
) {
  if (deviceType === "pc") return `${deviceId}>`;

  if (!cliContext || cliContext.mode === "user") return `${deviceId}>`;
  if (cliContext.mode === "privileged") return `${deviceId}#`;
  if (cliContext.mode === "global_config") return `${deviceId}(config)#`;
  if (cliContext.mode === "interface_config") return `${deviceId}(config-if)#`;

  return `${deviceId}>`;
}

function getTabCompletion(input: string, suggestions: string[]) {
  const trimmedInput = input.trim().toLowerCase();

  if (!trimmedInput) return "";

  const matches = suggestions.filter((suggestion) =>
    suggestion.toLowerCase().startsWith(trimmedInput)
  );

  if (matches.length === 1) {
    return matches[0];
  }

  return input;
}

function getDeviceLabel(deviceId: string, deviceType: string | undefined) {
  if (deviceType === "pc") return `${deviceId.toUpperCase()} Console`;
  if (deviceType === "router") return `${deviceId.toUpperCase()} Router CLI`;
  if (deviceType === "switch") return `${deviceId.toUpperCase()} Switch CLI`;
  return `${deviceId.toUpperCase()} Terminal`;
}

function getDeviceAccent(deviceType: string | undefined) {
  if (deviceType === "pc") {
    return {
      dot: "bg-blue-400",
      text: "text-blue-300",
      border: "border-blue-500/30",
      glow: "shadow-[0_0_28px_rgba(59,130,246,0.12)]",
    };
  }

  if (deviceType === "switch") {
    return {
      dot: "bg-violet-400",
      text: "text-violet-300",
      border: "border-violet-500/30",
      glow: "shadow-[0_0_28px_rgba(139,92,246,0.12)]",
    };
  }

  if (deviceType === "router") {
    return {
      dot: "bg-rose-400",
      text: "text-rose-300",
      border: "border-rose-500/30",
      glow: "shadow-[0_0_28px_rgba(244,63,94,0.12)]",
    };
  }

  return {
    dot: "bg-slate-400",
    text: "text-slate-300",
    border: "border-slate-700",
    glow: "",
  };
}

export function TerminalPanel({
  logs,
  command,
  setCommand,
  runCommand,
  terminalRef,
  disabled,
  deviceId,
  devices,
  cliContexts,
  allowedCommands,
}: Props) {
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(true);

  const selectedDevice = devices?.[deviceId];
  const deviceType = selectedDevice?.type;
  const cliContext = cliContexts?.[deviceId];
  const accent = getDeviceAccent(deviceType);

  const suggestions = getSuggestions(
    deviceType,
    selectedDevice,
    cliContext,
    allowedCommands
  );

  const prompt = getPrompt(deviceId, deviceType, cliContext);
  const deviceLogs = logs.filter((log) => log.deviceId === deviceId);
  const commandHistory = deviceLogs.map((log) => log.command);

  function handleRunCommand() {
    setHistoryIndex(null);
    runCommand();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      handleRunCommand();
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const completedCommand = getTabCompletion(command, suggestions);
      setCommand(completedCommand);
      setHistoryIndex(null);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (commandHistory.length === 0) return;

      const nextIndex =
        historyIndex === null
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);

      setHistoryIndex(nextIndex);
      setCommand(commandHistory[nextIndex]);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (commandHistory.length === 0 || historyIndex === null) return;

      const nextIndex = historyIndex + 1;

      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(null);
        setCommand("");
        return;
      }

      setHistoryIndex(nextIndex);
      setCommand(commandHistory[nextIndex]);
    }
  }

  return (
    <section
      className={`bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl shadow-black/25 ${accent.glow}`}
    >
      <div className="bg-slate-950 border-b border-slate-800 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="h-3 w-3 rounded-full bg-green-500" />
              </div>

              <h2 className="text-xl font-bold text-white">CLI Console</h2>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              {getDeviceLabel(deviceId, deviceType)} · isolated command history
            </p>
          </div>

          <div
            className={`border ${accent.border} bg-slate-900 rounded-xl px-4 py-2 text-right`}
          >
            <div className="flex items-center gap-2 justify-end">
              <span className={`h-2 w-2 rounded-full ${accent.dot}`} />
              <span className={`text-xs font-mono ${accent.text}`}>
                {deviceId.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {(deviceType || "device").toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950/70 border-b border-slate-800 px-5 py-4 min-h-[116px]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Command Shortcuts
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Optional training aid. Hide them to troubleshoot from memory.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowShortcuts((prev) => !prev)}
            className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-slate-300"
          >
            {showShortcuts ? "Hide Shortcuts" : "Show Shortcuts"}
          </button>
        </div>

        <div className="mt-3 min-h-[30px] flex flex-wrap gap-2 items-start">
          {showShortcuts && suggestions.length > 0 && (
            <>
              {suggestions.map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => {
                    setCommand(cmd);
                    setHistoryIndex(null);
                  }}
                  disabled={disabled}
                  className="text-xs bg-slate-900 hover:bg-slate-800 disabled:bg-slate-950 disabled:text-slate-700 border border-slate-700/70 px-3 py-1.5 rounded-lg text-slate-300 font-mono transition"
                >
                  {cmd}
                </button>
              ))}
            </>
          )}

          {showShortcuts && suggestions.length === 0 && (
            <span className="text-xs text-slate-700">
              No shortcuts for this device. Type manually in the terminal.
            </span>
          )}

          {!showShortcuts && (
            <span className="text-xs text-slate-700">
              Shortcuts hidden. Type commands manually.
            </span>
          )}
        </div>
      </div>

      <div className="bg-black">
        <div
          ref={terminalRef}
          className="h-[470px] overflow-y-auto p-5 font-mono text-sm bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.05),transparent_28%)]"
        >
          {deviceLogs.length === 0 && (
            <div className="text-slate-600">
              <p className={accent.text}>{getDeviceLabel(deviceId, deviceType)}</p>
              <p>This device has no command history yet.</p>
              <p className="mt-2">Tips: ↑ ↓ history · Tab autocomplete</p>
            </div>
          )}

          {deviceLogs.map((log, index) => (
            <div key={`${log.deviceId}-${index}`} className="mb-5">
              <div className="flex items-start gap-2">
                <span className="text-green-400 shrink-0">
                  {log.deviceId}&gt;
                </span>
                <span className="text-slate-100">{log.command}</span>
              </div>

              {log.output && (
                <pre
                  className={`whitespace-pre-wrap mt-2 leading-relaxed border-l-2 pl-3 ${
                    log.ok === false
                      ? "text-red-300 border-red-500/40"
                      : "text-slate-300 border-slate-700"
                  }`}
                >
                  {log.output}
                </pre>
              )}
            </div>
          ))}

          {!disabled && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-green-400 shrink-0">{prompt}</span>
              <input
                value={command}
                onChange={(event) => {
                  setCommand(event.target.value);
                  setHistoryIndex(null);
                }}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-slate-100 font-mono caret-green-400 placeholder:text-slate-700"
                placeholder="type a command..."
              />
            </div>
          )}

          {disabled && (
            <div className="text-slate-600 mt-3">
              Session complete. Start a new session to continue.
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-800 bg-slate-950 px-5 py-3 flex items-center justify-between text-xs text-slate-600">
        <span>Lab-defined shortcuts</span>
        <span>Tab autocomplete</span>
        <span>↑ ↓ command history</span>
      </div>
    </section>
  );
}

export default TerminalPanel;