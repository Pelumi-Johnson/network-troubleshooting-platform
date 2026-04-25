function getPcByIp(devices: any, ip: string) {
  return Object.values(devices).find((device: any) => {
    return device.type === "pc" && device.network.ip === ip;
  });
}

function getRouterInterfaceByIp(devices: any, ip: string) {
  for (const device of Object.values(devices) as any[]) {
    if (device.type !== "router") continue;

    for (const iface of Object.values(device.interfaces) as any[]) {
      if (iface.ip === ip && iface.status === "up") {
        return iface;
      }
    }
  }

  return null;
}

function isIpAddress(target: string): boolean {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(target);
}

function isExternalIp(ip: string): boolean {
  return ip === "8.8.8.8" || ip === "1.1.1.1";
}

function isKnownDomain(target: string): boolean {
  return target.toLowerCase() === "google.com";
}

export function handlePing(device: any, target: string, state: any): string {
  if (!device || device.type !== "pc") {
    return "ping is only available on PC devices in this lab.";
  }

  const devices = state.devices;

  if (!isIpAddress(target)) {
    if (!isKnownDomain(target)) {
      return `Ping request could not find host ${target}. Please check the name and try again.`;
    }

    if (device.network.dns === "8.8.8.8") {
      return `Reply from 142.250.190.78: bytes=32 time=18ms TTL=116`;
    }

    return `Ping request could not find host ${target}. Please check the name and try again.`;
  }

  const localPc = getPcByIp(devices, target);

  if (localPc) {
    return `Reply from ${target}: bytes=32 time<1ms TTL=128`;
  }

  const routerInterface = getRouterInterfaceByIp(devices, target);

  if (routerInterface) {
    return `Reply from ${target}: bytes=32 time<1ms TTL=255`;
  }

  if (isExternalIp(target)) {
    if (device.network.gateway === "192.168.1.1") {
      return `Reply from ${target}: bytes=32 time=12ms TTL=57`;
    }

    return "Request timed out.";
  }

  return "Destination host unreachable.";
}