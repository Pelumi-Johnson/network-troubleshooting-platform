import type { LabAttempt, LabProgress } from "@/lib/api/progressApi";

type LabSummary = {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  category: string;
  estimatedMinutes: number;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
};

export function getAchievements({
  labs,
  progress,
  attempts,
}: {
  labs: LabSummary[];
  progress: LabProgress[];
  attempts: LabAttempt[];
}): Achievement[] {
  const completedSlugs = new Set(progress.map((item) => item.labSlug));
  const completedCategories = new Set(
    labs
      .filter((lab) => completedSlugs.has(lab.slug))
      .map((lab) => lab.category)
  );

  const hasPerfectScore = attempts.some((attempt) => attempt.score === 100);
  const completedAllLabs = labs.length > 0 && progress.length === labs.length;

  return [
    {
      id: "first-lab",
      title: "First Lab Completed",
      description: "Complete your first troubleshooting lab.",
      unlocked: progress.length >= 1,
    },
    {
      id: "perfect-score",
      title: "Perfect Score",
      description: "Complete any lab with a score of 100.",
      unlocked: hasPerfectScore,
    },
    {
      id: "three-labs",
      title: "Troubleshooter",
      description: "Complete at least 3 labs.",
      unlocked: progress.length >= 3,
    },
    {
      id: "all-labs",
      title: "Current Track Completed",
      description: "Complete all currently available labs.",
      unlocked: completedAllLabs,
    },
    {
      id: "switching-started",
      title: "Switching Started",
      description: "Complete a switching lab.",
      unlocked: completedCategories.has("switching"),
    },
    {
      id: "subnetting-started",
      title: "Subnetting Started",
      description: "Complete a subnetting lab.",
      unlocked: completedCategories.has("subnetting"),
    },
    {
      id: "dns-started",
      title: "DNS Debugger",
      description: "Complete a DNS troubleshooting lab.",
      unlocked: completedCategories.has("dns"),
    },
    {
      id: "five-attempts",
      title: "Practice Mode",
      description: "Complete 5 total lab attempts.",
      unlocked: attempts.length >= 5,
    },
  ];
}