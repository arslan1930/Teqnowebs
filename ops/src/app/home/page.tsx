"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusPill } from "@/components/StatusPill";
import { apiGet } from "@/lib/api-client";
import { money } from "@/lib/format";
import { useSession } from "@/lib/use-session";
import type { LinkTask, MonthPnL } from "@/lib/types";

export default function HomePage() {
  const { user, loading } = useSession();
  const [inProgressCount, setInProgressCount] = useState(0);
  const [recent, setRecent] = useState<LinkTask[]>([]);
  const [month, setMonth] = useState("");
  const [pnl, setPnl] = useState<MonthPnL | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await apiGet<{
        inProgressCount: number;
        recentPublished: LinkTask[];
        month: string;
        pnl: MonthPnL | null;
      }>("/api/home");
      setInProgressCount(data.inProgressCount);
      setRecent(data.recentPublished);
      setMonth(data.month);
      setPnl(data.pnl);
    })();
  }, [user]);

  if (loading || !user) {
    return (
      <main className="grid min-h-screen place-items-center">
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      </main>
    );
  }

  return (
    <AppShell user={user}>
      <h1
        className="font-display text-3xl font-semibold"
        style={{ fontFamily: "var(--font-bricolage), system-ui, sans-serif" }}
      >
        Link desk
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Track clients, published links, and monthly profit — not the marketing site, not attendance.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-4">
          <p className="text-xs uppercase text-sky-800">Queued / in progress</p>
          <p className="mt-1 text-3xl font-semibold text-sky-950">{inProgressCount}</p>
        </div>
        {pnl ? (
          <>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
              <p className="text-xs uppercase text-emerald-800">Revenue · {month}</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-950">
                {money(pnl.revenue)}
              </p>
            </div>
            <div
              className="rounded-xl border px-4 py-4"
              style={{
                background: pnl.profit >= 0 ? "#dcfce7" : "#ffe4e6",
                borderColor: pnl.profit >= 0 ? "#86efac" : "#fda4af",
              }}
            >
              <p className="text-xs uppercase" style={{ color: pnl.profit >= 0 ? "#14532d" : "#9f1239" }}>
                Profit · {month}
              </p>
              <p className="mt-1 text-2xl font-semibold">{money(pnl.profit)}</p>
            </div>
          </>
        ) : (
          <div className="panel rounded-xl px-4 py-4 sm:col-span-2">
            <p className="text-sm text-[var(--muted)]">
              Staff view — open Inventory to update your assigned links.
            </p>
          </div>
        )}
      </div>

      <section className="panel mt-8 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">Recently published</h2>
          <Link href="/tasks?publishedThisMonth=1" className="text-sm font-medium text-[var(--accent-deep)]">
            Published this month →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">No published links yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {recent.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--line)] bg-white px-3 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{t.clientName}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {t.siteDomain || "—"} · {t.workMonth}
                  </p>
                </div>
                <StatusPill status={t.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
