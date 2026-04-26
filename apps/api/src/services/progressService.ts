import { prisma } from "../db/prisma";

type ProgressRecord = {
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

class ProgressService {
  async getProgress() {
    const progress = await prisma.labProgress.findMany({
      where: {
        userId: null,
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    return progress.map((item: ProgressRecord) => formatProgress(item));
  }

  async saveProgress(labSlug: string, score: number) {
    const existingProgress = await prisma.labProgress.findFirst({
      where: {
        labSlug,
        userId: null,
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
        userId: null,
        score,
      },
    });

    return formatProgress(newProgress);
  }

  async deleteProgress(labSlug: string) {
    const existingProgress = await prisma.labProgress.findFirst({
      where: {
        labSlug,
        userId: null,
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
    await prisma.labProgress.deleteMany({
      where: {
        userId: null,
      },
    });

    return {
      ok: true,
    };
  }
}

export const progressService = new ProgressService();