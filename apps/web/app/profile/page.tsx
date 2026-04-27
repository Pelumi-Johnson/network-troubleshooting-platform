"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllLabs } from "@/lib/api/labsApi";
import {
  getAttempts,
  getProgress,
  type LabAttempt,
  type LabProgress,
} from "@/lib/api/progressApi";
import { getActiveLabSessions } from "@/lib/api/labSessionsApi";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";

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

function groupProgressByCategory(
  labs: LabSummary[],
  progress: LabProgress[]
) {
  const progressSlugs = new Set(progress.map((item) => item.labSlug));
  const categoryMap: Record<
    string,
    {
      total: number;
      completed: number;
    }
  > = {};

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

export default function ProfilePage() {
  const { user, checkingAuth, logout } = useRequireAuth();

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
          err instanceof Error
            ? err.message
            : "Failed to load profile data."
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

  const completionPercent =
    totalLabs > 0 ? Math.round((completedCount / totalLabs) * 100) : 0;

  const recentAttempts = [...attempts]
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )
    .slice(0, 8);

  const categoryStats = groupProgressByCategory(labs, progress);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-slate-800 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <p className="text-blue-400 text-sm font-semibold mb-1">
              Network Troubleshooting Platform
            </p>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-slate-500 text-sm mt-2">
              Signed in as{" "}
              <span className="text-slate-300">
                {user?.name || user?.email}
              </span>
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-300"
            >
              Dashboard
            </Link>

            <button
              type="button"
              onClick={logout}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg px-4 py-2"
            >
              Logout
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 py-10">
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-10">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <p className="text-slate-400 text-sm mb-2">Completion</p>
                <p className="text-3xl font-bold text-blue-400">
                  {completionPercent}%
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <p className="text-slate-400 text-sm mb-2">Completed</p>
                <p className="text-3xl font-bold text-green-400">
                  {completedCount}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <p className="text-slate-400 text-sm mb-2">Active Sessions</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {activeCount}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <p className="text-slate-400 text-sm mb-2">Attempts</p>
                <p className="text-3xl font-bold text-purple-400">
                  {totalAttempts}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <p className="text-slate-400 text-sm mb-2">Average Score</p>
                <p className="text-3xl font-bold">{averageScore}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-1">Progress by Category</h2>
                <p className="text-slate-400 text-sm mb-6">
                  Track which troubleshooting areas you are completing.
                </p>

                <div className="space-y-5">
                  {categoryStats.map((item) => (
                    <div key={item.category}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="capitalize font-semibold">
                          {item.category}
                        </p>
                        <p className="text-sm text-slate-400">
                          {item.completed}/{item.total}
                        </p>
                      </div>

                      <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
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

              <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-1">Active Sessions</h2>
                <p className="text-slate-400 text-sm mb-6">
                  Labs currently in progress.
                </p>

                <div className="space-y-4">
                  {activeSessions.map((session) => (
                    <div
                      key={session.sessionId}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold">
                          {getLabTitle(labs, session.labSlug)}
                        </p>
                        <p className="text-sm text-slate-500">
                          Score: {session.score} · Hints Used:{" "}
                          {session.hintsUsed}
                        </p>
                      </div>

                      <Link
                        href={`/labs/${session.labSlug}`}
                        className="bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold"
                      >
                        Resume
                      </Link>
                    </div>
                  ))}

                  {activeSessions.length === 0 && (
                    <p className="text-slate-500">
                      You do not have any active lab sessions.
                    </p>
                  )}
                </div>
              </section>

              <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 xl:col-span-2">
                <h2 className="text-2xl font-bold mb-1">Recent Attempts</h2>
                <p className="text-slate-400 text-sm mb-6">
                  Your latest completed lab attempts.
                </p>

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
                          className="border-b border-slate-800/70"
                        >
                          <td className="py-3 pr-4">
                            {getLabTitle(labs, attempt.labSlug)}
                          </td>
                          <td className="py-3 pr-4 text-green-400 font-semibold">
                            {attempt.score}
                          </td>
                          <td className="py-3 pr-4 text-slate-400">
                            {formatDate(attempt.completedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {recentAttempts.length === 0 && (
                    <p className="text-slate-500 mt-5">
                      No completed attempts yet.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </section>
    </main>
  );
}