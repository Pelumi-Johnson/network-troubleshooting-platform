export type SessionStatus = "in_progress" | "completed";

export interface LabRuntimeState {
  devices: Record<string, DeviceState>;
}

export type DeviceState = PcState | SwitchState | RouterState;

export interface PcState {
  type: "pc";
  network: {
    ip: string;
    mask: string;
    gateway: string;
  };
}

export interface SwitchState {
  type: "switch";
  ports: Record<string, SwitchPortState>;
}

export interface SwitchPortState {
  status: "up" | "down";
}

export interface RouterState {
  type: "router";
  interfaces: Record<string, RouterInterfaceState>;
}

export interface RouterInterfaceState {
  ip: string;
  mask: string;
  status: "up" | "down";
}

export interface LabSession {
  sessionId: string;
  labId: string;
  userId: string;
  status: SessionStatus;
  selectedDeviceId: string | null;
  score: number;
  hintsUsed: number;
  state: LabRuntimeState;
  commandHistory: CommandHistoryEntry[];
  startedAt: string;
  completedAt: string | null;
}

export interface CommandHistoryEntry {
  deviceId: string;
  command: string;
  output: string;
  timestamp: string;
}