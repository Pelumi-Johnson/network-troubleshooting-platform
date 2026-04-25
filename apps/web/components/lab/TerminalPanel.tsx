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
      ip: string;
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

  return [];
}

function getPrompt(
  deviceId: string,
  deviceType: string | undefined,
  cliContext?: CliContext
) {
  if (deviceType !== "router") {
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

  const selectedDevice = devices?.[deviceId];
  const deviceType = selectedDevice?.type;
  const cliContext = cliContexts?.[deviceId];
  const suggestions = getSuggestions(deviceType, selectedDevice, cliContext);
  const prompt = getPrompt(deviceId, deviceType, cliContext);

  const commandHistory = logs
    .filter((log) => log.deviceId === deviceId)
    .map((log) => log.command);

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
    <section className="bg-black rounded-xl p-5 border border-slate-800">
      <h2 className="text-xl font-bold mb-4">Terminal</h2>

      <div className="mb-3 flex flex-wrap gap-2">
        {suggestions.map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() => {
              setCommand(cmd);
              setHistoryIndex(null);
            }}
            disabled={disabled}
            className="text-xs bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 px-3 py-1 rounded"
          >
            {cmd}
          </button>
        ))}
      </div>

      <div
        ref={terminalRef}
        className="h-96 overflow-y-auto bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm"
      >
        {logs.length === 0 && (
          <p className="text-slate-500">
            Start troubleshooting using commands above.
          </p>
        )}

        {logs.map((log, i) => (
          <div key={i} className="mb-5 border-b border-slate-800 pb-3">
            <div className="text-green-400">
              {log.deviceId}&gt; {log.command}
            </div>
            {log.output && (
              <pre
                className={`whitespace-pre-wrap mt-2 ${
                  log.ok === false ? "text-red-400" : "text-slate-200"
                }`}
              >
                {log.output}
              </pre>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2 items-center">
        <span className="text-green-400 font-mono text-sm">{prompt}</span>
        <input
          value={command}
          onChange={(event) => {
            setCommand(event.target.value);
            setHistoryIndex(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type command..."
          disabled={disabled}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white disabled:bg-slate-800 disabled:text-slate-500"
        />
        <button
          type="button"
          onClick={handleRunCommand}
          disabled={disabled}
          className="bg-blue-600 disabled:bg-slate-700 px-4 py-2 rounded-lg font-semibold"
        >
          Run
        </button>
      </div>

      <p className="mt-3 text-xs text-slate-600">
        Tips: Use ↑ ↓ for command history. Use Tab to autocomplete.
      </p>
    </section>
  );
}