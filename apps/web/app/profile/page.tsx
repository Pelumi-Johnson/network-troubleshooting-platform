"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
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

function getCategoryStyle(category: string) {
  const styles: Record<string, string> = {
    dns: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    routing: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    switching: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    subnetting: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    "default-gateway": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };

  return (
    styles[category] ||
    "bg-slate-500/15 text-slate-400 border-slate-500/30"
  );
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
          err instanceof Error ? err.message : "Failed to load profile data."
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

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8">
        Checking login...
      </main>
    );
  }

  const completedCount = progress.length;
  const totalLabs = labs.length;
  const activeCount = activeSessions.length;
  const totalAttempts = attempts.length;

  const averageScore =
    completedCount > 0
      ? Math.round(
          progress.reduce((total, item) => total + item.score, 0) /
            completedCount
        )
      : 0;

  const bestScore =
    progress.length > 0 ? Math.max(...progress.map((item) => item.score)) : 0;

  const completionPercent =
    totalLabs > 0 ? Math.round((completedCount / totalLabs) * 100) : 0;

  const recentAttempts = [...attempts]
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )
    .slice(0, 8);

  const categoryStats = groupProgressByCategory(labs, progress);
  const achievements = getAchievements({ labs, progress, attempts });
  const unlockedAchievements = achievements.filter((item) => item.unlocked);
  const lockedAchievements = achievements.filter((item) => !item.unlocked);

  const displayName = user?.name || user?.email || "User";

  return (
    <AppShell
      title="Profile"
      subtitle="Track your troubleshooting performance, achievements, attempts, and active lab sessions."
    >
      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-slate-400">
          Loading profile...
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-950/40 border border-red-700 rounded-2xl p-8 text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <section className="grid grid-cols-1 2xl:grid-cols-12 gap-6 items-stretch mb-6">
            <div className="2xl:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-5 mb-6">
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-950/40">
                  {getInitials(displayName)}
                </div>

                <div>
                  <p className="text-slate-400 text-sm">Signed in as</p>
                  <h2 className="text-2xl font-bold">{displayName}</h2>
                  <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-slate-500 text-sm">Track Completion</p>
                    <p className="text-5xl font-black text-blue-400 mt-1">
                      {completionPercent}%
                    </p>
                  </div>

                  <p className="text-slate-400 text-sm">
                    {completedCount} of {totalLabs} labs
                  </p>
                </div>

                <div className="h-4 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="2xl:col-span-7 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl shadow-black/15">
                <p className="text-slate-500 text-xs uppercase tracking-wide">
                  Completed
                </p>
                <p className="text-4xl font-black text-green-400 mt-3">
                  {completedCount}
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl shadow-black/15">
                <p className="text-slate-500 text-xs uppercase tracking-wide">
                  Active
                </p>
                <p className="text-4xl font-black text-yellow-400 mt-3">
                  {activeCount}
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl shadow-black/15">
                <p className="text-slate-500 text-xs uppercase tracking-wide">
                  Attempts
                </p>
                <p className="text-4xl font-black text-violet-400 mt-3">
                  {totalAttempts}
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl shadow-black/15">
                <p className="text-slate-500 text-xs uppercase tracking-wide">
                  Avg Score
                </p>
                <p className="text-4xl font-black mt-3">{averageScore}</p>
              </div>

              <div className="col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl shadow-black/15">
                <p className="text-slate-500 text-xs uppercase tracking-wide">
                  Best Score
                </p>
                <p className="text-4xl font-black text-blue-400 mt-3">
                  {bestScore}
                </p>
              </div>

              <div className="col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl shadow-black/15">
                <p className="text-slate-500 text-xs uppercase tracking-wide">
                  Achievements
                </p>
                <p className="text-4xl font-black text-emerald-400 mt-3">
                  {unlockedAchievements.length}/{achievements.length}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-6 shadow-xl shadow-black/15">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-6">
              <div>
                <p className="text-blue-400 text-sm font-semibold mb-2">
                  Achievement System
                </p>
                <h2 className="text-3xl font-black">Badges earned</h2>
                <p className="text-slate-400 mt-2">
                  Unlock badges by completing labs, earning perfect scores, and
                  practicing across categories.
                </p>
              </div>

              <div className="bg-blue-500/15 border border-blue-500/30 text-blue-300 rounded-2xl px-5 py-3">
                <p className="text-sm text-blue-300">Unlocked</p>
                <p className="text-2xl font-black">
                  {unlockedAchievements.length}/{achievements.length}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
              {unlockedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="rounded-2xl border bg-green-500/10 border-green-500/30 p-5"
                >
                  <div className="h-12 w-12 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center text-2xl mb-4">
                    🏆
                  </div>

                  <h3 className="font-bold text-green-400 mb-2">
                    {achievement.title}
                  </h3>

                  <p className="text-sm text-slate-400">
                    {achievement.description}
                  </p>
                </div>
              ))}

              {lockedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="rounded-2xl border bg-slate-950 border-slate-800 p-5 opacity-70"
                >
                  <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl mb-4">
                    🔒
                  </div>

                  <h3 className="font-bold text-slate-400 mb-2">
                    {achievement.title}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl shadow-black/15">
              <div className="mb-6">
                <p className="text-blue-400 text-sm font-semibold mb-2">
                  Skill Areas
                </p>
                <h2 className="text-2xl font-black">Progress by Category</h2>
                <p className="text-slate-400 text-sm mt-2">
                  See where your troubleshooting coverage is strongest.
                </p>
              </div>

              <div className="space-y-5">
                {categoryStats.map((item) => (
                  <div
                    key={item.category}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`capitalize text-xs border px-3 py-1 rounded-full ${getCategoryStyle(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>

                      <p className="text-sm text-slate-400">
                        {item.completed}/{item.total}
                      </p>
                    </div>

                    <div className="h-3 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}

                {categoryStats.length === 0 && (
                  <p className="text-slate-500">
                    No lab categories available yet.
                  </p>
                )}
              </div>
            </section>

            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl shadow-black/15">
              <div className="mb-6">
                <p className="text-blue-400 text-sm font-semibold mb-2">
                  Resume Training
                </p>
                <h2 className="text-2xl font-black">Active Sessions</h2>
                <p className="text-slate-400 text-sm mt-2">
                  Continue labs that are still in progress.
                </p>
              </div>

              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-bold">
                        {getLabTitle(labs, session.labSlug)}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Score: {session.score} · Hints Used:{" "}
                        {session.hintsUsed}
                      </p>
                    </div>

                    <Link
                      href={`/labs/${session.labSlug}`}
                      className="bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-2 rounded-xl font-semibold"
                    >
                      Resume
                    </Link>
                  </div>
                ))}

                {activeSessions.length === 0 && (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-slate-500">
                    You do not have any active lab sessions.
                  </div>
                )}
              </div>
            </section>

            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 2xl:col-span-2 shadow-xl shadow-black/15">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <p className="text-blue-400 text-sm font-semibold mb-2">
                    Attempt History
                  </p>
                  <h2 className="text-2xl font-black">Recent Attempts</h2>
                  <p className="text-slate-400 text-sm mt-2">
                    Your latest completed lab attempts and scores.
                  </p>
                </div>

                <Link
                  href="/dashboard"
                  className="bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-xl font-semibold text-center"
                >
                  Continue Labs
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="text-left py-3 pr-4">Lab</th>
                      <th className="text-left py-3 pr-4">Score</th>
                      <th className="text-left py-3 pr-4">Completed</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentAttempts.map((attempt) => (
                      <tr
                        key={attempt.id}
                        className="border-b border-slate-800/70 hover:bg-slate-950/60"
                      >
                        <td className="py-4 pr-4 font-semibold">
                          {getLabTitle(labs, attempt.labSlug)}
                        </td>
                        <td className="py-4 pr-4">
                          <span className="bg-green-500/15 border border-green-500/30 text-green-400 px-3 py-1 rounded-full font-semibold">
                            {attempt.score}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-slate-400">
                          {formatDate(attempt.completedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {recentAttempts.length === 0 && (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-slate-500 mt-5">
                    No completed attempts yet.
                  </div>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </AppShell>
  );
}