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
  private async getEffectiveUserId(userId?: string) {
    if (userId) {
      return userId;
    }

    const demoUser = await identityService.getDemoUser();
    return demoUser.id;
  }

  async getProgress(userId?: string) {
    const effectiveUserId = await this.getEffectiveUserId(userId);

    const progress = await prisma.labProgress.findMany({
      where: {
        userId: effectiveUserId,
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    return progress.map((item: ProgressRecord) => formatProgress(item));
  }

  async getAttempts(userId?: string) {
    const effectiveUserId = await this.getEffectiveUserId(userId);

    const attempts = await prisma.labAttempt.findMany({
      where: {
        userId: effectiveUserId,
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    return attempts.map((item: AttemptRecord) => formatAttempt(item));
  }

  async saveProgress(labSlug: string, score: number, userId?: string) {
    const effectiveUserId = await this.getEffectiveUserId(userId);

    await prisma.labAttempt.create({
      data: {
        labSlug,
        userId: effectiveUserId,
        score,
      },
    });

    const existingProgress = await prisma.labProgress.findFirst({
      where: {
        labSlug,
        userId: effectiveUserId,
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
        userId: effectiveUserId,
        score,
      },
    });

    return formatProgress(newProgress);
  }

  async deleteProgress(labSlug: string, userId?: string) {
    const effectiveUserId = await this.getEffectiveUserId(userId);

    const existingProgress = await prisma.labProgress.findFirst({
      where: {
        labSlug,
        userId: effectiveUserId,
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

  async clearProgress(userId?: string) {
    const effectiveUserId = await this.getEffectiveUserId(userId);

    await prisma.labProgress.deleteMany({
      where: {
        userId: effectiveUserId,
      },
    });

    return {
      ok: true,
    };
  }

  async clearAttempts(userId?: string) {
    const effectiveUserId = await this.getEffectiveUserId(userId);

    await prisma.labAttempt.deleteMany({
      where: {
        userId: effectiveUserId,
      },
    });

    return {
      ok: true,
    };
  }
}

export const progressService = new ProgressService();