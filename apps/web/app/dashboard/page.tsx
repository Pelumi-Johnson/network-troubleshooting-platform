"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

type FilterKey =
  | "all"
  | "not-started"
  | "in-progress"
  | "completed"
  | "easy"
  | "medium";

function getDifficultyStyle(difficulty: string) {
  if (difficulty === "easy") {
    return "bg-green-500/15 text-green-400 border-green-500/30";
  }

  if (difficulty === "medium") {
    return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  }

  return "bg-red-500/15 text-red-400 border-red-500/30";
}

function getCategoryStyle(category: string) {
  const styles: Record<string, string> = {
    dns: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    routing: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    switching: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    subnetting: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    "default-gateway": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };

  return styles[category] || "bg-slate-500/15 text-slate-400 border-slate-500/30";
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

function getLabStatus(
  lab: LabSummary,
  progress: Record<string, LabProgress>,
  activeSessions: Record<string, boolean>
) {
  const completed = Boolean(progress[lab.slug]);
  const inProgress = Boolean(activeSessions[lab.slug]) && !completed;

  if (completed) return "completed";
  if (inProgress) return "in-progress";
  return "not-started";
}

export default function DashboardPage() {
  const { user, checkingAuth, logout } = useRequireAuth();

  const [labs, setLabs] = useState<LabSummary[]>([]);
  const [progress, setProgress] = useState<Record<string, LabProgress>>({});
  const [attempts, setAttempts] = useState<Record<string, LabAttempt[]>>({});
  const [activeSessions, setActiveSessions] = useState<Record<string, boolean>>(
    {}
  );
  const [filter, setFilter] = useState<FilterKey>("all");
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

  const recommendedLab = useMemo(() => {
    const activeLab = labs.find(
      (lab) => activeSessions[lab.slug] && !progress[lab.slug]
    );

    if (activeLab) return activeLab;

    return labs.find((lab) => !progress[lab.slug]) || null;
  }, [labs, progress, activeSessions]);

  const filteredLabs = labs.filter((lab) => {
    const status = getLabStatus(lab, progress, activeSessions);

    if (filter === "all") return true;
    if (filter === "completed") return status === "completed";
    if (filter === "in-progress") return status === "in-progress";
    if (filter === "not-started") return status === "not-started";
    if (filter === "easy") return lab.difficulty === "easy";
    if (filter === "medium") return lab.difficulty === "medium";

    return true;
  });

  const filters: Array<{ key: FilterKey; label: string; count?: number }> = [
    { key: "all", label: "All", count: labs.length },
    { key: "not-started", label: "Not Started", count: notStartedCount },
    { key: "in-progress", label: "In Progress", count: inProgressCount },
    { key: "completed", label: "Completed", count: completedCount },
    {
      key: "easy",
      label: "Easy",
      count: labs.filter((lab) => lab.difficulty === "easy").length,
    },
    {
      key: "medium",
      label: "Medium",
      count: labs.filter((lab) => lab.difficulty === "medium").length,
    },
  ];

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8">
        Checking login...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <section className="relative border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.2),transparent_32%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.16),transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.035)_1px,transparent_1px)] bg-[size:42px_42px]" />

        <div className="relative max-w-7xl mx-auto px-8 py-8">
          <nav className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-10">
            <div>
              <p className="text-blue-400 text-sm font-semibold mb-2">
                Network Troubleshooting Platform
              </p>
              <h1 className="text-4xl font-black tracking-tight">
                Training Dashboard
              </h1>
              <p className="text-slate-400 mt-2">
                Welcome back,{" "}
                <span className="text-slate-200 font-semibold">
                  {user?.name || user?.email}
                </span>
                . Continue building real troubleshooting skill.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <span className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2 text-slate-300">
                CCNA Track
              </span>

              <Link
                href="/profile"
                className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-300"
              >
                Profile
              </Link>

              <button
                type="button"
                onClick={handleClearProgress}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl px-4 py-2"
              >
                Reset Progress
              </button>

              <button
                type="button"
                onClick={logout}
                className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-300"
              >
                Logout
              </button>
            </div>
          </nav>

          <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
            <div className="xl:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-black/20">
              <div className="flex items-start justify-between gap-5 mb-5">
                <div>
                  <p className="text-slate-400 text-sm mb-2">
                    Overall completion
                  </p>
                  <div className="flex items-end gap-3">
                    <p className="text-6xl font-black text-blue-400">
                      {completionPercent}%
                    </p>
                    <p className="text-slate-400 mb-2">
                      {completedCount} of {labs.length} labs completed
                    </p>
                  </div>
                </div>

                <div className="hidden md:block text-right">
                  <p className="text-slate-500 text-sm">Average Score</p>
                  <p className="text-3xl font-bold">{averageScore}</p>
                </div>
              </div>

              <div className="h-4 bg-slate-950 border border-slate-800 rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">
                    Completed
                  </p>
                  <p className="text-3xl font-bold text-green-400 mt-2">
                    {completedCount}
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">
                    In Progress
                  </p>
                  <p className="text-3xl font-bold text-yellow-400 mt-2">
                    {inProgressCount}
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">
                    Attempts
                  </p>
                  <p className="text-3xl font-bold text-violet-400 mt-2">
                    {totalAttempts}
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">
                    Labs
                  </p>
                  <p className="text-3xl font-bold mt-2">{labs.length}</p>
                </div>
              </div>
            </div>

            <div className="xl:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-slate-400 text-sm mb-1">
                    Recommended Next
                  </p>
                  <h2 className="text-2xl font-bold">
                    {recommendedLab?.title || "Track Complete"}
                  </h2>
                </div>

                {recommendedLab && (
                  <span
                    className={`border rounded-full px-3 py-1 text-xs uppercase tracking-wide ${getDifficultyStyle(
                      recommendedLab.difficulty
                    )}`}
                  >
                    {recommendedLab.difficulty}
                  </span>
                )}
              </div>

              {recommendedLab ? (
                <>
                  <p className="text-slate-400 mb-5">
                    {activeSessions[recommendedLab.slug] &&
                    !progress[recommendedLab.slug]
                      ? "You have an active session waiting. Resume where you left off."
                      : "Start the next unfinished lab in your troubleshooting track."}
                  </p>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`border rounded-full px-3 py-1 text-xs ${getCategoryStyle(
                          recommendedLab.category
                        )}`}
                      >
                        {recommendedLab.category}
                      </span>

                      <span className="text-slate-500 text-sm">
                        {recommendedLab.estimatedMinutes} min
                      </span>
                    </div>

                    <div className="h-24 rounded-xl border border-slate-800 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.18),transparent_35%)] flex items-center justify-center text-slate-500">
                      Simulator workspace
                    </div>
                  </div>

                  <Link
                    href={`/labs/${recommendedLab.slug}`}
                    className={`block text-center rounded-xl px-5 py-3 font-bold ${
                      activeSessions[recommendedLab.slug] &&
                      !progress[recommendedLab.slug]
                        ? "bg-yellow-600 hover:bg-yellow-500 text-black"
                        : "bg-blue-600 hover:bg-blue-500"
                    }`}
                  >
                    {activeSessions[recommendedLab.slug] &&
                    !progress[recommendedLab.slug]
                      ? "Resume Lab"
                      : "Start Lab"}
                  </Link>
                </>
              ) : (
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 text-green-300">
                  You completed all available labs. Nice work.
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 mb-8">
          <div>
            <p className="text-blue-400 text-sm font-semibold mb-2">
              Lab Library
            </p>
            <h2 className="text-3xl font-black">Choose your next fault</h2>
            <p className="text-slate-400 mt-2">
              Filter by progress, difficulty, or continue active sessions.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  filter === item.key
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                {item.label}
                {typeof item.count === "number" && (
                  <span className="ml-2 opacity-70">{item.count}</span>
                )}
              </button>
            ))}
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
            {filteredLabs.map((lab) => {
              const labProgress = progress[lab.slug];
              const labAttempts = attempts[lab.slug] || [];
              const status = getLabStatus(lab, progress, activeSessions);

              const completed = status === "completed";
              const inProgress = status === "in-progress";

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
                  className="group bg-slate-900 border border-slate-800 hover:border-blue-500/60 rounded-3xl p-6 transition shadow-xl shadow-black/15"
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

                  <div className="flex flex-wrap gap-2 mb-5">
                    <span
                      className={`text-xs border px-3 py-1 rounded-full ${getCategoryStyle(
                        lab.category
                      )}`}
                    >
                      {lab.category}
                    </span>
                    <span className="text-xs border border-slate-800 bg-slate-950 text-slate-400 px-3 py-1 rounded-full">
                      {lab.estimatedMinutes} min
                    </span>
                  </div>

                  <div className="h-40 rounded-2xl bg-slate-950 border border-slate-800 mb-5 p-5 flex flex-col justify-between">
                    {completed && labProgress ? (
                      <>
                        <div>
                          <p className="text-green-400 font-bold mb-1">
                            Completed
                          </p>
                          <p className="text-slate-400 text-sm">
                            Best Score:{" "}
                            <span className="text-slate-200">
                              {labProgress.score}
                            </span>
                          </p>
                        </div>

                        <div className="text-sm text-slate-500">
                          <p>Attempts: {labAttempts.length}</p>
                          <p>Last: {formatDate(labProgress.completedAt)}</p>
                        </div>
                      </>
                    ) : inProgress ? (
                      <>
                        <div>
                          <p className="text-yellow-400 font-bold mb-1">
                            Active Session
                          </p>
                          <p className="text-slate-500 text-sm">
                            Continue your current troubleshooting state.
                          </p>
                        </div>

                        <p className="text-sm text-slate-500">
                          Attempts: {labAttempts.length}
                        </p>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-slate-300 font-bold mb-1">
                            Fault Scenario
                          </p>
                          <p className="text-slate-500 text-sm">
                            Start a fresh troubleshooting attempt.
                          </p>
                        </div>

                        <p className="text-sm text-slate-500">
                          Attempts: {labAttempts.length}
                        </p>
                      </>
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

            {filteredLabs.length === 0 && (
              <div className="md:col-span-2 xl:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-slate-400">
                No labs match this filter.
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}