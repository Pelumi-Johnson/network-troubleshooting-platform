import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold mb-5">
          Learn Networking by Fixing Broken Systems
        </h1>

        <p className="text-slate-400 text-lg mb-8">
          Practice real troubleshooting scenarios designed for network engineers.
        </p>

        <Link
          href="/dashboard"
          className="inline-block bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-semibold"
        >
          Enter Labs
        </Link>
      </div>
    </main>
  );
}