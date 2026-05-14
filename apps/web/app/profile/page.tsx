"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { getAllLabs } from "@/lib/api/labsApi";
import {
  getAttempts,
  getProgress,
  type LabAttempt,
  type LabProgress,
} from "@/lib/api/progressApi";
import { getActiveLabSessions } from "@/lib/api/labSessionsApi";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { getAchievements } from "@/lib/achievements/achievementRules";

type LabSummary = {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  category: string;
  estimatedMinutes: number;
};

type ActiveSession = {
  sessionId: string;
  labId: string;
  labSlug: string;
  status: string;
  score: number;
  hintsUsed: number;
  startedAt: string;
};

type IconName =
  | "activity"
  | "chart"
  | "check"
  | "crosshair"
  | "file"
  | "globe"
  | "layers"
  | "lock"
  | "trophy"
  | "user";

const iconPaths: Record<IconName, React.ReactNode> = {
  activity: <path d="M3 12h4l2-6 4 12 2-6h6" />,
  chart: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8 16v-5" />
      <path d="M12 16V8" />
      <path d="M16 16v-8" />
    </>
  ),
  check: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  crosshair: (
    <>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
    </>
  ),
  file: (
    <>
      <path d="M6 3h8l4 4v14H6V3Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H5a2 2 0 0 0 0 4h2" />
      <path d="M16 6h3a2 2 0 0 1 0 4h-2" />
      <path d="M12 12v4" />
      <path d="M9 20h6" />
      <path d="M10 16h4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
};

function Icon({
  name,
  className = "",
  filled = false,
  strokeWidth = 1.8,
}: {
  name: IconName;
  className?: string;
  filled?: boolean;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getLabTitle(labs: LabSummary[], slug: string) {
  return labs.find((lab) => lab.slug === slug)?.title || slug;
}

function getInitials(nameOrEmail: string | undefined) {
  if (!nameOrEmail) return "U";

  const cleaned = nameOrEmail.trim();

  if (cleaned.includes("@")) {
    return cleaned[0]?.toUpperCase() || "U";
  }

  const parts = cleaned.split(" ").filter(Boolean);

  if (parts.length === 1) {
    return parts[0][0]?.toUpperCase() || "U";
  }

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function formatCategory(category: string) {
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function groupProgressByCategory(labs: LabSummary[], progress: LabProgress[]) {
  const progressSlugs = new Set(progress.map((item) => item.labSlug));
  const categoryMap: Record<string, { total: number; completed: number }> = {};

  for (const lab of labs) {
    if (!categoryMap[lab.category]) {
      categoryMap[lab.category] = {
        total: 0,
        completed: 0,
      };
    }

    categoryMap[lab.category].total += 1;

    if (progressSlugs.has(lab.slug)) {
      categoryMap[lab.category].completed += 1;
    }
  }

  return Object.entries(categoryMap).map(([category, stats]) => ({
    category,
    ...stats,
    percent:
      stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
  }));
}

function StatusValue({
  tone = "slate",
  children,
}: {
  tone?: "red" | "amber" | "green" | "cyan" | "slate";
  children: React.ReactNode;
}) {
  const styles = {
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    amber: "text-amber-300 bg-amber-400/10 border-amber-400/20",
    green: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
    cyan: "text-cyan-300 bg-cyan-400/10 border-cyan-400/20",
    slate: "text-slate-300 bg-white/[0.05] border-white/[0.08]",
  };

  return (
    <span
      className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function SectionTitle({
  icon,
  title,
  right,
}: {
  icon?: IconName;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em] text-emerald-300">
        {icon ? <Icon name={icon} className="h-4 w-4" /> : null}
        {title}
      </h3>
      {right}
    </div>
  );
}

function LoadingPanel() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1480px] p-4 lg:p-5">
        <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-8 text-slate-400 shadow-[0_24px_90px_rgba(0,0,0,.35)]">
          Loading profile...
        </div>
      </div>
    </AppShell>
  );
}

function ErrorPanel({ error }: { error: string }) {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1480px] p-4 lg:p-5">
        <div className="rounded-3xl border border-red-500/30 bg-red-950/40 p-8 text-red-300 shadow-[0_24px_90px_rgba(0,0,0,.35)]">
          {error}
        </div>
      </div>
    </AppShell>
  );
}

function ProfileHero({
  displayName,
  email,
  initials,
  score,
  completedCount,
  totalLabs,
  activeCount,
}: {
  displayName: string;
  email?: string;
  initials: string;
  score: number;
  completedCount: number;
  totalLabs: number;
  activeCount: number;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-slate-950/45 p-5 shadow-[0_16px_50px_rgba(0,0,0,.35),inset_0_1px_0_rgba(255,255,255,.04)]">
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_30%_0%,rgba(45,212,191,.12),transparent_30%),radial-gradient(circle_at_95%_20%,rgba(52,211,153,.08),transparent_26%)]" />
      <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-300/30 to-transparent" />

      <div className="relative flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border border-emerald-300/30 bg-emerald-300/10 text-2xl font-black text-emerald-200 shadow-[0_0_35px_rgba(52,211,153,.16)]">
            {initials}
          </div>

          <div>
            <p className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-emerald-300">
              <Icon name="user" className="h-4 w-4" /> Profile
            </p>

            <h2 className="text-2xl font-semibold tracking-tight text-slate-100 lg:text-[30px]">
              {displayName}
            </h2>

            <p className="mt-1 text-xs text-slate-500">{email}</p>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
              Your troubleshooting history, skill growth, badges, diagnosis
              accuracy, and evidence discipline are tracked here.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <StatusValue tone="green">
                {completedCount}/{totalLabs} Labs Completed
              </StatusValue>
              <StatusValue tone="cyan">{activeCount} Active Sessions</StatusValue>
              <StatusValue tone="amber">Layer Discipline Focus</StatusValue>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-black/25 px-5 py-4 text-right">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">
            Engineer Mindset
          </p>
          <p className="font-mono text-4xl text-slate-100">{score}</p>
          <p className="mt-1 text-xs text-emerald-300">Performance index</p>
          <p className="mt-2 max-w-[210px] text-[11px] leading-4 text-slate-500">
            Built from completion rate, scores, active practice, and earned
            achievements.
          </p>
        </div>
      </div>
    </section>
  );
}

function GrowthSummary({
  averageScore,
  completionPercent,
  bestCategory,
}: {
  averageScore: number;
  completionPercent: number;
  bestCategory: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-slate-950/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
      <div className="absolute -right-20 top-0 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative">
        <SectionTitle icon="activity" title="Growth Summary" />

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-emerald-300/15 bg-emerald-300/[0.055] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300">
              Strongest Signal
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-100">
              {averageScore > 0 ? `${averageScore}% Avg Score` : "Start scoring"}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Your average score reflects how consistently you complete labs
              with clean evidence.
            </p>
          </div>

          <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.055] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-300">
              Track Completion
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-100">
              {completionPercent}%
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Keep building coverage across DNS, routing, switching, subnetting,
              and gateway scenarios.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-black/20 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Best Practice Area
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-100">
              {bestCategory}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Use your strongest category as the baseline for weaker areas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Snapshot({
  completedCount,
  activeCount,
  totalAttempts,
  bestScore,
}: {
  completedCount: number;
  activeCount: number;
  totalAttempts: number;
  bestScore: number;
}) {
  const stats = [
    ["Completed", String(completedCount).padStart(2, "0")],
    ["Active", String(activeCount).padStart(2, "0")],
    ["Attempts", String(totalAttempts).padStart(2, "0")],
    ["Best Score", String(bestScore)],
  ];

  return (
    <section className="rounded-xl border border-white/[0.08] bg-slate-950/55 p-5">
      <SectionTitle title="Profile Snapshot" />

      <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-white/[0.07] overflow-hidden rounded-lg border border-white/[0.06]">
        {stats.map(([label, value]) => (
          <div key={label} className="p-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-2xl text-slate-100">{value}</p>
          </div>
        ))}
      </div>

      <svg className="mt-4 h-16 w-full" viewBox="0 0 300 70" fill="none">
        <path
          d="M2 55 C18 55, 22 50, 36 52 C50 54, 48 33, 65 36 C78 39, 78 20, 95 28 C112 36, 118 32, 130 28 C146 22, 152 36, 168 40 C182 44, 192 30, 204 32 C218 34, 220 16, 232 22 C246 30, 250 44, 265 28 C278 14, 284 34, 298 30"
          stroke="#34d399"
          strokeWidth="2"
        />
      </svg>
    </section>
  );
}

function SkillIntelligence({
  averageScore,
  bestScore,
  completionPercent,
  unlockedCount,
  achievementCount,
}: {
  averageScore: number;
  bestScore: number;
  completionPercent: number;
  unlockedCount: number;
  achievementCount: number;
}) {
  const achievementPercent =
    achievementCount > 0 ? Math.round((unlockedCount / achievementCount) * 100) : 0;

  const signals = [
    {
      label: "Evidence Discipline",
      value: Math.max(averageScore, completionPercent),
      note: "Collected proof before changing configs.",
      icon: "file" as IconName,
    },
    {
      label: "Layer Discipline",
      value: completionPercent,
      note: "Coverage across troubleshooting categories.",
      icon: "layers" as IconName,
    },
    {
      label: "Root-Cause Accuracy",
      value: averageScore,
      note: "Diagnoses matched expected lab outcomes.",
      icon: "crosshair" as IconName,
    },
    {
      label: "Repair Validation",
      value: Math.max(bestScore, achievementPercent),
      note: "Fixes validated with scoring and badge unlocks.",
      icon: "check" as IconName,
    },
  ];

  return (
    <section className="rounded-xl border border-white/[0.08] bg-slate-950/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
      <SectionTitle
        icon="crosshair"
        title="Skill Intelligence"
        right={<span className="text-[11px] font-medium text-emerald-300">Live Data</span>}
      />

      <div className="grid gap-3 md:grid-cols-2">
        {signals.map(({ label, value, note, icon }) => (
          <div
            key={label}
            className="rounded-xl border border-white/[0.08] bg-black/20 p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Icon name={icon} className="h-4 w-4 text-emerald-300" />
                {label}
              </span>
              <span className="font-mono text-sm text-slate-100">{value}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300"
                style={{ width: `${Math.min(value, 100)}%` }}
              />
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-500">{note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryConfidence({
  categoryStats,
}: {
  categoryStats: ReturnType<typeof groupProgressByCategory>;
}) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-slate-950/45 p-4">
      <div className="absolute -bottom-10 right-0 h-40 w-52 opacity-40">
        <svg viewBox="0 0 260 160" className="h-full w-full" fill="none">
          {Array.from({ length: 10 }).map((_, index) => (
            <path
              key={index}
              d={`M0 ${125 - index * 8} C 70 ${
                100 - index * 5
              }, 100 ${150 - index * 10}, 160 ${
                90 - index * 7
              } S 220 ${80 - index * 6}, 260 ${60 - index * 5}`}
              stroke="rgba(45,212,191,.35)"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>

      <SectionTitle title="Category Confidence" />

      <div className="relative space-y-3">
        {categoryStats.length > 0 ? (
          categoryStats.map((item) => (
            <div key={item.category}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-slate-400">{formatCategory(item.category)}</span>
                <span className="font-mono text-slate-200">{item.percent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">No category progress yet.</p>
        )}
      </div>
    </section>
  );
}

function AchievementsPanel({
  unlockedAchievements,
  lockedAchievements,
}: {
  unlockedAchievements: ReturnType<typeof getAchievements>;
  lockedAchievements: ReturnType<typeof getAchievements>;
}) {
  const visibleUnlocked = unlockedAchievements.slice(0, 4);
  const visibleLocked = lockedAchievements.slice(0, 2);

  return (
    <section className="rounded-xl border border-white/[0.08] bg-slate-950/45 p-4">
      <SectionTitle
        title="Badges"
        right={<span className="text-[11px] font-medium text-emerald-300">View All</span>}
      />

      <div className="grid grid-cols-2 gap-2">
        {visibleUnlocked.map((achievement) => (
          <div
            key={achievement.id}
            className="min-h-[94px] rounded-lg border border-emerald-300/20 bg-emerald-300/[0.055] p-3"
          >
            <Icon name="trophy" className="h-6 w-6 text-emerald-300" />
            <p className="mt-2 text-[12px] font-semibold text-slate-200">
              {achievement.title}
            </p>
            <p className="mt-1 text-[11px] leading-4 text-slate-500">
              {achievement.description}
            </p>
          </div>
        ))}

        {visibleLocked.map((achievement) => (
          <div
            key={achievement.id}
            className="min-h-[94px] rounded-lg border border-white/[0.08] bg-white/[0.025] p-3 opacity-70"
          >
            <Icon name="lock" className="h-6 w-6 text-slate-500" />
            <p className="mt-2 text-[12px] font-semibold text-slate-400">
              {achievement.title}
            </p>
            <p className="mt-1 text-[11px] leading-4 text-slate-600">
              {achievement.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.045] p-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-300">
          Badge Progress
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-100">
          {unlockedAchievements.length} unlocked /{" "}
          {unlockedAchievements.length + lockedAchievements.length} total
        </p>
      </div>
    </section>
  );
}

function ActiveSessionsPanel({
  activeSessions,
  labs,
}: {
  activeSessions: ActiveSession[];
  labs: LabSummary[];
}) {
  return (
    <section className="rounded-xl border border-white/[0.08] bg-slate-950/45 p-4">
      <SectionTitle
        title="Active Sessions"
        right={
          <Link href="/dashboard" className="text-[11px] font-medium text-emerald-300">
            Dashboard
          </Link>
        }
      />

      <div className="space-y-3">
        {activeSessions.length > 0 ? (
          activeSessions.map((session) => (
            <div
              key={session.sessionId}
              className="flex items-center justify-between gap-4 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-200">
                  {getLabTitle(labs, session.labSlug)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Score {session.score} · Hints {session.hintsUsed}
                </p>
              </div>

              <Link
                href={`/labs/${session.labSlug}`}
                className="shrink-0 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-400 px-3 py-2 text-xs font-bold text-slate-950"
              >
                Resume
              </Link>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-4 text-sm text-slate-500">
            No active lab sessions.
          </div>
        )}
      </div>
    </section>
  );
}

function TicketHistory({
  recentAttempts,
  labs,
}: {
  recentAttempts: LabAttempt[];
  labs: LabSummary[];
}) {
  return (
    <section className="rounded-xl border border-white/[0.08] bg-slate-950/45 p-4">
      <SectionTitle
        title="Recent Attempts"
        right={
          <Link href="/dashboard" className="text-[11px] font-medium text-emerald-300">
            Continue Labs
          </Link>
        }
      />

      <div className="overflow-x-auto rounded-lg">
        <table className="w-full min-w-[620px] text-left text-xs">
          <thead className="text-[10px] uppercase text-slate-500">
            <tr>
              <th className="pb-3 font-medium">Lab</th>
              <th className="pb-3 font-medium">Score</th>
              <th className="pb-3 text-right font-medium">Completed</th>
            </tr>
          </thead>

          <tbody>
            {recentAttempts.map((attempt, index) => (
              <tr
                key={attempt.id}
                className={`border-t border-white/[0.06] ${
                  index === 0 ? "bg-emerald-400/[0.055]" : ""
                }`}
              >
                <td className="py-2.5 text-slate-300">
                  {getLabTitle(labs, attempt.labSlug)}
                </td>
                <td className="py-2.5">
                  <StatusValue tone="green">{attempt.score}</StatusValue>
                </td>
                <td className="py-2.5 text-right text-slate-500">
                  {formatDate(attempt.completedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {recentAttempts.length === 0 ? (
          <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.025] p-4 text-sm text-slate-500">
            No completed attempts yet.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function RecentActivityPanel({
  recentAttempts,
  activeSessions,
  labs,
}: {
  recentAttempts: LabAttempt[];
  activeSessions: ActiveSession[];
  labs: LabSummary[];
}) {
  const activity = [
    ...activeSessions.slice(0, 3).map((session) => ({
      action: "Active session",
      target: getLabTitle(labs, session.labSlug),
      time: "In progress",
    })),
    ...recentAttempts.slice(0, 4).map((attempt) => ({
      action: "Completed attempt",
      target: getLabTitle(labs, attempt.labSlug),
      time: formatDate(attempt.completedAt),
    })),
  ].slice(0, 5);

  return (
    <section className="rounded-xl border border-white/[0.08] bg-slate-950/45 p-4">
      <SectionTitle title="Recent Activity" />

      <div className="space-y-2">
        {activity.length > 0 ? (
          activity.map((item) => (
            <div
              key={`${item.action}-${item.target}-${item.time}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-emerald-300/25 bg-emerald-300/10 text-emerald-300">
                  <Icon name="activity" className="h-3.5 w-3.5" />
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-300">
                    {item.action}
                  </p>
                  <p className="truncate text-xs text-slate-500">{item.target}</p>
                </div>
              </div>

              <span className="shrink-0 text-xs text-slate-500">{item.time}</span>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-4 text-sm text-slate-500">
            No activity yet.
          </div>
        )}
      </div>
    </section>
  );
}

function RightRail({
  completedCount,
  activeCount,
  totalAttempts,
  bestScore,
  categoryStats,
  unlockedAchievements,
  lockedAchievements,
  activeSessions,
  labs,
}: {
  completedCount: number;
  activeCount: number;
  totalAttempts: number;
  bestScore: number;
  categoryStats: ReturnType<typeof groupProgressByCategory>;
  unlockedAchievements: ReturnType<typeof getAchievements>;
  lockedAchievements: ReturnType<typeof getAchievements>;
  activeSessions: ActiveSession[];
  labs: LabSummary[];
}) {
  return (
    <aside className="space-y-4">
      <Snapshot
        completedCount={completedCount}
        activeCount={activeCount}
        totalAttempts={totalAttempts}
        bestScore={bestScore}
      />
      <CategoryConfidence categoryStats={categoryStats} />
      <AchievementsPanel
        unlockedAchievements={unlockedAchievements}
        lockedAchievements={lockedAchievements}
      />
      <ActiveSessionsPanel activeSessions={activeSessions} labs={labs} />
    </aside>
  );
}

export default function ProfilePage() {
  const { user, checkingAuth } = useRequireAuth();

  const [labs, setLabs] = useState<LabSummary[]>([]);
  const [progress, setProgress] = useState<LabProgress[]>([]);
  const [attempts, setAttempts] = useState<LabAttempt[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (checkingAuth) return;

    let cancelled = false;

    async function loadProfile() {
      try {
        const [labsData, progressData, attemptsData, activeSessionData] =
          await Promise.all([
            getAllLabs(),
            getProgress(),
            getAttempts(),
            getActiveLabSessions(),
          ]);

        if (cancelled) return;

        setLabs(labsData);
        setProgress(progressData);
        setAttempts(attemptsData);
        setActiveSessions(activeSessionData);
        setError("");
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "Failed to load profile data.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [checkingAuth]);

  const metrics = useMemo(() => {
    const completedCount = progress.length;
    const totalLabs = labs.length;
    const activeCount = activeSessions.length;
    const totalAttempts = attempts.length;

    const averageScore =
      completedCount > 0
        ? Math.round(
            progress.reduce((total, item) => total + item.score, 0) /
              completedCount,
          )
        : 0;

    const bestScore =
      progress.length > 0 ? Math.max(...progress.map((item) => item.score)) : 0;

    const completionPercent =
      totalLabs > 0 ? Math.round((completedCount / totalLabs) * 100) : 0;

    const recentAttempts = [...attempts]
      .sort(
        (a, b) =>
          new Date(b.completedAt).getTime() -
          new Date(a.completedAt).getTime(),
      )
      .slice(0, 8);

    const categoryStats = groupProgressByCategory(labs, progress);

    const bestCategory =
      categoryStats.length > 0
        ? formatCategory(
            [...categoryStats].sort((a, b) => b.percent - a.percent)[0]
              .category,
          )
        : "Build first category";

    const achievements = getAchievements({ labs, progress, attempts });
    const unlockedAchievements = achievements.filter((item) => item.unlocked);
    const lockedAchievements = achievements.filter((item) => !item.unlocked);

    const engineerMindset = Math.min(
      999,
      Math.round(
        completionPercent * 3 +
          averageScore * 3 +
          unlockedAchievements.length * 20 +
          activeCount * 10,
      ),
    );

    return {
      completedCount,
      totalLabs,
      activeCount,
      totalAttempts,
      averageScore,
      bestScore,
      completionPercent,
      recentAttempts,
      categoryStats,
      bestCategory,
      achievements,
      unlockedAchievements,
      lockedAchievements,
      engineerMindset,
    };
  }, [activeSessions.length, attempts, labs, progress]);

  if (checkingAuth || loading) {
    return <LoadingPanel />;
  }

  if (error) {
    return <ErrorPanel error={error} />;
  }

  const displayName = user?.name || user?.email || "User";
  const initials = getInitials(displayName);

  return (
    <AppShell>
      <div className="mx-auto grid max-w-[1480px] gap-4 p-4 lg:p-5 2xl:grid-cols-[minmax(0,1fr)_344px]">
        <div className="min-w-0 space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.055] px-4 py-3 text-sm text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
            <span className="flex min-w-0 items-center gap-2">
              <Icon
                name="activity"
                className="h-4 w-4 shrink-0 text-emerald-300"
              />
              <span className="truncate">
                Profile loaded. Review long-term progress, scores, and
                troubleshooting habits here.
              </span>
            </span>

            <span className="hidden text-[11px] uppercase tracking-widest text-emerald-300/80 md:inline">
              Profile Status
            </span>
          </div>

          <ProfileHero
            displayName={displayName}
            email={user?.email}
            initials={initials}
            score={metrics.engineerMindset}
            completedCount={metrics.completedCount}
            totalLabs={metrics.totalLabs}
            activeCount={metrics.activeCount}
          />

          <GrowthSummary
            averageScore={metrics.averageScore}
            completionPercent={metrics.completionPercent}
            bestCategory={metrics.bestCategory}
          />

          <SkillIntelligence
            averageScore={metrics.averageScore}
            bestScore={metrics.bestScore}
            completionPercent={metrics.completionPercent}
            unlockedCount={metrics.unlockedAchievements.length}
            achievementCount={metrics.achievements.length}
          />

          <TicketHistory recentAttempts={metrics.recentAttempts} labs={labs} />

          <RecentActivityPanel
            recentAttempts={metrics.recentAttempts}
            activeSessions={activeSessions}
            labs={labs}
          />
        </div>

        <RightRail
          completedCount={metrics.completedCount}
          activeCount={metrics.activeCount}
          totalAttempts={metrics.totalAttempts}
          bestScore={metrics.bestScore}
          categoryStats={metrics.categoryStats}
          unlockedAchievements={metrics.unlockedAchievements}
          lockedAchievements={metrics.lockedAchievements}
          activeSessions={activeSessions}
          labs={labs}
        />
      </div>
    </AppShell>
  );
}