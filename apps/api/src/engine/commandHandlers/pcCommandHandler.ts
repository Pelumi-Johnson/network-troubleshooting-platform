import { ParsedCommand } from "../parsers/commandParser";
import {
  handleIpconfig,
  handlePing,
  handleSetGateway,
  handleSetDns,
  handleSetSubnetMask,
} from "../handlers";

export function handlePcCommand(
  parsed: ParsedCommand,
  device: any,
  state: any
): string {
  if (parsed.commandKey === "ipconfig") {
    return handleIpconfig(device);
  }

  if (parsed.commandKey === "ping") {
    return handlePing(device, parsed.args.target, state);
  }

  if (parsed.commandKey === "set_default_gateway") {
    return handleSetGateway(device, parsed.args.ip);
  }

  if (parsed.commandKey === "set_dns") {
    return handleSetDns(device, parsed.args.ip);
  }

  if (parsed.commandKey === "set_subnet_mask") {
    return handleSetSubnetMask(device, parsed.args.mask);
  }

  return "Command recognized but not implemented.";
}