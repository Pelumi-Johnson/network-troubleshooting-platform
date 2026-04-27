import { ParsedCommand } from "../parsers/commandParser";
import { handleNoShutdown, handleShowIpInterfaceBrief } from "../handlers";
import {
  CliContext,
  getConfigureTerminalModeError,
  getInterfaceModeError,
  getInterfaceRequiredError,
  moveContextBack,
  resetContext,
} from "./cliContext";

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

export function handleNetworkDeviceCommand(
  parsed: ParsedCommand,
  device: any,
  context: CliContext
): string {
  if (parsed.commandKey === "enable") {
    if (context.mode === "privileged") {
      return "Already in privileged EXEC mode.";
    }

    if (context.mode === "global_config" || context.mode === "interface_config") {
      return [
        "% Invalid input detected at '^' marker.",
        "Hint: You are already in configuration mode. Use 'end' to return to user mode.",
      ].join("\n");
    }

    context.mode = "privileged";
    context.interfaceName = null;
    return "Entered privileged EXEC mode.";
  }

  if (parsed.commandKey === "configure_terminal") {
    if (context.mode !== "privileged") {
      return getConfigureTerminalModeError(context);
    }

    context.mode = "global_config";
    context.interfaceName = null;
    return "Enter configuration commands, one per line. End with CNTL/Z.";
  }

  if (parsed.commandKey === "interface") {
    ensureInterfaces(device);

    if (context.mode !== "global_config") {
      return getInterfaceModeError(context);
    }

    if (!device.interfaces?.[parsed.args.interfaceName]) {
      return [
        `% Invalid interface ${parsed.args.interfaceName}`,
        device.type === "switch"
          ? "Hint: Use 'show interfaces status' to view available switch ports."
          : "Hint: Use 'show ip interface brief' to view available interfaces.",
      ].join("\n");
    }

    context.mode = "interface_config";
    context.interfaceName = parsed.args.interfaceName;
    return `Entered interface configuration mode for ${parsed.args.interfaceName}.`;
  }

  if (parsed.commandKey === "shutdown") {
    if (context.mode !== "interface_config") {
      return getInterfaceRequiredError("shutdown");
    }

    return handleSwitchShutdown(device, context.interfaceName || undefined);
  }

  if (parsed.commandKey === "no_shutdown") {
    if (context.mode !== "interface_config") {
      return getInterfaceRequiredError("no shutdown");
    }

    if (device.type === "router") {
      return handleNoShutdown(device, context.interfaceName || undefined);
    }

    return handleSwitchNoShutdown(device, context.interfaceName || undefined);
  }

  if (parsed.commandKey === "show_ip_interface_brief") {
    return handleShowIpInterfaceBrief(device);
  }

  if (parsed.commandKey === "show_interfaces_status") {
    return handleShowInterfacesStatus(device);
  }

  if (parsed.commandKey === "show_vlan_brief") {
    return handleShowVlanBrief(device);
  }

  if (parsed.commandKey === "exit") {
    moveContextBack(context);
    return "Exited current mode.";
  }

  if (parsed.commandKey === "end") {
    resetContext(context);
    return "Returned to user EXEC mode.";
  }

  return "Command recognized but not implemented.";
}