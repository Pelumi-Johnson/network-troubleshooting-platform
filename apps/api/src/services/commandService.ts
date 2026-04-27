import { parseCommand, CommandKey } from "../engine/parsers/commandParser";
import { labSessionsService } from "./labSessionsService";
import { labsService } from "./labsService";
import { validateLabCompletion } from "../engine/validation/rulesEngine";
import { progressService } from "./progressService";
import { handlePcCommand } from "../engine/commandHandlers/pcCommandHandler";
import { getCliContext } from "../engine/commandHandlers/cliContext";
import { handleNetworkDeviceCommand } from "../engine/commandHandlers/networkDeviceCommandHandler";

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

    if (device.type === "pc") {
      output = handlePcCommand(parsed, device, session.state);
    } else if (device.type === "router" || device.type === "switch") {
      const context = getCliContext(session, deviceId);
      output = handleNetworkDeviceCommand(parsed, device, context);
    } else {
      output = "Command not supported on this device.";
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