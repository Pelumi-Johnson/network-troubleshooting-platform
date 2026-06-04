"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { loginUser } from "@/lib/api/authApi";
import { saveAuth } from "@/lib/auth/authStorage";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <>
      <main className="auth-page">
        <aside className="brand-panel">
          <svg
            className="brand-lines"
            viewBox="0 0 620 1280"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="luxLineMain" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#31ffd0" stopOpacity="0.30" />
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

          <div className="brand-shine" />

          <div className="brand-content">
            <div className="brand-copy-block">
              <h2 className="brand-title">
                Hands-on labs.
                <br />
                Real failures.
                <br />
                <span>Real skills.</span>
              </h2>

              <div className="accent-line" />

              <p className="brand-copy">
                Practice network troubleshooting in realistic environments and
                build confidence that transfers to the job.
              </p>
            </div>
          </div>
        </aside>

        <section className="login-side">
          <Link href="/" className="home-link">
            ← Home
          </Link>

          <div className="login-box">
            <h1>
              Log in to <span>NetworkLab</span>
            </h1>

            <p className="subtitle">Connect to your lab environment.</p>

            <div className="provider-grid">
              <button className="provider-btn" type="button">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.4c-.2 1.2-.9 2.2-1.9 2.9v2.4h3.1c1.8-1.7 3-4.1 3-7z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 22c2.7 0 5-.9 6.6-2.4l-3.1-2.4c-.9.6-2 1-3.5 1-2.7 0-4.9-1.8-5.7-4.2H3.1v2.5C4.8 19.8 8.1 22 12 22z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M6.3 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.5H3.1C2.4 8.8 2 10.4 2 12s.4 3.2 1.1 4.5L6.3 14z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.8c1.5 0 2.8.5 3.8 1.5l2.8-2.8C17 2.9 14.7 2 12 2 8.1 2 4.8 4.2 3.1 7.5L6.3 10c.8-2.4 3-4.2 5.7-4.2z"
                  />
                </svg>
                Continue with Google
              </button>

              <button className="provider-btn" type="button">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .5A12 12 0 0 0 8.2 23.9c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1.8 2.1 3.5 1.5.1-.7.4-1.2.7-1.5-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.4 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5z" />
                </svg>
                Continue with GitHub
              </button>

              <button className="provider-btn" type="button">
                <svg viewBox="0 0 24 24">
                  <path fill="#f25022" d="M3 3h8v8H3z" />
                  <path fill="#7fba00" d="M13 3h8v8h-8z" />
                  <path fill="#00a4ef" d="M3 13h8v8H3z" />
                  <path fill="#ffb900" d="M13 13h8v8h-8z" />
                </svg>
                Continue with Microsoft
              </button>

              <button className="provider-btn" type="button">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2f9bff"
                  strokeWidth="2"
                >
                  <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3z" />
                  <path d="M9 12l2 2 4-5" />
                </svg>
                Continue with Microsoft Entra
              </button>
            </div>

            <div className="divider">Or continue with</div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <div className="form-head">
                  <label htmlFor="email">Email address</label>
                </div>

                <div className="input-wrap">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M4 6h16v12H4z" />
                    <path d="M4 7l8 6 8-6" />
                  </svg>

                  <input
                    id="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-head">
                  <label htmlFor="password">Password</label>
                  <Link href="/forgot-password" className="forgot">
                    Forgot Password?
                  </Link>
                </div>

                <div className="input-wrap">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M7 11V8a5 5 0 0 1 10 0v3" />
                    <path d="M5 11h14v10H5z" />
                  </svg>

                  <input
                    id="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />

                  <svg
                    className="eye"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
              </div>

              {error ? <div className="error-box">{error}</div> : null}

              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <p className="signup">
              New to NetworkLab?{" "}
              <Link href="/register">Sign up for an account</Link>
            </p>
          </div>
        </section>
      </main>

      <style>{`
        :root {
          --text: #f4f7f7;
          --muted: #a7afad;
          --muted-dark: rgba(255, 255, 255, 0.42);
          --input: rgba(255, 255, 255, 0.045);
          --input-border: rgba(255, 255, 255, 0.14);
          --teal: #31ffd0;
        }

        .auth-page,
        .auth-page * {
          box-sizing: border-box;
        }

        .auth-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 36.2% 63.8%;
          background: #000;
          color: var(--text);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
          overflow-x: hidden;
        }

        .brand-panel {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          border-right: 1px solid rgba(255, 255, 255, 0.07);
          background:
            linear-gradient(120deg, rgba(255,255,255,0.035), transparent 22%),
            radial-gradient(circle at 20% 74%, rgba(49, 255, 208, 0.065), transparent 35%),
            radial-gradient(circle at 58% 22%, rgba(49, 255, 208, 0.018), transparent 36%),
            linear-gradient(180deg, #040d0c 0%, #020606 56%, #010303 100%);
        }

        .brand-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle, rgba(49, 255, 208, 0.10) 1px, transparent 1.25px);
          background-size: 22px 22px;
          opacity: 0.038;
          mask-image:
            radial-gradient(circle at 22% 24%, black 0%, transparent 42%),
            linear-gradient(to right, black, transparent 86%);
          pointer-events: none;
        }

        .brand-panel::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(135deg, rgba(255,255,255,0.045), transparent 14%, transparent 70%),
            linear-gradient(180deg, rgba(255,255,255,0.012), transparent 18%, transparent 78%, rgba(0,0,0,0.32));
          pointer-events: none;
        }

        .brand-lines {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0.98;
          pointer-events: none;
        }

        .brand-shine {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background:
            linear-gradient(
              118deg,
              transparent 0%,
              transparent 16%,
              rgba(255,255,255,0.035) 24%,
              rgba(49,255,208,0.026) 31%,
              transparent 42%,
              transparent 100%
            );
          opacity: 0.72;
        }

        .brand-content {
          position: relative;
          z-index: 2;
          min-height: 100vh;
          padding: 0 clamp(42px, 7vw, 138px);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .brand-copy-block {
          max-width: 430px;
          transform: translateY(54px);
        }

        .brand-title {
          font-size: clamp(2.7rem, 4.15vw, 4.15rem);
          line-height: 1.02;
          letter-spacing: -0.067em;
          font-weight: 860;
          color: #f7faf9;
          text-shadow:
            0 1px 0 rgba(255,255,255,0.04),
            0 16px 44px rgba(0, 0, 0, 0.78);
          margin-bottom: 18px;
        }

        .brand-title span {
          color: var(--teal);
          text-shadow:
            0 0 8px rgba(49, 255, 208, 0.14),
            0 14px 34px rgba(0,0,0,0.72);
        }

        .accent-line {
          width: 46px;
          height: 2px;
          background: linear-gradient(90deg, #31ffd0, rgba(49,255,208,0.2));
          margin-bottom: 22px;
          box-shadow: 0 0 7px rgba(49, 255, 208, 0.14);
        }

        .brand-copy {
          max-width: 365px;
          color: var(--muted);
          font-size: 1.02rem;
          line-height: 1.72;
          letter-spacing: -0.012em;
          text-shadow: 0 12px 32px rgba(0, 0, 0, 0.78);
        }

        .login-side {
          position: relative;
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 64px 32px;
          background:
            radial-gradient(circle at 50% 38%, rgba(255, 255, 255, 0.022), transparent 22%),
            #000;
        }

        .home-link {
          position: absolute;
          top: 34px;
          left: 52px;
          color: #f6f6f6;
          text-decoration: none;
          font-size: 1rem;
          font-weight: 560;
          opacity: 0.92;
          transition: color 0.2s ease, opacity 0.2s ease;
        }

        .home-link:hover {
          color: var(--teal);
          opacity: 1;
        }

        .login-box {
          width: min(100%, 560px);
          text-align: center;
          filter: drop-shadow(0 24px 70px rgba(0,0,0,0.42));
        }

        .login-box h1 {
          font-size: clamp(2rem, 3vw, 2.7rem);
          line-height: 1;
          letter-spacing: -0.055em;
          font-weight: 820;
          margin-bottom: 14px;
        }

        .login-box h1 span {
          color: var(--teal);
          text-shadow: 0 0 14px rgba(49, 255, 208, 0.18);
        }

        .subtitle {
          color: #a2aaa8;
          font-size: 1rem;
          margin-bottom: 38px;
        }

        .provider-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 34px;
        }

        .provider-btn {
          height: 58px;
          border: 1px solid var(--input-border);
          border-radius: 10px;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.058), rgba(255, 255, 255, 0.02));
          color: var(--text);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          font-size: 0.98rem;
          font-weight: 650;
          cursor: pointer;
          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .provider-btn:hover {
          border-color: rgba(49, 255, 208, 0.28);
          background: rgba(49, 255, 208, 0.036);
          transform: translateY(-1px);
          box-shadow: 0 0 20px rgba(49, 255, 208, 0.035);
        }

        .provider-btn svg {
          width: 22px;
          height: 22px;
          flex: 0 0 22px;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 18px;
          color: #a2aaa8;
          font-size: 0.96rem;
          margin-bottom: 30px;
        }

        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.09);
        }

        .auth-page form {
          text-align: left;
        }

        .form-group {
          margin-bottom: 22px;
        }

        .form-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 9px;
        }

        .auth-page label {
          color: #f6f6f6;
          font-size: 0.95rem;
          font-weight: 650;
        }

        .forgot {
          color: var(--teal);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 650;
        }

        .input-wrap {
          position: relative;
        }

        .input-wrap svg {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          width: 19px;
          height: 19px;
          color: var(--muted-dark);
          pointer-events: none;
        }

        .input-wrap .eye {
          left: auto;
          right: 18px;
        }

        .auth-page input {
          width: 100%;
          height: 58px;
          border-radius: 9px;
          border: 1px solid var(--input-border);
          background: var(--input);
          color: var(--text);
          outline: none;
          padding: 0 52px;
          font-size: 1rem;
          letter-spacing: -0.01em;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .auth-page input::placeholder {
          color: rgba(255, 255, 255, 0.37);
        }

        .auth-page input:focus {
          border-color: rgba(49, 255, 208, 0.38);
          background: rgba(255, 255, 255, 0.058);
          box-shadow: 0 0 0 4px rgba(49, 255, 208, 0.045);
        }

        .error-box {
          margin-bottom: 16px;
          border-radius: 9px;
          border: 1px solid rgba(248, 113, 113, 0.28);
          background: rgba(239, 68, 68, 0.1);
          color: #fecaca;
          padding: 13px 16px;
          font-size: 0.9rem;
        }

        .login-btn {
          width: 100%;
          height: 60px;
          border-radius: 9px;
          border: 1px solid rgba(49, 255, 208, 0.40);
          background:
            linear-gradient(180deg, rgba(49, 255, 208, 0.095), rgba(49, 255, 208, 0.028));
          color: var(--text);
          font-size: 1rem;
          font-weight: 780;
          cursor: pointer;
          margin-top: 6px;
          transition:
            background 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease,
            opacity 0.2s ease;
        }

        .login-btn:hover {
          background:
            linear-gradient(180deg, rgba(49, 255, 208, 0.125), rgba(49, 255, 208, 0.045));
          box-shadow:
            0 0 0 4px rgba(49, 255, 208, 0.025),
            0 0 22px rgba(49, 255, 208, 0.07);
          transform: translateY(-1px);
        }

        .login-btn:disabled {
          cursor: not-allowed;
          opacity: 0.55;
          transform: none;
        }

        .signup {
          margin-top: 26px;
          text-align: center;
          color: #a2aaa8;
          font-size: 1rem;
        }

        .signup a {
          color: var(--teal);
          text-decoration: none;
          font-weight: 720;
        }

        @media (max-width: 1120px) {
          .auth-page {
            grid-template-columns: 1fr;
          }

          .brand-panel {
            min-height: 680px;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.09);
          }

          .brand-content {
            min-height: 680px;
            padding: 72px 11%;
          }

          .brand-copy-block {
            transform: translateY(28px);
          }

          .login-side {
            min-height: auto;
            padding: 100px 32px 76px;
          }
        }

        @media (max-width: 680px) {
          .brand-panel {
            min-height: 620px;
          }

          .brand-content {
            min-height: 620px;
            padding: 54px 28px;
          }

          .brand-copy-block {
            transform: translateY(18px);
          }

          .brand-title {
            font-size: 2.9rem;
          }

          .brand-copy {
            font-size: 0.98rem;
          }

          .provider-grid {
            grid-template-columns: 1fr;
          }

          .home-link {
            left: 24px;
            top: 26px;
          }

          .login-side {
            padding: 90px 22px 48px;
          }
        }
      `}</style>
    </>
  );
}