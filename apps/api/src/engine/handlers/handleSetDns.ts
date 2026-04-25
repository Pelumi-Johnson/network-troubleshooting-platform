export function handleSetDns(device: any, newDns: string): string {
  if (!device || device.type !== "pc") {
    return "set dns is only available on PC devices.";
  }

  const oldDns = device.network.dns || "not configured";

  device.network.dns = newDns;

  return [
    "DNS server updated.",
    `Old DNS: ${oldDns}`,
    `New DNS: ${newDns}`,
  ].join("\n");
}