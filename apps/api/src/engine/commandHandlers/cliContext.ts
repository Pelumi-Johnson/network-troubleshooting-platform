export type CliMode =
  | "user"
  | "privileged"
  | "global_config"
  | "interface_config";

export type CliContext = {
  mode: CliMode;
  interfaceName?: string | null;
};

export function getCliContext(session: any, deviceId: string): CliContext {
  if (!session.cliContexts) {
    session.cliContexts = {};
  }

  if (!session.cliContexts[deviceId]) {
    session.cliContexts[deviceId] = {
      mode: "user",
      interfaceName: null,
    };
  }

  return session.cliContexts[deviceId];
}

export function resetContext(context: CliContext) {
  context.mode = "user";
  context.interfaceName = null;
}

export function moveContextBack(context: CliContext) {
  if (context.mode === "interface_config") {
    context.mode = "global_config";
    context.interfaceName = null;
    return;
  }

  if (context.mode === "global_config") {
    context.mode = "privileged";
    context.interfaceName = null;
    return;
  }

  if (context.mode === "privileged") {
    context.mode = "user";
    context.interfaceName = null;
    return;
  }

  context.mode = "user";
  context.interfaceName = null;
}

export function getConfigureTerminalModeError(context: CliContext) {
  if (context.mode === "user") {
    return [
      "% Invalid input detected at '^' marker.",
      "Hint: Enter privileged EXEC mode first using 'enable'.",
    ].join("\n");
  }

  if (context.mode === "global_config") {
    return "Already in global configuration mode.";
  }

  if (context.mode === "interface_config") {
    return [
      "% Invalid input detected at '^' marker.",
      "Hint: Use 'exit' to return to global configuration mode first.",
    ].join("\n");
  }

  return "% Invalid input detected at '^' marker.";
}

export function getInterfaceModeError(context: CliContext) {
  if (context.mode === "user") {
    return [
      "% Invalid input detected at '^' marker.",
      "Hint: Use 'enable', then 'configure terminal' before selecting an interface.",
    ].join("\n");
  }

  if (context.mode === "privileged") {
    return [
      "% Invalid input detected at '^' marker.",
      "Hint: Enter global configuration mode first using 'configure terminal'.",
    ].join("\n");
  }

  if (context.mode === "interface_config") {
    return [
      "% Invalid input detected at '^' marker.",
      "Hint: You are already in interface configuration mode. Use 'exit' to choose another interface.",
    ].join("\n");
  }

  return "% Invalid input detected at '^' marker.";
}

export function getInterfaceRequiredError(commandName: string) {
  return [
    "% Incomplete command.",
    `Hint: Select an interface first using 'interface <name>' before '${commandName}'.`,
  ].join("\n");
}