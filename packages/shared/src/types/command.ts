import type { LabDefinition } from "./lab";
import type { LabSession, SessionStatus } from "./session";

export type CommandKey =
  | "ipconfig"
  | "ping"
  | "set_gateway"
  | "show_ip_interface_brief";

export interface ParsedCommand {
  commandKey: CommandKey;
  raw: string;
  args: Record<string, string>;
}

export interface ExecuteCommandRequest {
  deviceId: string;
  command: string;
}

export interface ExecuteCommandResponse {
  ok: boolean;
  deviceId: string;
  command: string;
  output: string;
  status: SessionStatus;
  score: number;
  completed: boolean;
  completionMessage?: string;
}

export interface CommandExecutionContext {
  lab: LabDefinition;
  session: LabSession;
  deviceId: string;
  parsedCommand: ParsedCommand;
}

export interface CommandExecutionResult {
  output: string;
  updatedSession?: LabSession;
}