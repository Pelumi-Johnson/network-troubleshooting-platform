"use client";

import Link from "next/link";
import React, { use, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";

type Difficulty = "Easy" | "Medium" | "Hard";

type Drill = {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  time: string;
  skill: string;
  prompt: string;
  evidence: string[];
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  nextStep: string;
};

type Category = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  accent: string;
  drills: Drill[];
};

const categories: Record<string, Category> = {
  "command-combat": {
    slug: "command-combat",
    title: "Command Combat",
    eyebrow: "CLI Evidence",
    description:
      "Choose the exact command that proves gateway, DNS, switchport, route, ACL, DHCP, and device state.",
    accent: "from-emerald-400 to-teal-300",
    drills: [
      {
        id: "CMD-021",
        slug: "which-command-proves-dns-failure",
        title: "Which command proves DNS failure?",
        difficulty: "Easy",
        time: "3 min",
        skill: "Command selection",
        prompt:
          "Ping to 8.8.8.8 works. Choose the command that proves DNS resolution is failing.",
        evidence: [
          "PC-02 can ping 8.8.8.8 successfully.",
          "PC-02 cannot browse to example.com.",
          "Default gateway responds normally.",
        ],
        question:
          "Which command best proves whether DNS name resolution is failing?",
        options: ["nslookup example.com", "ping 8.8.8.8", "show ip interface brief", "tracert 8.8.8.8"],
        answer: "nslookup example.com",
        explanation:
          "If IP connectivity works but names fail, a DNS lookup test directly proves whether the resolver can translate a name into an IP address.",
        nextStep: "Compare the configured DNS server against a known-good endpoint.",
      },
      {
        id: "CMD-044",
        slug: "check-switch-port-status",
        title: "Check switch port status",
        difficulty: "Easy",
        time: "4 min",
        skill: "Switchport evidence",
        prompt:
          "A wired client cannot reach the gateway. Pick the command that proves port/link state.",
        evidence: [
          "The client reports no network access.",
          "Other users in the same area are online.",
          "The cable is connected to access switch SW-01.",
        ],
        question:
          "Which command gives the clearest first proof of switchport state?",
        options: ["show interfaces status", "nslookup example.com", "show running-config | include hostname", "ping 8.8.8.8"],
        answer: "show interfaces status",
        explanation:
          "Switchport status tells you whether the port is connected, disabled, err-disabled, or assigned to an unexpected VLAN.",
        nextStep: "If the port is down or disabled, verify cable, port state, and VLAN assignment.",
      },
      {
        id: "CMD-058",
        slug: "verify-router-interfaces",
        title: "Verify router interfaces",
        difficulty: "Medium",
        time: "5 min",
        skill: "Router evidence",
        prompt:
          "A subnet is unreachable. Choose the command that checks interface IP and line protocol.",
        evidence: [
          "Users on one subnet cannot reach other networks.",
          "Local switch access appears healthy.",
          "Router configuration may have changed recently.",
        ],
        question:
          "Which command best verifies router interface addressing and protocol state?",
        options: ["show ip interface brief", "show clock", "show users", "terminal length 0"],
        answer: "show ip interface brief",
        explanation:
          "The interface brief gives a fast view of interface IP addresses and up/down protocol state.",
        nextStep: "Confirm the gateway interface is up/up and has the correct IP address.",
      },
    ],
  },

  "osi-ladder": {
    slug: "osi-ladder",
    title: "OSI Ladder",
    eyebrow: "Layer Discipline",
    description:
      "Use symptoms to decide whether to stay at Layer 1/2 or move upward before touching DNS, routing, or services.",
    accent: "from-cyan-400 to-emerald-300",
    drills: [
      {
        id: "OSI-014",
        slug: "gateway-works-names-fail",
        title: "Gateway works, names fail",
        difficulty: "Easy",
        time: "4 min",
        skill: "DNS vs gateway reasoning",
        prompt:
          "IP connectivity works, but domain names fail. Decide what to prove next.",
        evidence: [
          "PC-02 can ping its default gateway.",
          "PC-02 can ping 8.8.8.8.",
          "PC-02 cannot reach websites by name.",
        ],
        question:
          "What is the most disciplined next troubleshooting move?",
        options: [
          "Test DNS resolution with nslookup",
          "Replace the Ethernet cable",
          "Restart the switch",
          "Change the default gateway",
        ],
        answer: "Test DNS resolution with nslookup",
        explanation:
          "Gateway and external IP reachability already prove lower layers and basic routing are working. The next logical test is DNS resolution.",
        nextStep: "Run a lookup against the configured DNS server and compare it with a known-good resolver.",
      },
      {
        id: "OSI-026",
        slug: "cable-or-configuration",
        title: "Cable or configuration?",
        difficulty: "Easy",
        time: "3 min",
        skill: "Layer selection",
        prompt:
          "A client shows media disconnected. Decide which OSI layer to investigate first.",
        evidence: [
          "The OS reports media disconnected.",
          "No default gateway test succeeds.",
          "The switchport LED is dark.",
        ],
        question:
          "Which layer should you investigate first?",
        options: ["Physical layer", "Application layer", "Presentation layer", "DNS layer"],
        answer: "Physical layer",
        explanation:
          "A media disconnected symptom points to cabling, NIC, switchport, or physical link before higher-layer testing.",
        nextStep: "Check cable seating, port status, NIC state, and switchport link.",
      },
      {
        id: "OSI-039",
        slug: "when-to-move-above-layer-3",
        title: "When to move above Layer 3",
        difficulty: "Medium",
        time: "5 min",
        skill: "Layer escalation",
        prompt:
          "Gateway and external IP pings work. Decide the next layer to test.",
        evidence: [
          "Default gateway responds.",
          "External IP address responds.",
          "Only named services fail.",
        ],
        question:
          "When lower layers and IP routing work, where should you move next?",
        options: ["Application/service layer", "Physical layer", "Cable replacement", "Power supply"],
        answer: "Application/service layer",
        explanation:
          "Once gateway and IP routing are proven, the investigation should move upward to service behavior such as DNS, HTTP, or application access.",
        nextStep: "Test the failing service directly and gather command output as proof.",
      },
    ],
  },

  "port-recall": {
    slug: "port-recall",
    title: "Port Recall",
    eyebrow: "Services",
    description:
      "Learn common ports through realistic failures involving DNS, DHCP, SMTP, FTP, SSH, HTTP, HTTPS, and RDP.",
    accent: "from-sky-400 to-cyan-300",
    drills: [
      {
        id: "PRT-008",
        slug: "service-port-lockpick",
        title: "Service Port Lockpick",
        difficulty: "Medium",
        time: "5 min",
        skill: "Service ports",
        prompt:
          "HTTPS fails while ICMP works. Identify the service and port to investigate.",
        evidence: [
          "Ping to the server succeeds.",
          "HTTP redirects to HTTPS.",
          "Browser reports secure connection failure.",
        ],
        question:
          "Which service port should be investigated first?",
        options: ["443", "53", "22", "3389"],
        answer: "443",
        explanation:
          "HTTPS uses TCP port 443. If ICMP works but secure web access fails, port 443 or the HTTPS service path should be checked.",
        nextStep: "Validate whether TCP 443 is allowed and whether the web service is listening.",
      },
      {
        id: "PRT-012",
        slug: "dns-service-port",
        title: "DNS service port",
        difficulty: "Easy",
        time: "2 min",
        skill: "DNS port recall",
        prompt:
          "A host cannot resolve names. Identify the service port involved in DNS lookups.",
        evidence: [
          "Ping by IP works.",
          "Ping by name fails.",
          "The DNS server is configured but resolution times out.",
        ],
        question:
          "Which port is associated with standard DNS queries?",
        options: ["53", "80", "25", "22"],
        answer: "53",
        explanation:
          "DNS commonly uses port 53. Standard lookups usually use UDP 53, while TCP 53 can be used for larger responses or zone transfers.",
        nextStep: "Check whether the client can reach the configured resolver on port 53.",
      },
      {
        id: "PRT-020",
        slug: "dhcp-lease-failure",
        title: "DHCP lease failure",
        difficulty: "Medium",
        time: "4 min",
        skill: "DHCP ports",
        prompt:
          "A PC has no valid lease. Identify the ports used by DHCP.",
        evidence: [
          "The PC receives an APIPA address.",
          "Static addressing works.",
          "DHCP lease renewal fails.",
        ],
        question:
          "Which ports are used by DHCP client/server communication?",
        options: ["67/68", "53/54", "80/443", "20/21"],
        answer: "67/68",
        explanation:
          "DHCP uses UDP 67 for the server side and UDP 68 for the client side.",
        nextStep: "Check DHCP relay, scope availability, and whether DHCP traffic is being blocked.",
      },
    ],
  },

  "output-decoder": {
    slug: "output-decoder",
    title: "Output Decoder",
    eyebrow: "Reading Proof",
    description:
      "Read CLI output and explain what the evidence proves before selecting a fix.",
    accent: "from-emerald-400 to-cyan-300",
    drills: [
      {
        id: "OUT-017",
        slug: "decode-apipa-address",
        title: "Decode APIPA address",
        difficulty: "Easy",
        time: "3 min",
        skill: "Output interpretation",
        prompt:
          "A PC shows 169.254.x.x. Identify what the evidence suggests.",
        evidence: [
          "IPv4 Address: 169.254.44.12",
          "Default Gateway: blank",
          "DHCP Enabled: Yes",
        ],
        question:
          "What does this output most strongly suggest?",
        options: [
          "The PC failed to obtain a DHCP lease",
          "DNS is configured correctly",
          "The default route is healthy",
          "The website server is down",
        ],
        answer: "The PC failed to obtain a DHCP lease",
        explanation:
          "A 169.254.x.x address is an APIPA address. It usually appears when a client cannot obtain a DHCP lease.",
        nextStep: "Investigate DHCP availability, VLAN placement, relay configuration, and switchport state.",
      },
      {
        id: "OUT-024",
        slug: "read-ipconfig-evidence",
        title: "Read ipconfig evidence",
        difficulty: "Easy",
        time: "4 min",
        skill: "Client evidence",
        prompt:
          "Interpret IP address, subnet mask, gateway, and DNS evidence from a client.",
        evidence: [
          "IPv4 Address: 192.168.10.45",
          "Subnet Mask: 255.255.255.0",
          "Default Gateway: 192.168.10.1",
          "DNS Server: 192.168.99.99",
        ],
        question:
          "Which value is most suspicious for a DNS-focused failure?",
        options: ["DNS Server: 192.168.99.99", "Subnet Mask: 255.255.255.0", "IPv4 Address: 192.168.10.45", "Default Gateway: 192.168.10.1"],
        answer: "DNS Server: 192.168.99.99",
        explanation:
          "The IP, mask, and gateway look consistent for the subnet. The DNS server address stands out as a likely mismatch.",
        nextStep: "Compare the DNS server with a working endpoint on the same network.",
      },
      {
        id: "OUT-031",
        slug: "decode-interface-brief",
        title: "Decode interface brief",
        difficulty: "Medium",
        time: "5 min",
        skill: "Interface output",
        prompt:
          "Read interface status and protocol state to decide what is broken.",
        evidence: [
          "GigabitEthernet0/1 192.168.10.1 YES manual administratively down down",
          "GigabitEthernet0/2 192.168.20.1 YES manual up up",
          "Serial0/0/0 unassigned YES unset up up",
        ],
        question:
          "What is the clearest problem shown in the output?",
        options: [
          "GigabitEthernet0/1 is administratively shut down",
          "Serial0/0/0 has too much bandwidth",
          "GigabitEthernet0/2 has no protocol",
          "DNS is definitely broken",
        ],
        answer: "GigabitEthernet0/1 is administratively shut down",
        explanation:
          "Administratively down means the interface has been shut down in configuration.",
        nextStep: "Enable the interface if it should be active, then validate reachability.",
      },
    ],
  },

  "fault-domain-finder": {
    slug: "fault-domain-finder",
    title: "Fault Domain Finder",
    eyebrow: "Isolation",
    description:
      "Classify failures into DNS, gateway, switching, routing, ACL/NAT, DHCP, subnetting, or service-layer faults.",
    accent: "from-amber-300 to-emerald-300",
    drills: [
      {
        id: "FDF-032",
        slug: "dns-gateway-or-acl",
        title: "DNS, gateway, or ACL?",
        difficulty: "Hard",
        time: "7 min",
        skill: "Fault isolation",
        prompt:
          "Only one application fails while routing is healthy. Decide the likely fault domain.",
        evidence: [
          "Gateway ping succeeds.",
          "External IP ping succeeds.",
          "Only a specific application connection fails.",
        ],
        question:
          "Which fault domain is most likely?",
        options: ["Application/service or ACL path", "Physical cabling", "Power issue", "Default gateway failure"],
        answer: "Application/service or ACL path",
        explanation:
          "When routing is healthy but one service fails, the fault is likely at the service layer or in a policy path such as ACL/firewall/NAT.",
        nextStep: "Test the specific service port and review relevant policy controls.",
      },
      {
        id: "FDF-018",
        slug: "gateway-or-subnet-mistake",
        title: "Gateway or subnet mistake?",
        difficulty: "Medium",
        time: "5 min",
        skill: "Subnet isolation",
        prompt:
          "A host can reach local devices but not outside the subnet. Classify the fault.",
        evidence: [
          "Local subnet ping succeeds.",
          "Default gateway ping fails.",
          "Other devices can reach the internet.",
        ],
        question:
          "Which fault domain should you check first?",
        options: ["Gateway configuration/path", "DNS only", "HTTPS certificate", "Email service"],
        answer: "Gateway configuration/path",
        explanation:
          "If local communication works but the gateway fails, focus on the gateway address, VLAN path, or router interface.",
        nextStep: "Verify the host default gateway and confirm the gateway interface is reachable.",
      },
      {
        id: "FDF-041",
        slug: "one-vlan-fails",
        title: "One VLAN fails",
        difficulty: "Hard",
        time: "8 min",
        skill: "VLAN isolation",
        prompt:
          "Only one VLAN cannot reach the server network. Decide where to isolate first.",
        evidence: [
          "VLAN 10 reaches the server network.",
          "VLAN 20 cannot reach the server network.",
          "The server is online.",
        ],
        question:
          "Where should you isolate first?",
        options: ["VLAN 20 gateway, routing, or ACL path", "Server power cable", "All DNS records", "Keyboard input"],
        answer: "VLAN 20 gateway, routing, or ACL path",
        explanation:
          "Because only one VLAN fails, the issue is likely in that VLAN’s gateway, routing path, or policy control.",
        nextStep: "Compare VLAN 20 routing and ACL behavior against a working VLAN.",
      },
    ],
  },

  "repair-proof": {
    slug: "repair-proof",
    title: "Repair Proof",
    eyebrow: "Validation",
    description:
      "Choose the follow-up command or test that proves a repair actually worked.",
    accent: "from-lime-300 to-emerald-400",
    drills: [
      {
        id: "VAL-011",
        slug: "prove-the-repair",
        title: "Prove the repair",
        difficulty: "Medium",
        time: "5 min",
        skill: "Repair validation",
        prompt:
          "After enabling a switchport, choose the command and test that validates the fix.",
        evidence: [
          "Switchport was administratively down.",
          "The port has been enabled.",
          "The user reports network access may be restored.",
        ],
        question:
          "Which validation is strongest?",
        options: [
          "Confirm port status and test client gateway reachability",
          "Change DNS immediately",
          "Restart the dashboard",
          "Assume the fix worked",
        ],
        answer: "Confirm port status and test client gateway reachability",
        explanation:
          "A repair is not proven until the device state and the user-facing symptom both validate the fix.",
        nextStep: "Check switchport status, then test the client’s gateway and target service.",
      },
      {
        id: "VAL-018",
        slug: "dns-fix-validation",
        title: "DNS fix validation",
        difficulty: "Easy",
        time: "3 min",
        skill: "DNS validation",
        prompt:
          "After correcting DNS settings, choose the test that proves name resolution works.",
        evidence: [
          "The DNS server was corrected on the endpoint.",
          "Gateway and IP reachability already passed.",
          "Websites previously failed by name.",
        ],
        question:
          "Which test proves the DNS fix most directly?",
        options: ["nslookup example.com", "show interfaces status", "Replace the cable", "Check monitor brightness"],
        answer: "nslookup example.com",
        explanation:
          "A successful lookup proves that the corrected DNS setting can resolve names.",
        nextStep: "Follow the lookup with a real application test such as browsing to a website.",
      },
      {
        id: "VAL-025",
        slug: "gateway-repair-proof",
        title: "Gateway repair proof",
        difficulty: "Medium",
        time: "5 min",
        skill: "Gateway validation",
        prompt:
          "After fixing a default gateway, choose the evidence that validates the repair.",
        evidence: [
          "The client default gateway was wrong.",
          "The gateway has been corrected.",
          "The user still needs internet access validated.",
        ],
        question:
          "Which validation sequence is best?",
        options: [
          "Ping gateway, ping external IP, then test DNS/application",
          "Only check the hostname",
          "Only reboot the client",
          "Only inspect the switch model",
        ],
        answer: "Ping gateway, ping external IP, then test DNS/application",
        explanation:
          "Gateway validation should prove local gateway reachability, upstream IP reachability, and then the user-facing service.",
        nextStep: "Document the evidence chain after each test passes.",
      },
    ],
  },
};

function findDrill(categorySlug: string, drillSlug: string) {
  const category = categories[categorySlug];
  const drill = category?.drills.find((item) => item.slug === drillSlug);

  return { category, drill };
}

function getDifficultyTone(difficulty: Difficulty) {
  if (difficulty === "Easy") {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
  }

  if (difficulty === "Medium") {
    return "border-cyan-400/25 bg-cyan-400/10 text-cyan-300";
  }

  return "border-rose-400/25 bg-rose-400/10 text-rose-300";
}

function ResultPanel({
  selectedAnswer,
  answer,
  explanation,
  nextStep,
}: {
  selectedAnswer: string | null;
  answer: string;
  explanation: string;
  nextStep: string;
}) {
  if (!selectedAnswer) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          Result
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Select an answer to reveal whether your evidence chain is correct.
        </p>
      </div>
    );
  }

  const correct = selectedAnswer === answer;

  return (
    <div
      className={`rounded-2xl border p-5 ${
        correct
          ? "border-emerald-400/25 bg-emerald-400/[0.075]"
          : "border-rose-400/25 bg-rose-400/[0.075]"
      }`}
    >
      <p
        className={`text-xs font-bold uppercase tracking-[0.18em] ${
          correct ? "text-emerald-300" : "text-rose-300"
        }`}
      >
        {correct ? "Correct evidence path" : "Not the strongest proof"}
      </p>

      <h3 className="mt-3 text-lg font-semibold text-white">
        {correct ? "That proves the right fault domain." : `Best answer: ${answer}`}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-300">{explanation}</p>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          Next step
        </p>
        <p className="mt-1 text-sm text-slate-300">{nextStep}</p>
      </div>
    </div>
  );
}

export default function ChallengeDrillPage({
  params,
}: {
  params: Promise<{ category: string; drillId: string }>;
}) {
  const resolvedParams = use(params);
  const { category, drill } = useMemo(
    () => findDrill(resolvedParams.category, resolvedParams.drillId),
    [resolvedParams.category, resolvedParams.drillId],
  );

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  if (!category || !drill) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[1480px] p-4 lg:p-5">
          <div className="max-w-3xl rounded-3xl border border-white/10 bg-slate-950/50 p-8 shadow-[0_24px_90px_rgba(0,0,0,.45)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-300">
              Drill not found
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              This challenge drill does not exist.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              The category or drill URL does not match a registered challenge.
            </p>
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

  const correct = selectedAnswer === drill.answer;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1480px] space-y-5 p-4 lg:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.055] px-4 py-3 text-sm text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/challenges"
              className="font-semibold text-emerald-200 transition hover:text-white"
            >
              Challenges
            </Link>
            <span className="text-slate-600">/</span>
            <Link
              href={`/challenges/${category.slug}`}
              className="font-semibold text-emerald-200 transition hover:text-white"
            >
              {category.title}
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300">{drill.id}</span>
          </div>

          <span className="hidden text-[11px] uppercase tracking-widest text-emerald-300/80 md:inline">
            Drill Console
          </span>
        </div>

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-[0_24px_90px_rgba(0,0,0,.45),inset_0_1px_0_rgba(255,255,255,.04)] lg:p-8">
          <div
            className={`absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br ${category.accent} opacity-20 blur-3xl`}
          />
          <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(45,212,191,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,.16)_1px,transparent_1px)] [background-size:38px_38px]" />

          <div className="relative grid gap-6 xl:grid-cols-[1fr_360px]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                {category.eyebrow} · {drill.id}
              </p>

              <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-white lg:text-6xl">
                {drill.title}
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 lg:text-base">
                {drill.prompt}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
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
                <span className="rounded-md border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-xs font-semibold text-cyan-300">
                  {drill.skill}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Drill Objective
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Read the evidence, avoid guessing, and choose the proof that best
                identifies the fault.
              </p>

              <div className="mt-5 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                  Current Status
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  {selectedAnswer
                    ? correct
                      ? "Validated"
                      : "Review needed"
                    : "Awaiting answer"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="rounded-3xl border border-white/10 bg-slate-950/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                  Evidence
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white">
                  What do we know?
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                No guessing
              </span>
            </div>

            <div className="space-y-3">
              {drill.evidence.map((item, index) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-sm font-bold text-emerald-200">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-slate-300">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.055] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                Question
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                {drill.question}
              </h3>

              <div className="mt-4 grid gap-3">
                {drill.options.map((option) => {
                  const selected = selectedAnswer === option;
                  const isCorrectAnswer = option === drill.answer;
                  const showCorrect = selectedAnswer && isCorrectAnswer;
                  const showWrong = selected && !isCorrectAnswer;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedAnswer(option)}
                      className={`rounded-2xl border p-4 text-left text-sm transition ${
                        showCorrect
                          ? "border-emerald-400/50 bg-emerald-400/[0.12] text-emerald-100"
                          : showWrong
                            ? "border-rose-400/50 bg-rose-400/[0.12] text-rose-100"
                            : selected
                              ? "border-cyan-400/40 bg-cyan-400/[0.1] text-cyan-100"
                              : "border-white/10 bg-black/20 text-slate-300 hover:border-emerald-400/30 hover:bg-emerald-400/[0.055]"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <ResultPanel
              selectedAnswer={selectedAnswer}
              answer={drill.answer}
              explanation={drill.explanation}
              nextStep={drill.nextStep}
            />

            <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                Navigation
              </p>

              <div className="mt-4 grid gap-3">
                <Link
                  href={`/challenges/${category.slug}`}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm font-semibold text-slate-300 transition hover:border-emerald-400/30 hover:text-emerald-200"
                >
                  Back to {category.title}
                </Link>

                <Link
                  href="/challenges"
                  className="rounded-xl border border-emerald-400/40 bg-emerald-400/[0.075] px-4 py-3 text-center text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/[0.12]"
                >
                  All Challenges
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Evidence Habit
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                A good troubleshooter does not only pick the fix. They pick the
                proof that shows why the fix is correct.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}