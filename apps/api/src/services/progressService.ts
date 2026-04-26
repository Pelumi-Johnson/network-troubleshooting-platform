import { prisma } from "../db/prisma";
import { identityService } from "./identityService";

type ProgressRecord = {
  id: string;
  labSlug: string;
  score: number;
  completedAt: Date;
};

type AttemptRecord = {
  id: string;
  labSlug: string;
  score: number;
  completedAt: Date;
};

function formatProgress(item: ProgressRecord) {
  return {
    id: item.id,
    labSlug: item.labSlug,
    score: item.score,
    completedAt: item.completedAt.toISOString(),
  };
}

function formatAttempt(item: AttemptRecord) {
  return {
    id: item.id,
    labSlug: item.labSlug,
    score: item.score,
    completedAt: item.completedAt.toISOString(),
  };
}

class ProgressService {
  async getProgress() {
    const demoUser = await identityService.getDemoUser();

    const progress = await prisma.labProgress.findMany({
      where: {
        userId: demoUser.id,
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    return progress.map((item: ProgressRecord) => formatProgress(item));
  }

  async getAttempts() {
    const demoUser = await identityService.getDemoUser();

    const attempts = await prisma.labAttempt.findMany({
      where: {
        userId: demoUser.id,
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    return attempts.map((item: AttemptRecord) => formatAttempt(item));
  }

  async saveProgress(labSlug: string, score: number) {
    const demoUser = await identityService.getDemoUser();

    await prisma.labAttempt.create({
      data: {
        labSlug,
        userId: demoUser.id,
        score,
      },
    });

    const existingProgress = await prisma.labProgress.findFirst({
      where: {
        labSlug,
        userId: demoUser.id,
      },
    });

    if (existingProgress) {
      const updatedProgress = await prisma.labProgress.update({
        where: {
          id: existingProgress.id,
        },
        data: {
          score: Math.max(existingProgress.score, score),
          completedAt: new Date(),
        },
      });

      return formatProgress(updatedProgress);
    }

    const newProgress = await prisma.labProgress.create({
      data: {
        labSlug,
        userId: demoUser.id,
        score,
      },
    });

    return formatProgress(newProgress);
  }

  async deleteProgress(labSlug: string) {
    const demoUser = await identityService.getDemoUser();

    const existingProgress = await prisma.labProgress.findFirst({
      where: {
        labSlug,
        userId: demoUser.id,
      },
    });

    if (!existingProgress) {
      return null;
    }

    await prisma.labProgress.delete({
      where: {
        id: existingProgress.id,
      },
    });

    return {
      ok: true,
      labSlug,
    };
  }

  async clearProgress() {
    const demoUser = await identityService.getDemoUser();

    await prisma.labProgress.deleteMany({
      where: {
        userId: demoUser.id,
      },
    });

    return {
      ok: true,
    };
  }

  async clearAttempts() {
    const demoUser = await identityService.getDemoUser();

    await prisma.labAttempt.deleteMany({
      where: {
        userId: demoUser.id,
      },
    });

    return {
      ok: true,
    };
  }
}

export const progressService = new ProgressService();