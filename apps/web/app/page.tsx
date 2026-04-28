import Link from "next/link";

const features = [
  {
    title: "Real CLI Practice",
    description:
      "Troubleshoot using PC, router, and switch commands instead of passive quizzes.",
  },
  {
    title: "Persistent Labs",
    description:
      "Your sessions, commands, hints, and progress stay saved as you work.",
  },
  {
    title: "Progress Tracking",
    description:
      "Track completed labs, scores, attempts, categories, and achievements.",
  },
  {
    title: "CCNA-Style Scenarios",
    description:
      "Practice gateway, DNS, subnetting, routing, and switching failures.",
  },
];

const labs = [
  "Default Gateway Issue",
  "Router Interface Down",
  "DNS Failure",
  "Switch Port Shutdown",
  "Wrong Subnet Mask",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(147,51,234,0.18),transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />

        <div className="relative max-w-7xl mx-auto px-8 py-8">
          <nav className="flex items-center justify-between mb-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center font-black">
                N
              </div>
              <div>
                <p className="font-bold leading-tight">Network Lab</p>
                <p className="text-xs text-slate-500">Troubleshooting Platform</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800"
              >
                Login
              </Link>

              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg font-semibold"
              >
                Enter Labs
              </Link>
            </div>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pb-20">
            <section>
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                Hands-on networking practice
              </div>

              <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
                Learn networking by fixing{" "}
                <span className="text-blue-400">broken systems.</span>
              </h1>

              <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
                Practice realistic troubleshooting labs with CLI commands,
                persistent sessions, scoring, progress tracking, and achievements.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link
                  href="/dashboard"
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-4 rounded-xl font-bold text-center shadow-lg shadow-blue-950/40"
                >
                  Start Troubleshooting
                </Link>

                <Link
                  href="/register"
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700 px-6 py-4 rounded-xl font-bold text-center text-slate-200"
                >
                  Create Account
                </Link>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                <span className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-full">
                  Router CLI
                </span>
                <span className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-full">
                  Switch CLI
                </span>
                <span className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-full">
                  PC Troubleshooting
                </span>
                <span className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-full">
                  Progress Tracking
                </span>
              </div>
            </section>

            <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-500">Live Lab Preview</p>
                  <h2 className="text-xl font-bold">Wrong Subnet Mask</h2>
                </div>

                <span className="bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs px-3 py-1 rounded-full uppercase">
                  Medium
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 mb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="bg-blue-700 rounded-xl w-24 h-16 flex items-center justify-center font-bold shadow-[0_0_20px_rgba(37,99,235,0.35)]">
                    💻 PC1
                  </div>

                  <div className="h-[2px] flex-1 bg-slate-700" />

                  <div className="bg-purple-700 rounded-xl w-24 h-16 flex items-center justify-center font-bold">
                    🔀 SW1
                  </div>

                  <div className="h-[2px] flex-1 bg-slate-700" />

                  <div className="bg-red-700 rounded-xl w-24 h-16 flex items-center justify-center font-bold">
                    📡 R1
                  </div>
                </div>
              </div>

              <div className="bg-black rounded-2xl border border-slate-800 overflow-hidden">
                <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-xs text-slate-500 ml-2">
                    PC1 Console
                  </span>
                </div>

                <div className="p-5 font-mono text-sm space-y-3">
                  <p>
                    <span className="text-green-400">pc1&gt;</span>{" "}
                    <span>ipconfig</span>
                  </p>
                  <pre className="text-slate-300 whitespace-pre-wrap">
{`IPv4 Address. . . . . . : 192.168.1.130
Subnet Mask . . . . . . : 255.255.255.128
Default Gateway . . . . : 192.168.1.1`}
                  </pre>
                  <p>
                    <span className="text-green-400">pc1&gt;</span>{" "}
                    <span>set subnet-mask 255.255.255.0</span>
                  </p>
                  <p className="text-blue-300">
                    ✔ Lab objective completed. Final score: 100
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 py-16">
        <div className="mb-10">
          <p className="text-blue-400 text-sm font-semibold mb-2">
            Built for practice
          </p>
          <h2 className="text-3xl font-bold mb-3">
            Everything you need to build troubleshooting confidence.
          </h2>
          <p className="text-slate-400 max-w-2xl">
            Start with guided scenarios, then hide shortcuts and troubleshoot
            from memory like a real technician.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-16">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-500/15 border border-blue-500/30 mb-5" />
              <h3 className="font-bold text-lg mb-3">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </article>
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Available labs</h2>
              <p className="text-slate-400">
                Start with core networking failures and expand into deeper
                CCNA-style troubleshooting.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-xl font-semibold text-center"
            >
              View Lab Library
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {labs.map((lab, index) => (
              <div
                key={lab}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4"
              >
                <p className="text-blue-400 text-sm font-bold mb-2">
                  Lab {index + 1}
                </p>
                <p className="font-semibold">{lab}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}