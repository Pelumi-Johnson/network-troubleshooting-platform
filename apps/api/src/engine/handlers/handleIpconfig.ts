export function handleIpconfig(device: any): string {
  if (!device || device.type !== "pc") {
    return "ipconfig is only available on PC devices.";
  }

  const lines = [
    `IP Address: ${device.network.ip}`,
    `Subnet Mask: ${device.network.mask}`,
    `Default Gateway: ${device.network.gateway}`,
  ];

  if (device.network.dns) {
    lines.push(`DNS Server: ${device.network.dns}`);
  }

  return lines.join("\n");
}