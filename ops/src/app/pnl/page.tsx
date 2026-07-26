"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { apiGet, apiSend, downloadPnLCsv } from "@/lib/api-client";
import { currentMonth, money } from "@/lib/format";
import { useSession } from "@/lib/use-session";
import type { Expense, MonthPnL } from "@/lib/types";

export default function PnLPage() {
  const { user, loading } = useSession({ adminOnly: true });
  const [month, setMonth] = useState(currentMonth());
  const [pnl, setPnl] = useState<MonthPnL | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("0");
  const [error, setError] = useState<string | null>(null);

  async function refresh(m = month) {
    const [{ pnl: p }, { expenses: e }] = await Promise.all([
      apiGet<{ pnl: MonthPnL }>(`/api/pnl?month=${m}`),
      apiGet<{ expenses: Expense[] }>(`/api/expenses?month=${m}`),
    ]);
    setPnl(p);
    setExpenses(e);
  }

  useEffect(() => {
    if (user) refresh().catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, month]);

  if (loading || !user) {
    return (
      <main className="grid min-h-screen place-items-center">
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      </main>
    );
  }

  return (
    <AppShell user={user}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1
            className="font-display text-3xl font-semibold"
            style={{ fontFamily: "var(--font-bricolage), system-ui, sans-serif" }}
          >
            Monthly P&amp;L
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Revenue − link costs − expenses (Asia/Karachi · PKR)
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
          />
          <button
            type="button"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium"
            onClick={async () => {
              try {
                await downloadPnLCsv(month);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Export failed");
              }
            }}
          >
            Export CSV
          </button>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {pnl ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-xs uppercase text-emerald-800">Revenue</p>
            <p className="mt-1 text-xl font-semibold">{money(pnl.revenue)}</p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
            <p className="text-xs uppercase text-orange-800">Link costs</p>
            <p className="mt-1 text-xl font-semibold">{money(pnl.taskCosts)}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs uppercase text-amber-800">Expenses</p>
            <p className="mt-1 text-xl font-semibold">{money(pnl.expenses)}</p>
          </div>
          <div
            className="rounded-xl border px-4 py-3"
            style={{
              background: pnl.profit >= 0 ? "#dcfce7" : "#ffe4e6",
              borderColor: pnl.profit >= 0 ? "#86efac" : "#fda4af",
            }}
          >
            <p className="text-xs uppercase">Profit / loss</p>
            <p className="mt-1 text-xl font-semibold">{money(pnl.profit)}</p>
          </div>
        </div>
      ) : null}

      <section className="panel mt-8 rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold">By client</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(pnl?.byClient || []).map((c) => (
            <li
              key={c.clientId}
              className="flex justify-between gap-3 rounded-lg border border-[var(--line)] bg-white px-3 py-2"
            >
              <span>{c.clientName}</span>
              <span>
                {money(c.revenue)} − {money(c.cost)} = <strong>{money(c.profit)}</strong>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel mt-6 rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold">By staff (published)</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(pnl?.byStaff || []).map((s) => (
            <li
              key={s.userId}
              className="flex justify-between gap-3 rounded-lg border border-[var(--line)] bg-white px-3 py-2"
            >
              <span>
                {s.userName} · {s.publishedCount} links
              </span>
              <span>
                {money(s.revenue)} / cost {money(s.cost)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel mt-6 rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold">Other expenses</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            placeholder="Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
          />
          <input
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
          />
          <button
            type="button"
            className="cta rounded-lg px-4 py-2 text-sm font-semibold"
            onClick={async () => {
              try {
                await apiSend("/api/expenses", "POST", {
                  month,
                  label,
                  amount: Number(amount) || 0,
                });
                setLabel("");
                setAmount("0");
                await refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed");
              }
            }}
          >
            Add expense
          </button>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          {expenses.map((e) => (
            <li
              key={e.id}
              className="flex justify-between rounded-lg border border-[var(--line)] bg-white px-3 py-2"
            >
              <span>{e.label}</span>
              <span className="flex gap-3">
                {money(e.amount)}
                <button
                  type="button"
                  className="text-red-600"
                  onClick={async () => {
                    await apiSend("/api/expenses", "POST", { action: "delete", id: e.id });
                    await refresh();
                  }}
                >
                  Remove
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
