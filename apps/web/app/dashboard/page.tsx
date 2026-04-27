"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllLabs } from "@/lib/api/labsApi";
import {
  clearProgress,
  deleteProgress,
  getAttempts,
  getProgress,
  type LabAttempt,
  type LabProgress,
} from "@/lib/api/progressApi";
import {
  clearActiveLabSession,
  getActiveLabSessions,
} from "@/lib/api/labSessionsApi";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";

type LabSummary = {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  category: string;
  estimatedMinutes: number;
};

function getDifficultyStyle(difficulty: string) {
  if (difficulty === "easy") {
    return "bg-green-500/15 text-green-400 border-green-500/30";
  }

  if (difficulty === "medium") {
    return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  }

  return "bg-red-500/15 text-red-400 border-red-500/30";
}

function getActiveSessionKey(slug: string) {
  return `active-session-${slug}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function progressListToMap(progressList: LabProgress[]) {
  const progressMap: Record<string, LabProgress> = {};

  for (const item of progressList) {
    progressMap[item.labSlug] = item;
  }

  return progressMap;
}

function attemptsListToMap(attemptsList: LabAttempt[]) {
  const attemptsMap: Record<string, LabAttempt[]> = {};

  for (const attempt of attemptsList) {
    if (!attemptsMap[attempt.labSlug]) {
      attemptsMap[attempt.labSlug] = [];
    }

    attemptsMap[attempt.labSlug].push(attempt);
  }

  return attemptsMap;
}

export default function DashboardPage() {
  const { user, checkingAuth, logout } = useRequireAuth();

  const [labs, setLabs] = useState<LabSummary[]>([]);
  const [progress, setProgress] = useState<Record<string, LabProgress>>({});
  const [attempts, setAttempts] = useState<Record<string, LabAttempt[]>>({});
  const [activeSessions, setActiveSessions] = useState<Record<string, boolean>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (checkingAuth) return;

    let cancelled = false;

    async function loadDashboardData() {
      try {
        const labData = await getAllLabs();
        const progressData = await getProgress();
        const attemptsData = await getAttempts();
        const activeSessionData = await getActiveLabSessions();

        if (cancelled) return;

        const sessionMap: Record<string, boolean> = {};

        for (const session of activeSessionData) {
          sessionMap[session.labSlug] = true;
          localStorage.setItem(
            getActiveSessionKey(session.labSlug),
            session.sessionId
          );
        }

        for (const lab of labData) {
          if (!sessionMap[lab.slug]) {
            localStorage.removeItem(getActiveSessionKey(lab.slug));
          }
        }

        setLabs(labData);
        setProgress(progressListToMap(progressData));
        setAttempts(attemptsListToMap(attemptsData));
        setActiveSessions(sessionMap);
        setError("");
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard. Make sure backend is running."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [checkingAuth]);

  async function handleClearProgress() {
    await clearProgress();

    for (const lab of labs) {
      await clearActiveLabSession(lab.slug);
      localStorage.removeItem(getActiveSessionKey(lab.slug));
    }

    setProgress({});
    setActiveSessions({});
  }

  async function handleRetry(labSlug: string) {
    await deleteProgress(labSlug);
    await clearActiveLabSession(labSlug);

    localStorage.removeItem(getActiveSessionKey(labSlug));

    setProgress((prev) => {
      const updated = { ...prev };
      delete updated[labSlug];
      return updated;
    });

    setActiveSessions((prev) => ({
      ...prev,
      [labSlug]: false,
    }));
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8">
        Checking login...
      </main>
    );
  }

  const completedCount = labs.filter((lab) => progress[lab.slug]).length;

  const inProgressCount = labs.filter(
    (lab) => activeSessions[lab.slug] && !progress[lab.slug]
  ).length;

  const notStartedCount = labs.length - completedCount - inProgressCount;

  const totalAttempts = Object.values(attempts).reduce(
    (total, labAttempts) => total + labAttempts.length,
    0
  );

  const averageScore =
    completedCount > 0
      ? Math.round(
          labs.reduce((total, lab) => {
            return total + (progress[lab.slug]?.score || 0);
          }, 0) / completedCount
        )
      : 0;

  const completionPercent =
    labs.length > 0 ? Math.round((completedCount / labs.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-slate-800 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <p className="text-blue-400 text-sm font-semibold mb-1">
              Network Troubleshooting Platform
            </p>
            <h1 className="text-3xl font-bold">
              Fix broken networks. Build real troubleshooting skill.
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Signed in as{" "}
              <span className="text-slate-300">
                {user?.name || user?.email}
              </span>
            </p>
          </div>

          <div className="hidden md:flex gap-3 text-sm text-slate-400">
            <span className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2">
              CCNA Track
            </span>
            <button
              type="button"
              onClick={handleClearProgress}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg px-4 py-2"
            >
              Reset Progress
            </button>
            <button
              type="button"
              onClick={logout}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-300"
            >
              Logout
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 py-10">
        <div className="mb-10 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Your Progress</h2>
              <p className="text-slate-400 mt-1">
                Track completion, scores, active sessions, and attempts.
              </p>
            </div>

            <p className="text-4xl font-bold text-blue-400">
              {completionPercent}%
            </p>
          </div>

          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-5 mb-10">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-sm mb-2">Available Labs</p>
            <p className="text-3xl font-bold">{labs.length}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-sm mb-2">Completed</p>
            <p className="text-3xl font-bold text-green-400">
              {completedCount}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-sm mb-2">In Progress</p>
            <p className="text-3xl font-bold text-yellow-400">
              {inProgressCount}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-sm mb-2">Not Started</p>
            <p className="text-3xl font-bold text-slate-300">
              {notStartedCount}
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

        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Lab Library</h2>
            <p className="text-slate-400 mt-1">
              Continue active labs, review completed labs, or start new
              troubleshooting scenarios.
            </p>
          </div>
        </div>

        {loading && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-slate-400">
            Loading labs...
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-950/40 border border-red-700 rounded-2xl p-8 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {labs.map((lab) => {
              const labProgress = progress[lab.slug];
              const labAttempts = attempts[lab.slug] || [];
              const completed = Boolean(labProgress);
              const inProgress = Boolean(activeSessions[lab.slug]) && !completed;

              const statusLabel = completed
                ? "Completed"
                : inProgress
                ? "In Progress"
                : "Not Started";

              const statusStyle = completed
                ? "bg-green-500/15 text-green-400 border-green-500/30"
                : inProgress
                ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                : "bg-slate-500/15 text-slate-400 border-slate-500/30";

              return (
                <article
                  key={lab.id}
                  className="group bg-slate-900 border border-slate-800 hover:border-blue-500/60 rounded-2xl p-6 transition shadow-lg"
                >
                  <div className="flex items-center justify-between mb-5">
                    <span
                      className={`text-xs uppercase tracking-wide border px-3 py-1 rounded-full ${getDifficultyStyle(
                        lab.difficulty
                      )}`}
                    >
                      {lab.difficulty}
                    </span>

                    <span
                      className={`text-xs uppercase tracking-wide border px-3 py-1 rounded-full ${statusStyle}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition">
                    {lab.title}
                  </h3>

                  <p className="text-slate-400 text-sm mb-4">
                    Category:{" "}
                    <span className="text-slate-300">{lab.category}</span>
                  </p>

                  <div className="h-36 rounded-xl bg-slate-950 border border-slate-800 mb-5 flex items-center justify-center px-4 text-center">
                    {completed && labProgress ? (
                      <div>
                        <p className="text-green-400 font-bold mb-1">
                          Completed
                        </p>
                        <p className="text-slate-300 text-sm">
                          Best Score: {labProgress.score}
                        </p>
                        <p className="text-slate-400 text-sm">
                          Attempts: {labAttempts.length}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          Last Completed: {formatDate(labProgress.completedAt)}
                        </p>
                      </div>
                    ) : inProgress ? (
                      <div>
                        <p className="text-yellow-400 font-bold mb-1">
                          Active Session
                        </p>
                        <p className="text-slate-500 text-sm">
                          Continue where you left off.
                        </p>
                        <p className="text-slate-500 text-sm">
                          Attempts: {labAttempts.length}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-slate-400 font-bold mb-1">
                          Broken Topology
                        </p>
                        <p className="text-slate-500 text-sm">
                          Start a new troubleshooting attempt.
                        </p>
                        <p className="text-slate-500 text-sm">
                          Attempts: {labAttempts.length}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/labs/${lab.slug}`}
                      className={`flex-1 text-center px-5 py-3 rounded-xl font-semibold transition ${
                        completed
                          ? "bg-slate-700 hover:bg-slate-600"
                          : inProgress
                          ? "bg-yellow-600 hover:bg-yellow-500 text-black"
                          : "bg-blue-600 hover:bg-blue-500"
                      }`}
                    >
                      {completed ? "Review" : inProgress ? "Resume" : "Start"}
                    </Link>

                    {completed && (
                      <button
                        type="button"
                        onClick={() => handleRetry(lab.slug)}
                        className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </section>
    </main>
  );
}