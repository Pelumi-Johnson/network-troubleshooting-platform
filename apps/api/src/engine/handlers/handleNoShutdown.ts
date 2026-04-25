export function handleNoShutdown(device: any, interfaceName?: string): string {
  if (!device || device.type !== "router") {
    return "no shutdown is only available on router devices.";
  }

  if (!device.interfaces) {
    return "No interfaces found on this device.";
  }

  if (!interfaceName) {
    return [
      "% Incomplete command.",
      "Hint: Enter interface configuration mode first using 'interface <name>'.",
      "Example: interface g0/0",
    ].join("\n");
  }

  const iface = device.interfaces[interfaceName];

  if (!iface) {
    return [
      `% Invalid interface ${interfaceName}`,
      "Hint: Use 'show ip interface brief' to view available interfaces.",
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