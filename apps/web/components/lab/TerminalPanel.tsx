import { KeyboardEvent, RefObject, useState } from "react";

type CliMode = "user" | "privileged" | "global_config" | "interface_config";

type CliContext = {
  mode: CliMode;
  interfaceName?: string | null;
};

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
};

function getRouterSuggestions(mode: CliMode | undefined) {
  if (mode === "user") {
    return ["enable", "show ip interface brief"];
  }

  if (mode === "privileged") {
    return ["configure terminal", "show ip interface brief", "exit"];
  }

  if (mode === "global_config") {
    return ["interface g0/0", "exit", "end"];
  }

  if (mode === "interface_config") {
    return ["no shutdown", "exit", "end"];
  }

  return ["enable"];
}

function getSwitchSuggestions(mode: CliMode | undefined) {
  if (mode === "user") {
    return ["enable", "show interfaces status", "show vlan brief"];
  }

  if (mode === "privileged") {
    return [
      "configure terminal",
      "show interfaces status",
      "show vlan brief",
      "exit",
    ];
  }

  if (mode === "global_config") {
    return ["interface f0/1", "interface f0/2", "exit", "end"];
  }

  if (mode === "interface_config") {
    return ["shutdown", "no shutdown", "exit", "end"];
  }

  return ["enable"];
}

function getSuggestions(
  deviceType: string | undefined,
  device: DeviceState | undefined,
  cliContext: CliContext | undefined
) {
  if (deviceType === "pc") {
    const suggestions = ["ipconfig", "ping 192.168.1.1", "ping 8.8.8.8"];

    if (device?.network?.dns !== undefined) {
      suggestions.push("ping google.com");
      suggestions.push("set dns 8.8.8.8");
    } else {
      suggestions.push("set default-gateway 192.168.1.1");
    }

    return suggestions;
  }

  if (deviceType === "router") {
    return getRouterSuggestions(cliContext?.mode || "user");
  }

  if (deviceType === "switch") {
    return getSwitchSuggestions(cliContext?.mode || "user");
  }

  return [];
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
}: Props) {
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(true);

  const selectedDevice = devices?.[deviceId];
  const deviceType = selectedDevice?.type;
  const cliContext = cliContexts?.[deviceId];
  const suggestions = getSuggestions(deviceType, selectedDevice, cliContext);
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
              Optional training aid. Hide them to practice from memory.
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
              placeholder=""
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
        <span>Device-specific console</span>
        <span>Tab autocomplete</span>
        <span>↑ ↓ history</span>
      </div>
    </section>
  );
}