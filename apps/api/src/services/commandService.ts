import { parseCommand, CommandKey } from "../engine/parsers/commandParser";
import {
  handleIpconfig,
  handlePing,
  handleSetGateway,
  handleSetDns,
  handleSetSubnetMask,
  handleShowIpInterfaceBrief,
  handleNoShutdown,
} from "../engine/handlers";
import { labSessionsService } from "./labSessionsService";
import { labsService } from "./labsService";
import { validateLabCompletion } from "../engine/validation/rulesEngine";
import { progressService } from "./progressService";

type CliMode = "user" | "privileged" | "global_config" | "interface_config";

type CliContext = {
  mode: CliMode;
  interfaceName?: string | null;
};

const allowedCommandsByDeviceType: Record<string, CommandKey[]> = {
  pc: ["ipconfig", "ping", "set_default_gateway", "set_dns", "set_subnet_mask"],
  router: [
    "show_ip_interface_brief",
    "enable",
    "configure_terminal",
    "interface",
    "no_shutdown",
    "exit",
    "end",
  ],
  switch: [
    "show_interfaces_status",
    "show_vlan_brief",
    "enable",
    "configure_terminal",
    "interface",
    "shutdown",
    "no_shutdown",
    "exit",
    "end",
  ],
};

function getCommandError(deviceType: string, command: string) {
  if (deviceType === "pc") {
    return [
      `'${command}' is not recognized as an internal or external command.`,
      "Hint: Select a PC command such as 'ipconfig' or 'ping <target>'.",
    ].join("\n");
  }

  if (deviceType === "router" || deviceType === "switch") {
    return [
      "% Invalid input detected at '^' marker.",
      `Hint: Check the current ${deviceType} CLI mode and available commands.`,
    ].join("\n");
  }

  return "Command not supported on this device.";
}

function getUnknownCommandFeedback(command: string) {
  return [
    `Unknown command: ${command}`,
    "Hint: Use the command suggestions above or press Tab after typing a prefix.",
  ].join("\n");
}

function getCliContext(session: any, deviceId: string): CliContext {
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

function resetContext(context: CliContext) {
  context.mode = "user";
  context.interfaceName = null;
}

function moveContextBack(context: CliContext) {
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

function getConfigureTerminalModeError(context: CliContext) {
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

function getInterfaceModeError(context: CliContext) {
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

function getInterfaceRequiredError(commandName: string) {
  return [
    "% Incomplete command.",
    `Hint: Select an interface first using 'interface <name>' before '${commandName}'.`,
  ].join("\n");
}

function ensureInterfaces(device: any) {
  if (!device.interfaces) {
    device.interfaces = {};
  }

  if (Object.keys(device.interfaces).length === 0 && device.type === "switch") {
    device.interfaces = {
      "f0/1": {
        status: "up",
        vlan: "1",
      },
      "f0/2": {
        status: "up",
        vlan: "1",
      },
      "f0/3": {
        status: "up",
        vlan: "1",
      },
      "f0/4": {
        status: "up",
        vlan: "1",
      },
    };
  }
}

function handleShowInterfacesStatus(device: any) {
  if (device.type !== "switch") {
    return "% Invalid input detected at '^' marker.";
  }

  ensureInterfaces(device);

  const lines = [
    "Port      Name               Status       Vlan",
    "--------- ------------------ ------------ ----",
  ];

  for (const [name, iface] of Object.entries(device.interfaces || {}) as any[]) {
    const status = iface.status === "down" ? "disabled" : "connected";
    const vlan = iface.vlan || "1";

    lines.push(
      `${name.padEnd(9)} ${"".padEnd(18)} ${status.padEnd(12)} ${vlan}`
    );
  }

  return lines.join("\n");
}

function handleShowVlanBrief(device: any) {
  if (device.type !== "switch") {
    return "% Invalid input detected at '^' marker.";
  }

  ensureInterfaces(device);

  const vlanMap: Record<string, string[]> = {};

  for (const [name, iface] of Object.entries(device.interfaces || {}) as any[]) {
    const vlan = iface.vlan || "1";

    if (!vlanMap[vlan]) {
      vlanMap[vlan] = [];
    }

    vlanMap[vlan].push(name);
  }

  const lines = [
    "VLAN Name                             Status    Ports",
    "---- -------------------------------- --------- -------------------------------",
  ];

  for (const [vlan, ports] of Object.entries(vlanMap)) {
    const vlanName = vlan === "1" ? "default" : `VLAN${vlan}`;
    lines.push(
      `${vlan.padEnd(4)} ${vlanName.padEnd(32)} active    ${ports.join(", ")}`
    );
  }

  return lines.join("\n");
}

function handleSwitchShutdown(device: any, interfaceName?: string) {
  if (device.type !== "switch") {
    return "% Invalid input detected at '^' marker.";
  }

  ensureInterfaces(device);

  if (!interfaceName) {
    return getInterfaceRequiredError("shutdown");
  }

  const iface = device.interfaces?.[interfaceName];

  if (!iface) {
    return [
      `% Invalid interface ${interfaceName}`,
      "Hint: Use 'show interfaces status' to view available switch ports.",
    ].join("\n");
  }

  if (iface.status === "down") {
    return `${interfaceName} is already administratively down.`;
  }

  iface.status = "down";

  return [
    `${interfaceName} administratively shut down.`,
    "✔ Interface is now disabled.",
  ].join("\n");
}

function handleSwitchNoShutdown(device: any, interfaceName?: string) {
  if (device.type !== "switch") {
    return "% Invalid input detected at '^' marker.";
  }

  ensureInterfaces(device);

  if (!interfaceName) {
    return getInterfaceRequiredError("no shutdown");
  }

  const iface = device.interfaces?.[interfaceName];

  if (!iface) {
    return [
      `% Invalid interface ${interfaceName}`,
      "Hint: Use 'show interfaces status' to view available switch ports.",
    ].join("\n");
  }

  if (iface.status === "up") {
    return [
      `${interfaceName} is already up.`,
      "✔ No change needed. Interface is already operational.",
    ].join("\n");
  }

  iface.status = "up";

  return [
    `${interfaceName} brought up successfully.`,
    "✔ Interface is now operational.",
  ].join("\n");
}

class CommandService {
  async executeCommand(sessionId: string, deviceId: string, rawCommand: string) {
    const session = await labSessionsService.getSession(sessionId);

    if (!session) {
      return { ok: false, output: "Session not found" };
    }

    const lab = labsService.getLabById(session.labId);

    if (!lab) {
      return { ok: false, output: "Lab definition not found." };
    }

    if (session.status === "completed") {
      return {
        ok: false,
        output: "This lab session is already complete.",
      };
    }

    if (session.status === "abandoned") {
      return {
        ok: false,
        output: "This lab session was abandoned. Start a new session.",
      };
    }

    const parsed = parseCommand(rawCommand);

    if (!parsed) {
      return {
        ok: false,
        output: getUnknownCommandFeedback(rawCommand),
      };
    }

    const device = session.state.devices[deviceId];

    if (!device) {
      return {
        ok: false,
        output: "Device not found.",
      };
    }

    session.selectedDeviceId = deviceId;

    const allowedCommands = allowedCommandsByDeviceType[device.type] || [];

    if (!allowedCommands.includes(parsed.commandKey)) {
      return {
        ok: false,
        deviceId,
        command: rawCommand,
        output: getCommandError(device.type, rawCommand),
      };
    }

    let output = "";

    if (device.type === "router" || device.type === "switch") {
      const context = getCliContext(session, deviceId);

      if (parsed.commandKey === "enable") {
        if (context.mode === "privileged") {
          output = "Already in privileged EXEC mode.";
        } else if (
          context.mode === "global_config" ||
          context.mode === "interface_config"
        ) {
          output = [
            "% Invalid input detected at '^' marker.",
            "Hint: You are already in configuration mode. Use 'end' to return to user mode.",
          ].join("\n");
        } else {
          context.mode = "privileged";
          context.interfaceName = null;
          output = "Entered privileged EXEC mode.";
        }
      } else if (parsed.commandKey === "configure_terminal") {
        if (context.mode !== "privileged") {
          output = getConfigureTerminalModeError(context);
        } else {
          context.mode = "global_config";
          context.interfaceName = null;
          output = "Enter configuration commands, one per line. End with CNTL/Z.";
        }
      } else if (parsed.commandKey === "interface") {
        ensureInterfaces(device);

        if (context.mode !== "global_config") {
          output = getInterfaceModeError(context);
        } else if (!device.interfaces?.[parsed.args.interfaceName]) {
          output = [
            `% Invalid interface ${parsed.args.interfaceName}`,
            device.type === "switch"
              ? "Hint: Use 'show interfaces status' to view available switch ports."
              : "Hint: Use 'show ip interface brief' to view available interfaces.",
          ].join("\n");
        } else {
          context.mode = "interface_config";
          context.interfaceName = parsed.args.interfaceName;
          output = `Entered interface configuration mode for ${parsed.args.interfaceName}.`;
        }
      } else if (parsed.commandKey === "shutdown") {
        if (context.mode !== "interface_config") {
          output = getInterfaceRequiredError("shutdown");
        } else {
          output = handleSwitchShutdown(device, context.interfaceName || undefined);
        }
      } else if (parsed.commandKey === "no_shutdown") {
        if (context.mode !== "interface_config") {
          output = getInterfaceRequiredError("no shutdown");
        } else if (device.type === "router") {
          output = handleNoShutdown(device, context.interfaceName || undefined);
        } else {
          output = handleSwitchNoShutdown(device, context.interfaceName || undefined);
        }
      } else if (parsed.commandKey === "show_ip_interface_brief") {
        output = handleShowIpInterfaceBrief(device);
      } else if (parsed.commandKey === "show_interfaces_status") {
        output = handleShowInterfacesStatus(device);
      } else if (parsed.commandKey === "show_vlan_brief") {
        output = handleShowVlanBrief(device);
      } else if (parsed.commandKey === "exit") {
        moveContextBack(context);
        output = "Exited current mode.";
      } else if (parsed.commandKey === "end") {
        resetContext(context);
        output = "Returned to user EXEC mode.";
      }
    } else if (parsed.commandKey === "ipconfig") {
      output = handleIpconfig(device);
    } else if (parsed.commandKey === "ping") {
      output = handlePing(device, parsed.args.target, session.state);
    } else if (parsed.commandKey === "set_default_gateway") {
      output = handleSetGateway(device, parsed.args.ip);
    } else if (parsed.commandKey === "set_dns") {
      output = handleSetDns(device, parsed.args.ip);
    } else if (parsed.commandKey === "set_subnet_mask") {
      output = handleSetSubnetMask(device, parsed.args.mask);
    } else {
      output = "Command recognized but not implemented.";
    }

    session.commandHistory.push({
      deviceId,
      command: rawCommand,
      output,
      timestamp: new Date().toISOString(),
    });

    const validation = validateLabCompletion(lab, session);

    if (validation.completed) {
      session.status = "completed";
      session.completedAt = new Date().toISOString();

      output = [
        output,
        "",
        "✔ Lab objective completed.",
        lab.scenario.completionMessage,
      ].join("\n");

      const lastCommand =
        session.commandHistory[session.commandHistory.length - 1];

      if (lastCommand) {
        lastCommand.output = output;
      }

      await progressService.saveProgress(lab.slug, session.score);
    }

    const savedSession = await labSessionsService.updateSession(session);

    return {
      ok: true,
      deviceId,
      command: rawCommand,
      output,
      status: savedSession.status,
      score: savedSession.score,
      completed: savedSession.status === "completed",
      completionMessage:
        savedSession.status === "completed"
          ? lab.scenario.completionMessage
          : undefined,
    };
  }
}

export const commandService = new CommandService();