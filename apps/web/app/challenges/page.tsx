"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";

type ChallengeCategory = "switch" | "router" | "pc" | "troubleshooting";

type Challenge = {
  id: string;
  category: ChallengeCategory;
  title: string;
  prompt: string;
  answer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
};

const challenges: Challenge[] = [
  {
    id: "switch-interface-status",
    category: "switch",
    title: "Check switch port status",
    prompt: "What command shows switch interface/port status?",
    answer: "show interfaces status",
    explanation:
      "This command displays switch ports, their connection status, and VLAN assignment.",
    difficulty: "easy",
  },
  {
    id: "switch-vlan-brief",
    category: "switch",
    title: "View VLAN summary",
    prompt: "What command displays VLANs and assigned ports?",
    answer: "show vlan brief",
    explanation:
      "This command shows VLAN IDs, VLAN names, status, and ports assigned to each VLAN.",
    difficulty: "easy",
  },
  {
    id: "router-interface-brief",
    category: "router",
    title: "Check router interfaces",
    prompt: "What command shows router interface IP addresses and status?",
    answer: "show ip interface brief",
    explanation:
      "This command gives a quick summary of router interfaces, IP addresses, and up/down status.",
    difficulty: "easy",
  },
  {
    id: "enter-privileged-mode",
    category: "router",
    title: "Enter privileged mode",
    prompt: "What command enters privileged EXEC mode?",
    answer: "enable",
    explanation:
      "The enable command moves from user EXEC mode into privileged EXEC mode.",
    difficulty: "easy",
  },
  {
    id: "enter-global-config",
    category: "router",
    title: "Enter global configuration mode",
    prompt: "What command enters global configuration mode?",
    answer: "configure terminal",
    explanation:
      "From privileged EXEC mode, configure terminal enters global configuration mode.",
    difficulty: "easy",
  },
  {
    id: "select-interface",
    category: "router",
    title: "Select an interface",
    prompt: "What command selects interface g0/0 for configuration?",
    answer: "interface g0/0",
    explanation:
      "The interface command enters interface configuration mode for the selected port.",
    difficulty: "medium",
  },
  {
    id: "bring-interface-up",
    category: "router",
    title: "Bring interface up",
    prompt: "What command brings a shutdown interface back up?",
    answer: "no shutdown",
    explanation:
      "The no shutdown command administratively enables an interface.",
    difficulty: "medium",
  },
  {
    id: "pc-ipconfig",
    category: "pc",
    title: "Check PC IP settings",
    prompt: "What command displays a PC IP address, subnet mask, and gateway?",
    answer: "ipconfig",
    explanation:
      "ipconfig shows the PC network configuration, including IP address, subnet mask, gateway, and DNS if configured.",
    difficulty: "easy",
  },
  {
    id: "pc-ping-gateway",
    category: "pc",
    title: "Test gateway reachability",
    prompt: "What command tests connectivity to gateway 192.168.1.1?",
    answer: "ping 192.168.1.1",
    explanation:
      "Pinging the default gateway is a common first step when testing local network connectivity.",
    difficulty: "easy",
  },
  {
    id: "dns-symptom",
    category: "troubleshooting",
    title: "Identify DNS symptom",
    prompt:
      "A PC can ping 8.8.8.8 but cannot ping google.com. What should you check?",
    answer: "dns",
    explanation:
      "If IP connectivity works but domain names fail, DNS configuration is the likely issue.",
    difficulty: "medium",
  },
];

const filters: Array<{ key: "all" | ChallengeCategory; label: string }> = [
  { key: "all", label: "All" },
  { key: "switch", label: "Switch" },
  { key: "router", label: "Router" },
  { key: "pc", label: "PC" },
  { key: "troubleshooting", label: "Troubleshooting" },
];

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function getCategoryStyle(category: ChallengeCategory) {
  const styles: Record<ChallengeCategory, string> = {
    switch: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    router: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    pc: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    troubleshooting:
      "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  };

  return styles[category];
}

function getDifficultyStyle(difficulty: Challenge["difficulty"]) {
  if (difficulty === "easy") {
    return "bg-green-500/15 text-green-400 border-green-500/30";
  }

  if (difficulty === "medium") {
    return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  }

  return "bg-red-500/15 text-red-400 border-red-500/30";
}

export default function ChallengesPage() {
  const { checkingAuth } = useRequireAuth();

  const [filter, setFilter] = useState<"all" | ChallengeCategory>("all");
  const [selectedChallengeId, setSelectedChallengeId] = useState(
    challenges[0].id
  );
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);

  const filteredChallenges = useMemo(() => {
    if (filter === "all") return challenges;

    return challenges.filter((challenge) => challenge.category === filter);
  }, [filter]);

  const selectedChallenge =
    challenges.find((challenge) => challenge.id === selectedChallengeId) ||
    challenges[0];

  function selectChallenge(challengeId: string) {
    setSelectedChallengeId(challengeId);
    setAnswer("");
    setResult(null);
  }

  function checkAnswer() {
    const normalizedInput = normalizeAnswer(answer);
    const normalizedCorrectAnswer = normalizeAnswer(selectedChallenge.answer);

    setResult(
      normalizedInput === normalizedCorrectAnswer ? "correct" : "incorrect"
    );
  }

  function showAnswer() {
    setAnswer(selectedChallenge.answer);
    setResult("correct");
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8">
        Checking login...
      </main>
    );
  }

  return (
    <AppShell
      title="Command Challenges"
      subtitle="Practice router, switch, PC, and troubleshooting commands before entering full lab scenarios."
    >
      <section className="grid grid-cols-1 2xl:grid-cols-12 gap-6 items-start">
        <aside className="2xl:col-span-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl shadow-black/15">
          <div className="mb-5">
            <p className="text-blue-400 text-sm font-semibold mb-2">
              Challenge Bank
            </p>
            <h2 className="text-2xl font-black">Command drills</h2>
            <p className="text-sm text-slate-400 mt-2">
              Select a drill, type the command, and check your answer.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {filters.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setFilter(item.key);
                  const firstMatch =
                    item.key === "all"
                      ? challenges[0]
                      : challenges.find(
                          (challenge) => challenge.category === item.key
                        );

                  if (firstMatch) {
                    selectChallenge(firstMatch.id);
                  }
                }}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  filter === item.key
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredChallenges.map((challenge) => {
              const selected = selectedChallenge.id === challenge.id;

              return (
                <button
                  key={challenge.id}
                  type="button"
                  onClick={() => selectChallenge(challenge.id)}
                  className={`w-full text-left rounded-2xl border p-4 transition ${
                    selected
                      ? "bg-blue-500/15 border-blue-500/40"
                      : "bg-slate-950 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span
                      className={`text-xs border px-3 py-1 rounded-full ${getCategoryStyle(
                        challenge.category
                      )}`}
                    >
                      {challenge.category}
                    </span>

                    <span
                      className={`text-xs border px-3 py-1 rounded-full ${getDifficultyStyle(
                        challenge.difficulty
                      )}`}
                    >
                      {challenge.difficulty}
                    </span>
                  </div>

                  <p className="font-bold text-slate-100">{challenge.title}</p>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                    {challenge.prompt}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="2xl:col-span-8 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl shadow-black/15">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-6">
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className={`text-xs border px-3 py-1 rounded-full ${getCategoryStyle(
                      selectedChallenge.category
                    )}`}
                  >
                    {selectedChallenge.category}
                  </span>

                  <span
                    className={`text-xs border px-3 py-1 rounded-full ${getDifficultyStyle(
                      selectedChallenge.difficulty
                    )}`}
                  >
                    {selectedChallenge.difficulty}
                  </span>
                </div>

                <p className="text-blue-400 text-sm font-semibold mb-2">
                  Active Challenge
                </p>
                <h2 className="text-3xl font-black">
                  {selectedChallenge.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={showAnswer}
                className="rounded-2xl border border-slate-700 bg-slate-950 hover:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-300"
              >
                Show Answer
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 mb-6">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-3">
                Prompt
              </p>
              <p className="text-xl text-slate-100 leading-relaxed">
                {selectedChallenge.prompt}
              </p>
            </div>

            <div className="bg-black border border-slate-800 rounded-2xl overflow-hidden">
              <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-xs text-slate-500 ml-2">
                  Challenge Console
                </span>
              </div>

              <div className="p-5 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-green-400 shrink-0">answer&gt;</span>
                  <input
                    value={answer}
                    onChange={(event) => {
                      setAnswer(event.target.value);
                      setResult(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        checkAnswer();
                      }
                    }}
                    className="flex-1 bg-transparent border-none outline-none text-slate-100 caret-green-400 placeholder:text-slate-700"
                    placeholder="type the command..."
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <button
                type="button"
                onClick={checkAnswer}
                className="bg-blue-600 hover:bg-blue-500 rounded-2xl px-5 py-3 font-bold"
              >
                Check Answer
              </button>

              <button
                type="button"
                onClick={() => {
                  setAnswer("");
                  setResult(null);
                }}
                className="border border-slate-700 bg-slate-950 hover:bg-slate-900 rounded-2xl px-5 py-3 font-semibold text-slate-300"
              >
                Clear
              </button>
            </div>
          </div>

          {result && (
            <div
              className={`rounded-3xl border p-6 ${
                result === "correct"
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}
            >
              <p
                className={`text-sm font-semibold mb-2 ${
                  result === "correct" ? "text-green-400" : "text-red-400"
                }`}
              >
                {result === "correct" ? "Correct" : "Not quite"}
              </p>

              <h3 className="text-2xl font-black mb-3">
                {result === "correct"
                  ? "Command accepted"
                  : "Review the command"}
              </h3>

              <p className="text-slate-300 mb-4">
                {selectedChallenge.explanation}
              </p>

              {result === "incorrect" && (
                <div className="bg-black border border-slate-800 rounded-2xl p-4 font-mono text-sm">
                  <span className="text-slate-500">Expected: </span>
                  <span className="text-green-400">
                    {selectedChallenge.answer}
                  </span>
                </div>
              )}
            </div>
          )}

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5">
              <p className="text-slate-500 text-xs uppercase tracking-wide">
                Total Drills
              </p>
              <p className="text-4xl font-black mt-3">{challenges.length}</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5">
              <p className="text-slate-500 text-xs uppercase tracking-wide">
                Switch Drills
              </p>
              <p className="text-4xl font-black text-violet-400 mt-3">
                {
                  challenges.filter((challenge) => challenge.category === "switch")
                    .length
                }
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5">
              <p className="text-slate-500 text-xs uppercase tracking-wide">
                Router Drills
              </p>
              <p className="text-4xl font-black text-rose-400 mt-3">
                {
                  challenges.filter((challenge) => challenge.category === "router")
                    .length
                }
              </p>
            </div>
          </section>
        </section>
      </section>
    </AppShell>
  );
}