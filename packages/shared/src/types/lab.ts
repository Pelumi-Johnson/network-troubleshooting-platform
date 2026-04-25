export type DeviceType = "pc" | "switch" | "router";
export type LabDifficulty = "easy" | "medium" | "hard";

export interface LabDefinition {
  id: string;
  slug: string;
  title: string;
  difficulty: LabDifficulty;
  category: string;
  estimatedMinutes: number;
  scenario: LabScenario;
  topology: TopologyDefinition;
  initialState: import("./session").LabRuntimeState;
  interaction: InteractionDefinition;
  hints: HintDefinition[];
  successConditions: import("./validation").SuccessConditionsDefinition;
  scoring: ScoringDefinition;
}

export interface LabScenario {
  summary: string;
  objective: string;
  completionMessage: string;
}

export interface TopologyDefinition {
  devices: TopologyDevice[];
  links: TopologyLink[];
}

export interface TopologyDevice {
  id: string;
  label: string;
  type: DeviceType;
  position: {
    x: number;
    y: number;
  };
}

export interface TopologyLink {
  id: string;
  from: string;
  to: string;
}

export interface InteractionDefinition {
  allowedCommands: Record<DeviceType, string[]>;
  editableFields: EditableFieldDefinition[];
}

export interface EditableFieldDefinition {
  deviceId: string;
  path: string;
  command: string;
}

export interface HintDefinition {
  level: number;
  text: string;
}

export interface ScoringDefinition {
  baseScore: number;
  hintPenalty: number;
  maxHints: number;
}