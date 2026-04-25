export function handleShowIpInterfaceBrief(device: any): string {
  if (!device || device.type !== "router") {
    return "show ip interface brief is only available on router devices.";
  }

  const lines = ["Interface    IP-Address      Status"];

  for (const [interfaceName, iface] of Object.entries(device.interfaces) as any[]) {
    lines.push(
      `${interfaceName.padEnd(12)} ${iface.ip.padEnd(15)} ${iface.status}`
    );
  }

  return lines.join("\n");
}