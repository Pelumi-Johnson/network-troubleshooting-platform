import Link from "next/link";
import AppShell from "@/components/layout/AppShell";

const categories = {
  "command-combat": {
    title: "Command Combat",
    eyebrow: "CLI Evidence",
    description:
      "Practice choosing the exact command that proves gateway, DNS, switchport, route, ACL, DHCP, and device state.",
    icon: "⌁",
    count: "24 drills",
    accent: "from-emerald-400 to-teal-300",
    drills: [
      {
        id: "CMD-021",
        slug: "which-command-proves-dns-failure",
        title: "Which command proves DNS failure?",
        difficulty: "Easy",
        time: "3 min",
        prompt:
          "Ping to 8.8.8.8 works. Choose the command that proves DNS resolution is failing.",
      },
      {
        id: "CMD-044",
        slug: "check-switch-port-status",
        title: "Check switch port status",
        difficulty: "Easy",
        time: "4 min",
        prompt:
          "A wired client cannot reach the gateway. Pick the command that proves port/link state.",
      },
      {
        id: "CMD-058",
        slug: "verify-router-interfaces",
        title: "Verify router interfaces",
        difficulty: "Medium",
        time: "5 min",
        prompt:
          "A subnet is unreachable. Choose the command that checks interface IP and line protocol.",
      },
    ],
  },
  "osi-ladder": {
    title: "OSI Ladder",
    eyebrow: "Layer Discipline",
    description:
      "Use symptoms to decide whether to stay at Layer 1/2 or move upward before touching DNS, routing, or services.",
    icon: "▱",
    count: "18 drills",
    accent: "from-cyan-400 to-emerald-300",
    drills: [
      {
        id: "OSI-014",
        slug: "gateway-works-names-fail",
        title: "Gateway works, names fail",
        difficulty: "Easy",
        time: "4 min",
        prompt:
          "IP connectivity works, but domain names fail. Decide what to prove next.",
      },
      {
        id: "OSI-026",
        slug: "cable-or-configuration",
        title: "Cable or configuration?",
        difficulty: "Easy",
        time: "3 min",
        prompt:
          "A client shows media disconnected. Decide which OSI layer to investigate first.",
      },
      {
        id: "OSI-039",
        slug: "when-to-move-above-layer-3",
        title: "When to move above Layer 3",
        difficulty: "Medium",
        time: "5 min",
        prompt:
          "Gateway and external IP pings work. Decide the next layer to test.",
      },
    ],
  },
  "port-recall": {
    title: "Port Recall",
    eyebrow: "Services",
    description:
      "Learn common ports through realistic failures involving DNS, DHCP, SMTP, FTP, SSH, HTTP, HTTPS, and RDP.",
    icon: "◌",
    count: "22 drills",
    accent: "from-sky-400 to-cyan-300",
    drills: [
      {
        id: "PRT-008",
        slug: "service-port-lockpick",
        title: "Service Port Lockpick",
        difficulty: "Medium",
        time: "5 min",
        prompt:
          "HTTPS fails while ICMP works. Identify the service and port to investigate.",
      },
      {
        id: "PRT-012",
        slug: "dns-service-port",
        title: "DNS service port",
        difficulty: "Easy",
        time: "2 min",
        prompt:
          "A host cannot resolve names. Identify the service port involved in DNS lookups.",
      },
      {
        id: "PRT-020",
        slug: "dhcp-lease-failure",
        title: "DHCP lease failure",
        difficulty: "Medium",
        time: "4 min",
        prompt:
          "A PC has no valid lease. Identify the ports used by DHCP.",
      },
    ],
  },
  "output-decoder": {
    title: "Output Decoder",
    eyebrow: "Reading Proof",
    description:
      "Read CLI output and explain what the evidence proves before selecting a fix.",
    icon: "▣",
    count: "16 drills",
    accent: "from-emerald-400 to-cyan-300",
    drills: [
      {
        id: "OUT-017",
        slug: "decode-apipa-address",
        title: "Decode APIPA address",
        difficulty: "Easy",
        time: "3 min",
        prompt:
          "A PC shows 169.254.x.x. Identify what the evidence suggests.",
      },
      {
        id: "OUT-024",
        slug: "read-ipconfig-evidence",
        title: "Read ipconfig evidence",
        difficulty: "Easy",
        time: "4 min",
        prompt:
          "Interpret IP address, subnet mask, gateway, and DNS evidence from a client.",
      },
      {
        id: "OUT-031",
        slug: "decode-interface-brief",
        title: "Decode interface brief",
        difficulty: "Medium",
        time: "5 min",
        prompt:
          "Read interface status and protocol state to decide what is broken.",
      },
    ],
  },
  "fault-domain-finder": {
    title: "Fault Domain Finder",
    eyebrow: "Isolation",
    description:
      "Classify failures into DNS, gateway, switching, routing, ACL/NAT, DHCP, subnetting, or service-layer faults.",
    icon: "◎",
    count: "20 drills",
    accent: "from-amber-300 to-emerald-300",
    drills: [
      {
        id: "FDF-032",
        slug: "dns-gateway-or-acl",
        title: "DNS, gateway, or ACL?",
        difficulty: "Hard",
        time: "7 min",
        prompt:
          "Only one application fails while routing is healthy. Decide the likely fault domain.",
      },
      {
        id: "FDF-018",
        slug: "gateway-or-subnet-mistake",
        title: "Gateway or subnet mistake?",
        difficulty: "Medium",
        time: "5 min",
        prompt:
          "A host can reach local devices but not outside the subnet. Classify the fault.",
      },
      {
        id: "FDF-041",
        slug: "one-vlan-fails",
        title: "One VLAN fails",
        difficulty: "Hard",
        time: "8 min",
        prompt:
          "Only one VLAN cannot reach the server network. Decide where to isolate first.",
      },
    ],
  },
  "repair-proof": {
    title: "Repair Proof",
    eyebrow: "Validation",
    description:
      "Choose the follow-up command or test that proves a repair actually worked.",
    icon: "✓",
    count: "14 drills",
    accent: "from-lime-300 to-emerald-400",
    drills: [
      {
        id: "VAL-011",
        slug: "prove-the-repair",
        title: "Prove the repair",
        difficulty: "Medium",
        time: "5 min",
        prompt:
          "After enabling a switchport, choose the command and test that validates the fix.",
      },
      {
        id: "VAL-018",
        slug: "dns-fix-validation",
        title: "DNS fix validation",
        difficulty: "Easy",
        time: "3 min",
        prompt:
          "After correcting DNS settings, choose the test that proves name resolution works.",
      },
      {
        id: "VAL-025",
        slug: "gateway-repair-proof",
        title: "Gateway repair proof",
        difficulty: "Medium",
        time: "5 min",
        prompt:
          "After fixing a default gateway, choose the evidence that validates the repair.",
      },
    ],
  },
};

type CategorySlug = keyof typeof categories;

function getDifficultyTone(difficulty: string) {
  if (difficulty === "Easy") {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
  }

  if (difficulty === "Medium") {
    return "border-cyan-400/25 bg-cyan-400/10 text-cyan-300";
  }

  return "border-rose-400/25 bg-rose-400/10 text-rose-300";
}

export default async function ChallengeCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const resolvedParams = await params;
  const categorySlug = resolvedParams.category;
  const category = categories[categorySlug as CategorySlug];

  if (!category) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[1480px] p-4 lg:p-5">
          <div className="max-w-3xl rounded-3xl border border-white/10 bg-slate-950/50 p-8 shadow-[0_24px_90px_rgba(0,0,0,.45)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-300">
              Challenge not found
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              This challenge category does not exist.
            </h1>
            <Link
              href="/challenges"
              className="mt-6 inline-flex rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-200"
            >
              Back to challenges
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1480px] space-y-5 p-4 lg:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.055] px-4 py-3 text-sm text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
          <Link
            href="/challenges"
            className="font-semibold text-emerald-200 transition hover:text-white"
          >
            ← Back to all challenges
          </Link>

          <span className="hidden text-[11px] uppercase tracking-widest text-emerald-300/80 md:inline">
            Category Page
          </span>
        </div>

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-[0_24px_90px_rgba(0,0,0,.45),inset_0_1px_0_rgba(255,255,255,.04)] lg:p-8">
          <div
            className={`absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br ${category.accent} opacity-20 blur-3xl`}
          />
          <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(45,212,191,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,.16)_1px,transparent_1px)] [background-size:38px_38px]" />

          <div className="relative grid gap-6 lg:grid-cols-[1fr_340px]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                {category.eyebrow}
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white lg:text-6xl">
                {category.title}
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 lg:text-base">
                {category.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  {category.count}
                </span>
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                  Guided Practice
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-slate-300">
                  Command Center Mode
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-400/15 bg-black/30 p-5">
              <div className="grid h-16 w-16 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-3xl text-cyan-200">
                {category.icon}
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Training Objective
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Complete the first drill, read the evidence, then choose the
                command or conclusion that proves the fault.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                Available Drills
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Start with the recommended drill
              </h2>
            </div>

            <span className="text-xs text-slate-500">
              Drill detail pages enabled
            </span>
          </div>

          <div className="space-y-3">
            {category.drills.map((drill, index) => (
              <article
                key={drill.id}
                className={`grid gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.045] lg:grid-cols-[92px_1fr_230px_130px] lg:items-center ${
                  index === 0 ? "ring-1 ring-emerald-300/20" : ""
                }`}
              >
                <span className="font-mono text-xs text-slate-500">
                  {drill.id}
                </span>

                <div>
                  <h3 className="text-base font-semibold text-white">
                    {drill.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {drill.prompt}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-md border px-2 py-1 text-xs font-semibold ${getDifficultyTone(
                      drill.difficulty,
                    )}`}
                  >
                    {drill.difficulty}
                  </span>
                  <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 text-xs font-semibold text-slate-300">
                    {drill.time}
                  </span>
                </div>

                <Link
                  href={`/challenges/${categorySlug}/${drill.slug}`}
                  className={`${
                    index === 0
                      ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950"
                      : "border border-emerald-400/50 bg-emerald-400/[0.06] text-emerald-200"
                  } rounded-xl px-4 py-3 text-center text-sm font-semibold transition hover:scale-[1.01]`}
                >
                  Start
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}