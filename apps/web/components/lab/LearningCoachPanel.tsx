"use client";

import { useMemo, useState } from "react";

type Props = {
  category?: string;
  title?: string;
};

function getCoachContent(category?: string, title?: string) {
  if (category === "dns" || title?.toLowerCase().includes("dns")) {
    return {
      heading: "Learning Coach",
      subheading: "Concept guidance",
      items: [
        {
          title: "What DNS does",
          body:
            "DNS translates human-friendly names like google.com into IP addresses so devices know where to send traffic.",
        },
        {
          title: "Why IP works but names fail",
          body:
            "If pinging an IP works but pinging a hostname fails, basic IP connectivity may be fine, but name resolution is failing somewhere in the path.",
        },
        {
          title: "Common DNS misconfigurations",
          body:
            "Common issues include a missing DNS server, a wrong DNS server address, DNS entries that are unreachable, or a typo in the configured resolver.",
        },
        {
          title: "How to confirm the fix",
          body:
            "Check the device IP settings, verify the DNS server address, then test with a hostname again. If hostname resolution starts working, the fix is likely correct.",
        },
      ],
      answer:
        "Likely direction: inspect the PC DNS configuration and confirm the correct DNS server is configured.",
    };
  }

  if (category === "subnetting") {
    return {
      heading: "Learning Coach",
      subheading: "Concept guidance",
      items: [
        {
          title: "What subnetting affects",
          body:
            "The subnet mask tells the device which addresses are local and which must be sent to the default gateway.",
        },
        {
          title: "Why the gateway may fail",
          body:
            "If the mask is wrong, the host may incorrectly decide that the gateway is outside the local network and fail to reach it properly.",
        },
        {
          title: "Common subnet mistakes",
          body:
            "Using a mask that is too small, too large, or mismatched with the rest of the subnet causes addressing confusion and broken connectivity.",
        },
        {
          title: "How to confirm the fix",
          body:
            "Compare IP, subnet mask, and gateway together. After correcting the mask, test ping to the gateway and then beyond.",
        },
      ],
      answer:
        "Likely direction: inspect the subnet mask on the PC and make sure it matches the intended network.",
    };
  }

  return {
    heading: "Learning Coach",
    subheading: "Concept guidance",
    items: [
      {
        title: "Understand the symptom",
        body:
          "Read the symptom carefully and separate what works from what fails. That usually tells you which layer is healthy and which layer is broken.",
      },
      {
        title: "Think in layers",
        body:
          "Start from local host settings, then interface status, then switching, then routing, then application-specific services.",
      },
      {
        title: "Look for mismatches",
        body:
          "Most labs fail because one small value is wrong: an IP, mask, gateway, DNS entry, interface state, or VLAN placement.",
      },
      {
        title: "Confirm the fix",
        body:
          "After changing something, test the exact symptom again so you know whether the issue is truly resolved.",
      },
    ],
    answer:
      "Use the symptom, inspect the selected device, test commands, and verify the issue from the most likely layer outward.",
  };
}

function CoachSection({ title, body }: { title: string; body: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-4 text-left"
      >
        <span className="font-semibold text-white">{title}</span>
        <span className="text-slate-500 text-sm">{open ? "−" : "+"}</span>
      </button>

      <div
        className={`${
          open ? "block" : "hidden"
        } border-t border-slate-800 px-4 py-4`}
      >
        <p className="text-sm text-slate-300 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

export function LearningCoachPanel({ category, title }: Props) {
  const [showAnswer, setShowAnswer] = useState(false);

  const coach = useMemo(
    () => getCoachContent(category, title),
    [category, title]
  );

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/15 overflow-hidden">
      <div className="border-b border-slate-800 px-6 py-5">
        <p className="text-blue-400 text-sm font-semibold mb-2">
          {coach.heading}
        </p>
        <h2 className="text-2xl font-black">{coach.subheading}</h2>
      </div>

      <div className="p-6 space-y-4">
        {coach.items.map((item) => (
          <CoachSection key={item.title} title={item.title} body={item.body} />
        ))}

        <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAnswer((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-4 text-left"
          >
            <span className="font-semibold text-white">
              Reveal answer direction
            </span>
            <span className="text-slate-500 text-sm">
              {showAnswer ? "Hide" : "Show"}
            </span>
          </button>

          <div
            className={`${
              showAnswer ? "block" : "hidden"
            } border-t border-slate-800 px-4 py-4`}
          >
            <p className="text-sm text-yellow-200 leading-relaxed">
              {coach.answer}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LearningCoachPanel;