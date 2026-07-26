"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { getSessionProfile, hasSupabaseConfig, login } from "@/lib/attendance";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const profile = await getSessionProfile();
      if (!active) return;
      if (profile) router.replace("/dashboard/");
      else setChecking(false);
    })();
    return () => {
      active = false;
    };
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/dashboard/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="grid min-h-screen place-items-center px-5">
        <p className="text-sm text-[var(--muted)]">Checking session…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-12">
      <div className="panel rounded-2xl p-8 shadow-sm">
        <BrandMark />
        <h1
          className="font-display mt-6 text-2xl font-semibold tracking-tight text-[var(--ink)]"
          style={{ fontFamily: "var(--font-bricolage), system-ui, sans-serif" }}
        >
          Staff attendance login
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Sign in with your company profile to mark check-in and check-out.
        </p>

        {!hasSupabaseConfig ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Demo mode — password <strong>attendance123</strong> for all:
            <br />
            Staff: <strong>staff@teqnowebs.com</strong> (female) ·{" "}
            <strong>hr@teqnowebs.com</strong> (male)
            <br />
            Admin: <strong>admin@teqnowebs.com</strong>
          </p>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[var(--ink)]">Work email</span>
            <input
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
              placeholder="you@teqnowebs.com"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[var(--ink)]">Password</span>
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
              placeholder="••••••••"
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={loading} className="cta w-full rounded-lg px-4 py-3.5 text-sm font-semibold">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
      <p className="mt-6 text-center text-xs text-[var(--muted)]">
        attendance.teqnowebs.com
      </p>
    </main>
  );
}
