export function handleSetGateway(device: any, newGateway: string): string {
  if (!device || device.type !== "pc") {
    return "set gateway is only available on PC devices.";
  }

  const oldGateway = device.network.gateway;

  device.network.gateway = newGateway;

  return [
    `Default gateway updated.`,
    `Old Gateway: ${oldGateway}`,
    `New Gateway: ${newGateway}`
  ].join("\n");
}