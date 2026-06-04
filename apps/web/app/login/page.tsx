"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useState } from "react";
import { loginUser } from "@/lib/api/authApi";
import { saveAuth } from "@/lib/auth/authStorage";

type IconName =
  | "email"
  | "lock"
  | "eye"
  | "google"
  | "github"
  | "microsoft"
  | "shield";

const iconPaths: Record<IconName, ReactNode> = {
  email: (
    <>
      <path d="M4 6h16v12H4z" />
      <path d="M4 7l8 6 8-6" />
    </>
  ),
  lock: (
    <>
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
      <path d="M5 11h14v10H5z" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  google: (
    <>
      <path
        fill="#4285F4"
        stroke="none"
        d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.4c-.2 1.2-.9 2.2-1.9 2.9v2.4h3.1c1.8-1.7 3-4.1 3-7z"
      />
      <path
        fill="#34A853"
        stroke="none"
        d="M12 22c2.7 0 5-.9 6.6-2.4l-3.1-2.4c-.9.6-2 1-3.5 1-2.7 0-4.9-1.8-5.7-4.2H3.1v2.5C4.8 19.8 8.1 22 12 22z"
      />
      <path
        fill="#FBBC05"
        stroke="none"
        d="M6.3 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.5H3.1C2.4 8.8 2 10.4 2 12s.4 3.2 1.1 4.5L6.3 14z"
      />
      <path
        fill="#EA4335"
        stroke="none"
        d="M12 5.8c1.5 0 2.8.5 3.8 1.5l2.8-2.8C17 2.9 14.7 2 12 2 8.1 2 4.8 4.2 3.1 7.5L6.3 10c.8-2.4 3-4.2 5.7-4.2z"
      />
    </>
  ),
  github: (
    <path
      fill="currentColor"
      stroke="none"
      d="M12 .5A12 12 0 0 0 8.2 23.9c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1.8 2.1 3.5 1.5.1-.7.4-1.2.7-1.5-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.4 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5z"
    />
  ),
  microsoft: (
    <>
      <path fill="#f25022" stroke="none" d="M3 3h8v8H3z" />
      <path fill="#7fba00" stroke="none" d="M13 3h8v8h-8z" />
      <path fill="#00a4ef" stroke="none" d="M3 13h8v8H3z" />
      <path fill="#ffb900" stroke="none" d="M13 13h8v8h-8z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-5" />
    </>
  ),
};

function Icon({
  name,
  className = "",
  strokeWidth = 1.8,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  const isBrandIcon =
    name === "google" || name === "github" || name === "microsoft";

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke={isBrandIcon ? "none" : "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
}

function BrandLines() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-95"
      viewBox="0 0 620 1280"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="luxLineMain" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#31ffd0" stopOpacity="0.3" />
          <stop offset="36%" stopColor="#31ffd0" stopOpacity="0.17" />
          <stop offset="70%" stopColor="#31ffd0" stopOpacity="0.065" />
          <stop offset="100%" stopColor="#31ffd0" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="luxTopLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#31ffd0" stopOpacity="0.28" />
          <stop offset="38%" stopColor="#dffff8" stopOpacity="0.12" />
          <stop offset="72%" stopColor="#31ffd0" stopOpacity="0.055" />
          <stop offset="100%" stopColor="#31ffd0" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="luxTopHair" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.075" />
          <stop offset="58%" stopColor="#31ffd0" stopOpacity="0.045" />
          <stop offset="100%" stopColor="#31ffd0" stopOpacity="0" />
        </linearGradient>

        <radialGradient id="luxMist" cx="0%" cy="78%" r="74%">
          <stop offset="0%" stopColor="#31ffd0" stopOpacity="0.075" />
          <stop offset="48%" stopColor="#31ffd0" stopOpacity="0.018" />
          <stop offset="100%" stopColor="#31ffd0" stopOpacity="0" />
        </radialGradient>

        <filter id="luxSoftBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.35" result="soft" />
          <feMerge>
            <feMergeNode in="soft" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="620" height="1280" fill="url(#luxMist)" />

      <g
        fill="none"
        stroke="url(#luxTopLine)"
        strokeWidth="1.15"
        filter="url(#luxSoftBlur)"
      >
        <path d="M-72 118 C42 60 138 52 226 91 C302 125 325 193 286 249 C245 309 256 362 329 393 C421 432 526 386 676 286" />
        <path d="M-58 174 C58 105 158 99 246 139 C320 173 343 236 303 291 C262 349 280 396 353 421 C446 453 550 405 692 316" />
        <path d="M-42 232 C76 153 180 147 269 188 C340 222 365 280 324 334 C284 387 306 429 379 449 C472 475 574 426 710 350" />
      </g>

      <g fill="none" stroke="url(#luxTopHair)" strokeWidth="0.76">
        <path d="M24 42 C116 21 198 41 258 94 C315 145 317 201 276 247 C236 292 249 334 313 362 C391 395 492 360 642 254" />
        <path d="M54 292 C134 226 223 211 291 246 C354 278 370 326 333 371 C298 414 318 447 384 461 C464 478 557 438 684 373" />
      </g>

      <g
        fill="none"
        stroke="url(#luxLineMain)"
        strokeWidth="1.08"
        filter="url(#luxSoftBlur)"
      >
        <path d="M-210 1168 C-35 1034 90 1014 205 964 C327 911 392 817 459 704 C529 586 623 526 773 506" />
        <path d="M-198 1218 C-8 1062 126 1052 239 1001 C361 946 431 855 501 739 C572 621 666 566 811 545" />
        <path d="M-178 1267 C29 1096 162 1093 276 1041 C400 985 471 895 541 779 C614 659 704 606 850 585" />
      </g>

      <g fill="none" stroke="#31ffd0" strokeOpacity="0.06" strokeWidth="0.72">
        <path d="M-74 997 C54 908 146 871 252 816 C356 762 427 683 497 574 C570 461 660 420 801 404" />
        <path d="M-54 1052 C82 944 179 913 286 857 C394 801 465 722 535 612 C608 499 698 460 838 443" />
        <path d="M-30 1108 C112 983 214 956 322 900 C432 843 504 764 575 651 C648 538 738 500 876 483" />
      </g>

      <g fill="#31ffd0" opacity="0.16">
        <circle cx="226" cy="91" r="1.35" />
        <circle cx="286" cy="249" r="1.25" />
        <circle cx="329" cy="393" r="1.25" />
        <circle cx="246" cy="139" r="1.25" />
        <circle cx="303" cy="291" r="1.2" />
        <circle cx="379" cy="449" r="1.2" />
        <circle cx="205" cy="964" r="1.35" />
        <circle cx="459" cy="704" r="1.25" />
        <circle cx="239" cy="1001" r="1.25" />
      </g>

      <rect width="620" height="1280" fill="rgba(0,0,0,0.17)" />
    </svg>
  );
}

function ProviderButton({
  icon,
  children,
}: {
  icon: IconName;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="inline-flex h-[58px] items-center justify-center gap-3 rounded-[10px] border border-white/[0.14] bg-[linear-gradient(180deg,rgba(255,255,255,.058),rgba(255,255,255,.02))] text-[0.98rem] font-semibold text-[#f4f7f7] transition hover:-translate-y-0.5 hover:border-[#31ffd0]/30 hover:bg-[#31ffd0]/[0.036] hover:shadow-[0_0_20px_rgba(49,255,208,.035)]"
    >
      <Icon name={icon} className="h-[22px] w-[22px] shrink-0" />
      {children}
    </button>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await loginUser(email, password);
      saveAuth(result.token, result.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-[#f4f7f7] antialiased lg:grid lg:grid-cols-[36.2%_63.8%]">
      <aside className="relative min-h-[620px] overflow-hidden border-b border-white/[0.09] bg-[linear-gradient(120deg,rgba(255,255,255,.035),transparent_22%),radial-gradient(circle_at_20%_74%,rgba(49,255,208,.065),transparent_35%),radial-gradient(circle_at_58%_22%,rgba(49,255,208,.018),transparent_36%),linear-gradient(180deg,#040d0c_0%,#020606_56%,#010303_100%)] lg:min-h-screen lg:border-b-0 lg:border-r lg:border-white/[0.07]">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(49,255,208,.10)_1px,transparent_1.25px)] bg-[length:22px_22px] opacity-[0.038] [mask-image:radial-gradient(circle_at_22%_24%,black_0%,transparent_42%),linear-gradient(to_right,black,transparent_86%)]" />

        <BrandLines />

        <div className="absolute inset-0 z-[1] bg-[linear-gradient(118deg,transparent_0%,transparent_16%,rgba(255,255,255,.035)_24%,rgba(49,255,208,.026)_31%,transparent_42%,transparent_100%)] opacity-70" />

        <div className="absolute inset-0 z-[1] bg-[linear-gradient(135deg,rgba(255,255,255,.045),transparent_14%,transparent_70%),linear-gradient(180deg,rgba(255,255,255,.012),transparent_18%,transparent_78%,rgba(0,0,0,.32))]" />

        <div className="relative z-[2] flex min-h-[620px] flex-col justify-center px-7 py-14 sm:px-[11%] lg:min-h-screen lg:px-[clamp(42px,7vw,138px)]">
          <div className="max-w-[430px] translate-y-4 lg:translate-y-[54px]">
            <h2 className="mb-[18px] text-[2.9rem] font-black leading-[1.02] tracking-[-0.067em] text-[#f7faf9] [text-shadow:0_1px_0_rgba(255,255,255,.04),0_16px_44px_rgba(0,0,0,.78)] sm:text-[clamp(2.7rem,4.15vw,4.15rem)]">
              Hands-on labs.
              <br />
              Real failures.
              <br />
              <span className="text-[#31ffd0] [text-shadow:0_0_8px_rgba(49,255,208,.14),0_14px_34px_rgba(0,0,0,.72)]">
                Real skills.
              </span>
            </h2>

            <div className="mb-[22px] h-px w-[46px] bg-[linear-gradient(90deg,#31ffd0,rgba(49,255,208,.2))] shadow-[0_0_7px_rgba(49,255,208,.14)]" />

            <p className="max-w-[365px] text-[0.98rem] leading-[1.72] tracking-[-0.012em] text-[#a7afad] [text-shadow:0_12px_32px_rgba(0,0,0,.78)] sm:text-[1.02rem]">
              Practice network troubleshooting in realistic environments and
              build confidence that transfers to the job.
            </p>
          </div>
        </div>
      </aside>

      <section className="relative grid min-h-screen place-items-center bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,.022),transparent_22%),#000] px-6 py-[90px] sm:px-8 lg:py-16">
        <Link
          href="/"
          className="absolute left-6 top-6 text-base font-medium text-[#f6f6f6] opacity-90 transition hover:text-[#31ffd0] hover:opacity-100 sm:left-[52px] sm:top-[34px]"
        >
          ← Home
        </Link>

        <div className="w-full max-w-[560px] text-center drop-shadow-[0_24px_70px_rgba(0,0,0,.42)]">
          <h1 className="mb-[14px] text-[clamp(2rem,3vw,2.7rem)] font-extrabold leading-none tracking-[-0.055em]">
            Log in to{" "}
            <span className="text-[#31ffd0] [text-shadow:0_0_14px_rgba(49,255,208,.18)]">
              NETLABS
            </span>
          </h1>

          <p className="mb-[38px] text-base text-[#a2aaa8]">
            Connect to your lab environment.
          </p>

          <div className="mb-[34px] grid gap-[14px] sm:grid-cols-2">
            <ProviderButton icon="google">Continue with Google</ProviderButton>
            <ProviderButton icon="github">Continue with GitHub</ProviderButton>
            <ProviderButton icon="microsoft">
              Continue with Microsoft
            </ProviderButton>
            <ProviderButton icon="shield">
              Continue with Microsoft Entra
            </ProviderButton>
          </div>

          <div className="mb-[30px] flex items-center gap-[18px] text-[0.96rem] text-[#a2aaa8] before:h-px before:flex-1 before:bg-white/[0.09] after:h-px after:flex-1 after:bg-white/[0.09]">
            Or continue with
          </div>

          <form onSubmit={handleSubmit} className="text-left">
            <div className="mb-[22px]">
              <div className="mb-[9px] flex items-center justify-between">
                <label
                  htmlFor="email"
                  className="text-[0.95rem] font-semibold text-[#f6f6f6]"
                >
                  Email address
                </label>
              </div>

              <div className="relative">
                <Icon
                  name="email"
                  className="pointer-events-none absolute left-[18px] top-1/2 h-[19px] w-[19px] -translate-y-1/2 text-white/40"
                />

                <input
                  id="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="h-[58px] w-full rounded-[9px] border border-white/[0.14] bg-white/[0.045] px-[52px] text-base tracking-[-0.01em] text-[#f4f7f7] outline-none transition placeholder:text-white/35 focus:border-[#31ffd0]/40 focus:bg-white/[0.058] focus:shadow-[0_0_0_4px_rgba(49,255,208,.045)]"
                />
              </div>
            </div>

            <div className="mb-[22px]">
              <div className="mb-[9px] flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-[0.95rem] font-semibold text-[#f6f6f6]"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-[#31ffd0] transition hover:text-[#8dffe8]"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="relative">
                <Icon
                  name="lock"
                  className="pointer-events-none absolute left-[18px] top-1/2 h-[19px] w-[19px] -translate-y-1/2 text-white/40"
                />

                <input
                  id="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  className="h-[58px] w-full rounded-[9px] border border-white/[0.14] bg-white/[0.045] px-[52px] text-base tracking-[-0.01em] text-[#f4f7f7] outline-none transition placeholder:text-white/35 focus:border-[#31ffd0]/40 focus:bg-white/[0.058] focus:shadow-[0_0_0_4px_rgba(49,255,208,.045)]"
                />

                <Icon
                  name="eye"
                  className="pointer-events-none absolute right-[18px] top-1/2 h-[19px] w-[19px] -translate-y-1/2 text-white/40"
                />
              </div>
            </div>

            {error ? (
              <div className="mb-4 rounded-[9px] border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 h-[60px] w-full rounded-[9px] border border-[#31ffd0]/40 bg-[linear-gradient(180deg,rgba(49,255,208,.095),rgba(49,255,208,.028))] text-base font-bold text-[#f4f7f7] transition hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(49,255,208,.125),rgba(49,255,208,.045))] hover:shadow-[0_0_0_4px_rgba(49,255,208,.025),0_0_22px_rgba(49,255,208,.07)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-[26px] text-center text-base text-[#a2aaa8]">
            New to NETLABS?{" "}
            <Link
              href="/register"
              className="font-bold text-[#31ffd0] transition hover:text-[#8dffe8]"
            >
              Sign up for an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}