import { prisma } from "../db/prisma";
import { labsService } from "./labsService";
import { identityService } from "./identityService";

type CliMode = "user" | "privileged" | "global_config" | "interface_config";

type CliContext = {
  mode: CliMode;
  interfaceName?: string | null;
};

export type LabSessionStatus = "in_progress" | "completed" | "abandoned";

export type LabSession = {
  sessionId: string;
  labId: string;
  labSlug: string;
  userId: string;
  status: LabSessionStatus;
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
    userId: record.userId,
    status: record.status as LabSessionStatus,
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

    const demoUser = await identityService.getDemoUser();

    await prisma.labSession.updateMany({
      where: {
        labSlug: lab.slug,
        userId: demoUser.id,
        status: "in_progress",
      },
      data: {
        status: "abandoned",
        completedAt: new Date(),
      },
    });

    const initialState = cloneData(lab.initialState);
    const cliContexts = buildInitialCliContexts(initialState);

    const session = await prisma.labSession.create({
      data: {
        labId: lab.id,
        labSlug: lab.slug,
        userId: demoUser.id,
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

  async getActiveSessions(): Promise<LabSession[]> {
    const demoUser = await identityService.getDemoUser();

    const sessions = await prisma.labSession.findMany({
      where: {
        userId: demoUser.id,
        status: "in_progress",
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    return sessions.map(toSession);
  }

  async getActiveSessionBySlug(slug: string): Promise<LabSession | null> {
    const demoUser = await identityService.getDemoUser();

    const session = await prisma.labSession.findFirst({
      where: {
        userId: demoUser.id,
        labSlug: slug,
        status: "in_progress",
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    if (!session) {
      return null;
    }

    return toSession(session);
  }

  async clearActiveSession(slug: string) {
    const demoUser = await identityService.getDemoUser();

    await prisma.labSession.updateMany({
      where: {
        userId: demoUser.id,
        labSlug: slug,
        status: "in_progress",
      },
      data: {
        status: "abandoned",
        completedAt: new Date(),
      },
    });

    return {
      ok: true,
      labSlug: slug,
    };
  }

  async updateSession(session: LabSession): Promise<LabSession> {
    const updated = await prisma.labSession.update({
      where: {
        id: session.sessionId,
      },
      data: {
        userId: session.userId,
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