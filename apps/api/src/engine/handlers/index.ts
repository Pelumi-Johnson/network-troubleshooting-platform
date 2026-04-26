function isValidIPv4(value: string) {
  const parts = value.split(".");

  if (parts.length !== 4) return false;

  return parts.every((part) => {
    if (!/^\d+$/.test(part)) return false;

    const number = Number(part);

    return number >= 0 && number <= 255;
  });
}

function isValidSubnetMask(value: string) {
  const validMasks = new Set([
    "255.255.255.255",
    "255.255.255.254",
    "255.255.255.252",
    "255.255.255.248",
    "255.255.255.240",
    "255.255.255.224",
    "255.255.255.192",
    "255.255.255.128",
    "255.255.255.0",
    "255.255.254.0",
    "255.255.252.0",
    "255.255.248.0",
    "255.255.240.0",
    "255.255.224.0",
    "255.255.192.0",
    "255.255.128.0",
    "255.255.0.0",
    "255.254.0.0",
    "255.252.0.0",
    "255.248.0.0",
    "255.240.0.0",
    "255.224.0.0",
    "255.192.0.0",
    "255.128.0.0",
    "255.0.0.0",
    "254.0.0.0",
    "252.0.0.0",
    "248.0.0.0",
    "240.0.0.0",
    "224.0.0.0",
    "192.0.0.0",
    "128.0.0.0",
    "0.0.0.0",
  ]);

  return validMasks.has(value);
}

export function handleIpconfig(device: any) {
  if (!device.network) {
    return "No IP configuration found.";
  }

  const lines = [
    "Windows IP Configuration",
    "",
    `IPv4 Address. . . . . . . . . . . : ${device.network.ip}`,
    `Subnet Mask . . . . . . . . . . . : ${device.network.mask}`,
    `Default Gateway . . . . . . . . . : ${device.network.gateway}`,
  ];

  if (device.network.dns !== undefined) {
    lines.push(`DNS Servers . . . . . . . . . . . : ${device.network.dns}`);
  }

  return lines.join("\n");
}

export function handlePing(device: any, target: string, state: any) {
  if (!device.network) {
    return "Ping failed. Device has no network configuration.";
  }

  if (target.toLowerCase() === "google.com") {
    if (device.network.dns === "8.8.8.8") {
      return [
        "Pinging google.com [142.250.190.78] with 32 bytes of data:",
        "Reply from 142.250.190.78: bytes=32 time=14ms TTL=117",
        "Reply from 142.250.190.78: bytes=32 time=13ms TTL=117",
        "",
        "Ping statistics for 142.250.190.78:",
        "    Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)",
      ].join("\n");
    }

    return [
      "Ping request could not find host google.com.",
      "Please check the name and try again.",
    ].join("\n");
  }

  if (target === device.network.gateway) {
    const router = Object.values(state.devices || {}).find(
      (item: any) => item.type === "router"
    ) as any;

    const routerInterfaces = Object.values(router?.interfaces || {}) as any[];
    const matchingInterface = routerInterfaces.find(
      (iface) => iface.ip === target
    );

    if (matchingInterface && matchingInterface.status === "up") {
      return [
        `Pinging ${target} with 32 bytes of data:`,
        `Reply from ${target}: bytes=32 time<1ms TTL=255`,
        `Reply from ${target}: bytes=32 time<1ms TTL=255`,
        "",
        `Ping statistics for ${target}:`,
        "    Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)",
      ].join("\n");
    }

    return [
      `Pinging ${target} with 32 bytes of data:`,
      "Request timed out.",
      "Request timed out.",
      "",
      `Ping statistics for ${target}:`,
      "    Packets: Sent = 2, Received = 0, Lost = 2 (100% loss)",
    ].join("\n");
  }

  if (target === "8.8.8.8") {
    if (device.network.gateway === "192.168.1.1") {
      return [
        "Pinging 8.8.8.8 with 32 bytes of data:",
        "Reply from 8.8.8.8: bytes=32 time=12ms TTL=117",
        "Reply from 8.8.8.8: bytes=32 time=13ms TTL=117",
        "",
        "Ping statistics for 8.8.8.8:",
        "    Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)",
      ].join("\n");
    }

    return [
      "Pinging 8.8.8.8 with 32 bytes of data:",
      "Destination host unreachable.",
      "Destination host unreachable.",
      "",
      "Ping statistics for 8.8.8.8:",
      "    Packets: Sent = 2, Received = 0, Lost = 2 (100% loss)",
    ].join("\n");
  }

  return [
    `Pinging ${target} with 32 bytes of data:`,
    "Request timed out.",
    "Request timed out.",
    "",
    `Ping statistics for ${target}:`,
    "    Packets: Sent = 2, Received = 0, Lost = 2 (100% loss)",
  ].join("\n");
}

export function handleSetGateway(device: any, ip: string) {
  if (!device.network) {
    return "Failed to set gateway. Device has no network configuration.";
  }

  if (!isValidIPv4(ip)) {
    return `Invalid IP address: ${ip}`;
  }

  device.network.gateway = ip;

  return [
    `Default gateway updated to ${ip}.`,
    "Run ipconfig to verify the new configuration.",
  ].join("\n");
}

export function handleSetDns(device: any, ip: string) {
  if (!device.network) {
    return "Failed to set DNS. Device has no network configuration.";
  }

  if (!isValidIPv4(ip)) {
    return `Invalid DNS server address: ${ip}`;
  }

  device.network.dns = ip;

  return [
    `DNS server updated to ${ip}.`,
    "Run ipconfig to verify the new configuration.",
  ].join("\n");
}

export function handleSetSubnetMask(device: any, mask: string) {
  if (!device.network) {
    return "Failed to set subnet mask. Device has no network configuration.";
  }

  if (!isValidSubnetMask(mask)) {
    return [
      `Invalid subnet mask: ${mask}`,
      "Use a valid subnet mask such as 255.255.255.0.",
    ].join("\n");
  }

  device.network.mask = mask;

  return [
    `Subnet mask updated to ${mask}.`,
    "Run ipconfig to verify the new configuration.",
  ].join("\n");
}

export function handleShowIpInterfaceBrief(device: any) {
  if (!device.interfaces) {
    return "Interface              IP-Address      OK? Method Status";
  }

  const lines = ["Interface              IP-Address      OK? Method Status"];

  for (const [name, iface] of Object.entries(device.interfaces) as any[]) {
    lines.push(
      `${name.padEnd(22)} ${String(iface.ip || "unassigned").padEnd(
        15
      )} YES manual ${iface.status}`
    );
  }

  return lines.join("\n");
}

export function handleNoShutdown(device: any, interfaceName?: string) {
  if (!device.interfaces) {
    return "No interfaces found on this device.";
  }

  if (!interfaceName) {
    return "No interface selected.";
  }

  const iface = device.interfaces[interfaceName];

  if (!iface) {
    return `Interface ${interfaceName} not found.`;
  }

  if (iface.status === "up") {
    return `${interfaceName} is already up.`;
  }

  iface.status = "up";

  return `${interfaceName} brought up successfully.`;
}