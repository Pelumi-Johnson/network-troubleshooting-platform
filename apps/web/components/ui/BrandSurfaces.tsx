import React from "react";

type BrandPanelProps = {
  children: React.ReactNode;
  className?: string;
};

type BrandHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function BrandBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,.05)_1px,transparent_1px)] bg-[size:90px_90px] opacity-40 [mask-image:radial-gradient(circle_at_50%_10%,black,transparent_75%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(16,185,129,.16),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(59,130,246,.12),transparent_26%),radial-gradient(circle_at_50%_90%,rgba(15,118,110,.12),transparent_36%)]" />
      <div className="absolute left-0 top-[38%] h-px w-full bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />
      <div className="absolute left-0 top-[64%] h-px w-full bg-gradient-to-r from-transparent via-blue-400/10 to-transparent" />
    </div>
  );
}

export function BrandPanel({ children, className = "" }: BrandPanelProps) {
  return (
    <section
      className={`overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}

export function BrandPanelHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: BrandHeaderProps) {
  return (
    <div className="border-b border-white/10 bg-black/30 px-6 py-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
              {eyebrow}
            </p>
          )}

          <h2 className="text-2xl font-black tracking-tight text-white">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-2 text-sm leading-6 text-zinc-400">{subtitle}</p>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

export function StatusChip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const tones = {
    neutral: "border-white/10 bg-white/5 text-zinc-300",
    success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    warning: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
    danger: "border-red-400/30 bg-red-400/10 text-red-300",
    info: "border-blue-400/30 bg-blue-400/10 text-blue-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function PrimaryAction({
  children,
  onClick,
  disabled,
  type = "button",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl bg-emerald-500 px-4 py-3 font-bold text-black transition hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryAction({
  children,
  onClick,
  disabled,
  type = "button",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold text-zinc-300 transition hover:bg-white/[0.08] disabled:text-slate-600 ${className}`}
    >
      {children}
    </button>
  );
}