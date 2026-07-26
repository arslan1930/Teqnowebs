"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { apiGet, apiSend } from "@/lib/api-client";
import type { User } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { user } = await apiGet<{ user: User | null }>("/api/auth/me");
        if (user) router.replace("/home");
        else setChecking(false);
      } catch {
        setChecking(false);
      }
    })();
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiSend<{ user: User }>("/api/auth/login", "POST", { email, password });
      router.replace("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="grid min-h-screen place-items-center">
        <p className="text-sm text-[var(--muted)]">Checking session…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-12">
      <div className="panel rounded-2xl p-8">
        <BrandMark />
        <h1
          className="font-display mt-6 text-2xl font-semibold"
          style={{ fontFamily: "var(--font-bricolage), system-ui, sans-serif" }}
        >
          Ops / Link Desk
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Clients, link inventory, and monthly P&amp;L — replaces the Excel sheet.
        </p>
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-950">
          Seed password <strong>ops123</strong> — admin@teqnowebs.com · linker@teqnowebs.com ·
          outreach@teqnowebs.com
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line)] px-4 py-3"
            />
          </label>
          <label className="block text-sm">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line)] px-4 py-3"
            />
          </label>
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <button type="submit" className="cta w-full rounded-lg px-4 py-3 text-sm font-semibold" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
