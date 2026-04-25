export type CommandKey =
  | "ipconfig"
  | "ping"
  | "set_default_gateway"
  | "set_dns"
  | "show_ip_interface_brief"
  | "enable"
  | "configure_terminal"
  | "interface"
  | "no_shutdown"
  | "exit"
  | "end";

export interface ParsedCommand {
  commandKey: CommandKey;
  raw: string;
  args: Record<string, string>;
}

export function parseCommand(rawCommand: string): ParsedCommand | null {
  const command = rawCommand.trim();

  if (/^ipconfig$/i.test(command)) {
    return {
      commandKey: "ipconfig",
      raw: command,
      args: {},
    };
  }

  const pingMatch = command.match(/^ping\s+(.+)$/i);

  if (pingMatch) {
    return {
      commandKey: "ping",
      raw: command,
      args: {
        target: pingMatch[1].trim(),
      },
    };
  }

  const setDefaultGatewayMatch = command.match(
    /^set\s+default-gateway\s+(\d{1,3}(?:\.\d{1,3}){3})$/i
  );

  if (setDefaultGatewayMatch) {
    return {
      commandKey: "set_default_gateway",
      raw: command,
      args: {
        ip: setDefaultGatewayMatch[1],
      },
    };
  }

  const setDnsMatch = command.match(
    /^set\s+dns\s+(\d{1,3}(?:\.\d{1,3}){3})$/i
  );

  if (setDnsMatch) {
    return {
      commandKey: "set_dns",
      raw: command,
      args: {
        ip: setDnsMatch[1],
      },
    };
  }

  if (/^show\s+ip\s+interface\s+brief$/i.test(command)) {
    return {
      commandKey: "show_ip_interface_brief",
      raw: command,
      args: {},
    };
  }

  if (/^enable$/i.test(command)) {
    return {
      commandKey: "enable",
      raw: command,
      args: {},
    };
  }

  if (/^(configure\s+terminal|config\s+t|conf\s+t)$/i.test(command)) {
    return {
      commandKey: "configure_terminal",
      raw: command,
      args: {},
    };
  }

  const interfaceMatch = command.match(/^interface\s+([a-zA-Z]+\d+\/\d+)$/i);

  if (interfaceMatch) {
    return {
      commandKey: "interface",
      raw: command,
      args: {
        interfaceName: interfaceMatch[1].toLowerCase(),
      },
    };
  }

  if (/^no\s+shutdown$/i.test(command)) {
    return {
      commandKey: "no_shutdown",
      raw: command,
      args: {},
    };
  }

  if (/^exit$/i.test(command)) {
    return {
      commandKey: "exit",
      raw: command,
      args: {},
    };
  }

  if (/^end$/i.test(command)) {
    return {
      commandKey: "end",
      raw: command,
      args: {},
    };
  }

  return null;
}