import { prisma } from "../db/prisma";
import { labsService } from "./labsService";

type CliMode = "user" | "privileged" | "global_config" | "interface_config";

type CliContext = {
  mode: CliMode;
  interfaceName?: string | null;
};

export type LabSession = {
  sessionId: string;
  labId: string;
  labSlug: string;
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
};

function cloneData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function buildInitialCliContexts(state: any): Record<string, CliContext> {
  const contexts: Record<string, CliContext> = {};

  for (const [deviceId, device] of Object.entries(state.devices || {}) as any[]) {
    if (device.type === "router") {
      contexts[deviceId] = {
        mode: "user",
        interfaceName: null,
      };
    }
  }

  return contexts;
}

function toSession(record: any): LabSession {
  return {
    sessionId: record.id,
    labId: record.labId,
    labSlug: record.labSlug,
    userId: record.userId || "demo-user",
    status: record.status,
    selectedDeviceId: record.selectedDevice || null,
    score: record.score,
    hintsUsed: record.hintsUsed,
    state: record.state,
    cliContexts: record.cliContexts || {},
    commandHistory: Array.isArray(record.commandHistory)
      ? record.commandHistory
      : [],
    startedAt: record.startedAt.toISOString(),
    completedAt: record.completedAt ? record.completedAt.toISOString() : null,
  };
}

class LabSessionsService {
  async startSession(slug: string): Promise<LabSession | null> {
    const lab = labsService.getLabBySlug(slug);

    if (!lab) {
      return null;
    }

    const initialState = cloneData(lab.initialState);
    const cliContexts = buildInitialCliContexts(initialState);

    const session = await prisma.labSession.create({
      data: {
        labId: lab.id,
        labSlug: lab.slug,
        userId: null,
        status: "in_progress",
        selectedDevice: null,
        score: lab.scoring.baseScore,
        hintsUsed: 0,
        state: initialState,
        cliContexts,
        commandHistory: [],
        completedAt: null,
      },
    });

    return toSession(session);
  }

  async getSession(sessionId: string): Promise<LabSession | null> {
    const session = await prisma.labSession.findUnique({
      where: {
        id: sessionId,
      },
    });

    if (!session) {
      return null;
    }

    return toSession(session);
  }

  async updateSession(session: LabSession): Promise<LabSession> {
    const updated = await prisma.labSession.update({
      where: {
        id: session.sessionId,
      },
      data: {
        status: session.status,
        selectedDevice: session.selectedDeviceId,
        score: session.score,
        hintsUsed: session.hintsUsed,
        state: session.state,
        cliContexts: session.cliContexts,
        commandHistory: session.commandHistory,
        completedAt: session.completedAt ? new Date(session.completedAt) : null,
      },
    });

    return toSession(updated);
  }
}

export const labSessionsService = new LabSessionsService();