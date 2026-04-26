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
  return command.replace("{ip}", "192.168.1.1").trim();
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

function isUserOrPrivilegedCommand(command: string) {
  return (
    command === "enable" ||
    command === "exit" ||
    command.startsWith("show ") ||
    command === "ipconfig" ||
    command.startsWith("ping ") ||
    command.startsWith("set ")
  );
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
    return commands.filter((command) => {
      if (command === "enable") return true;
      if (command.startsWith("show ")) return true;
      if (command === "ipconfig") return true;
      if (command.startsWith("ping ")) return true;
      if (command.startsWith("set ")) return true;
      return false;
    });
  }

  if (currentMode === "privileged") {
    return commands.filter((command) => {
      if (isConfigurationCommand(command)) return true;
      if (command.startsWith("show ")) return true;
      if (command === "exit") return true;
      return false;
    });
  }

  if (currentMode === "global_config") {
    return commands.filter((command) => {
      if (isInterfaceCommand(command)) return true;
      if (command === "exit") return true;
      if (command === "end") return true;
      return false;
    });
  }

  if (currentMode === "interface_config") {
    return commands.filter((command) => {
      if (isInterfaceModeCommand(command)) return true;
      if (command === "exit") return true;
      if (command === "end") return true;
      return false;
    });
  }

  return commands.filter(isUserOrPrivilegedCommand);
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
  if (deviceType === "pc") {
    return `${deviceId}>`;
  }

  if (!cliContext || cliContext.mode === "user") {
    return `${deviceId}>`;
  }

  if (cliContext.mode === "privileged") {
    return `${deviceId}#`;
  }

  if (cliContext.mode === "global_config") {
    return `${deviceId}(config)#`;
  }

  if (cliContext.mode === "interface_config") {
    return `${deviceId}(config-if)#`;
  }

  return `${deviceId}>`;
}

function getTabCompletion(input: string, suggestions: string[]) {
  const trimmedInput = input.trim().toLowerCase();

  if (!trimmedInput) {
    return "";
  }

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
    <section className="bg-black rounded-xl border border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-slate-950">
        <div>
          <h2 className="text-xl font-bold text-white">Terminal</h2>
          <p className="text-xs text-slate-500 mt-1">
            {getDeviceLabel(deviceId, deviceType)} — device history is isolated.
          </p>
        </div>

        <div className="text-xs text-slate-500">
          Selected:{" "}
          <span className="text-green-400 font-mono">
            {deviceId.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="px-5 pt-4 pb-3 bg-black border-b border-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Command Shortcuts
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Loaded from this lab&apos;s allowed commands. Hide them to
              practice from memory.
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

        {showShortcuts && (
          <div className="flex flex-wrap gap-2 mt-3">
            {suggestions.map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => {
                  setCommand(cmd);
                  setHistoryIndex(null);
                }}
                disabled={disabled}
                className="text-xs bg-slate-900 hover:bg-slate-800 disabled:bg-slate-950 disabled:text-slate-700 border border-slate-800 px-3 py-1 rounded"
              >
                {cmd}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        ref={terminalRef}
        className="h-[460px] overflow-y-auto bg-black p-5 font-mono text-sm"
      >
        {deviceLogs.length === 0 && (
          <div className="text-slate-600">
            <p>{getDeviceLabel(deviceId, deviceType)}</p>
            <p>This device has no command history yet.</p>
            <p className="mt-2">Tips: ↑ ↓ history | Tab autocomplete</p>
          </div>
        )}

        {deviceLogs.map((log, i) => (
          <div key={`${log.deviceId}-${i}`} className="mb-4">
            <div className="text-green-400">
              {log.deviceId}&gt; {log.command}
            </div>

            {log.output && (
              <pre
                className={`whitespace-pre-wrap mt-1 leading-relaxed ${
                  log.ok === false ? "text-red-400" : "text-slate-200"
                }`}
              >
                {log.output}
              </pre>
            )}
          </div>
        ))}

        {!disabled && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-green-400">{prompt}</span>
            <input
              value={command}
              onChange={(event) => {
                setCommand(event.target.value);
                setHistoryIndex(null);
              }}
              onKeyDown={handleKeyDown}
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-slate-100 font-mono caret-green-400"
            />
          </div>
        )}

        {disabled && (
          <div className="text-slate-600 mt-3">
            Session complete. Start a new session to continue.
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 bg-slate-950 px-5 py-3 flex items-center justify-between text-xs text-slate-600">
        <span>Lab-defined shortcuts</span>
        <span>Tab autocomplete</span>
        <span>↑ ↓ history</span>
      </div>
    </section>
  );
}

export default TerminalPanel;