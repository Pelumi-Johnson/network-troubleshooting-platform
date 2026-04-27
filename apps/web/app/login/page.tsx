"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { loginUser } from "@/lib/api/authApi";
import { saveAuth } from "@/lib/auth/authStorage";

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
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <section className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <p className="text-blue-400 text-sm font-semibold mb-2">
          Network Troubleshooting Platform
        </p>

        <h1 className="text-3xl font-bold mb-2">Login</h1>

        <p className="text-slate-400 mb-8">
          Continue your troubleshooting labs and progress.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Email</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Password</label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              placeholder="password"
            />
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-700 text-red-300 rounded-xl p-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 rounded-xl py-3 font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-slate-400 text-sm mt-6">
          No account?{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300">
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}