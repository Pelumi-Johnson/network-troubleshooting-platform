type Lab = {
  slug?: string;
  title: string;
  scenario: {
    summary: string;
    objective: string;
    completionMessage: string;
    observedBehavior?: string[];
  };
};

type Session = {
  status: string;
  score: number;
  hintsUsed: number;
};

type Props = {
  lab: Lab | null;
  session: Session | null;
  hint: string;
  onGetHint: () => void;
  onRestart: () => void;
};

function getObservedBehavior(lab: Lab | null) {
  if (lab?.scenario.observedBehavior?.length) {
    return lab.scenario.observedBehavior;
  }

  return ["Troubleshoot the network and restore the expected service."];
}

export function InstructionsPanel({
  lab,
  session,
  hint,
  onGetHint,
  onRestart,
}: Props) {
  const observedBehavior = getObservedBehavior(lab);

  return (
    <section className="bg-slate-900 rounded-xl p-5 border border-slate-800">
      <h1 className="text-2xl font-bold mb-3">{lab?.title}</h1>
      <p className="text-slate-300 mb-4">{lab?.scenario.summary}</p>

      <div className="mb-5 bg-slate-950 border border-slate-800 rounded-lg p-4">
        <h2 className="font-semibold mb-3 text-blue-400">Observed Behavior</h2>
        <ul className="space-y-2 text-sm text-slate-300">
          {observedBehavior.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-blue-400">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <h2 className="font-semibold mb-2">Objective</h2>
      <p className="text-slate-300 mb-6">{lab?.scenario.objective}</p>

      <div className="space-y-2 text-sm">
        <p>
          Status:{" "}
          <span
            className={
              session?.status === "completed"
                ? "text-green-400 font-bold"
                : "text-yellow-400"
            }
          >
            {session?.status}
          </span>
        </p>
        <p>Score: {session?.score}</p>
        <p>Hints Used: {session?.hintsUsed}</p>
      </div>

      {session?.status === "completed" && (
        <div className="mt-5 rounded-lg bg-green-900/40 border border-green-600 p-4">
          ✅ {lab?.scenario.completionMessage}
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onGetHint}
          disabled={session?.status === "completed"}
          className="bg-yellow-500 disabled:bg-slate-600 disabled:text-slate-300 px-4 py-2 rounded-lg font-semibold text-black"
        >
          Get Hint
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-semibold"
        >
          Restart
        </button>
      </div>

      {hint && (
        <div className="mt-4 bg-slate-800 border border-slate-700 rounded-lg p-3">
          {hint}
        </div>
      )}
    </section>
  );
}