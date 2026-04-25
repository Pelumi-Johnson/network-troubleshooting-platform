import crypto from "crypto";
import { labsService } from "./labsService";

type CliMode = "user" | "privileged" | "global_config" | "interface_config";

interface CliContext {
  mode: CliMode;
  interfaceName?: string | null;
}

interface LabSession {
  sessionId: string;
  labId: string;
  userId: string;
  status: "in_progress" | "completed";
  selectedDeviceId: string | null;
  score: number;
  hintsUsed: number;
  state: any;
  cliContexts: Record<string, CliContext>;
  commandHistory: any[];
  startedAt: string;
  completedAt: string | null;
}

const sessions = new Map<string, LabSession>();

class LabSessionsService {
  startSession(slug: string): LabSession | null {
    const lab = labsService.getLabBySlug(slug);

    if (!lab) {
      return null;
    }

    const sessionId = crypto.randomUUID();

    const session: LabSession = {
      sessionId,
      labId: lab.id,
      userId: "demo-user",
      status: "in_progress",
      selectedDeviceId: null,
      score: lab.scoring.baseScore,
      hintsUsed: 0,
      state: structuredClone(lab.initialState),
      cliContexts: {},
      commandHistory: [],
      startedAt: new Date().toISOString(),
      completedAt: null,
    };

    for (const [deviceId, device] of Object.entries(session.state.devices) as any[]) {
      if (device.type === "router") {
        session.cliContexts[deviceId] = {
          mode: "user",
          interfaceName: null,
        };
      }
    }

    sessions.set(sessionId, session);

    return session;
  }

  getSession(sessionId: string): LabSession | null {
    return sessions.get(sessionId) || null;
  }
}

export const labSessionsService = new LabSessionsService();