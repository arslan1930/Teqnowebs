"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { apiGet, apiSend } from "@/lib/api-client";
import { currentMonth } from "@/lib/format";
import { useSession } from "@/lib/use-session";
import type { MonthPnL, User, UserRole } from "@/lib/types";

export default function TeamPage() {
  const { user, loading } = useSession({ adminOnly: true });
  const [users, setUsers] = useState<User[]>([]);
  const [month, setMonth] = useState(currentMonth());
  const [pnl, setPnl] = useState<MonthPnL | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("ops123");
  const [role, setRole] = useState<UserRole>("staff");
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const [{ users: list }, { pnl: p }] = await Promise.all([
      apiGet<{ users: User[] }>("/api/users"),
      apiGet<{ pnl: MonthPnL }>(`/api/pnl?month=${month}`),
    ]);
    setUsers(list);
    setPnl(p);
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
        <h1
          className="font-display text-3xl font-semibold"
          style={{ fontFamily: "var(--font-bricolage), system-ui, sans-serif" }}
        >
          Team
        </h1>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
        />
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <section className="panel mt-6 rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold">Published counts · {month}</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(pnl?.byStaff || []).map((s) => (
            <li
              key={s.userId}
              className="flex justify-between rounded-lg border border-[var(--line)] bg-white px-3 py-2"
            >
              <span>{s.userName}</span>
              <strong>{s.publishedCount} published</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel mt-6 rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold">Add user</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
          />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
          />
          <input
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="button"
          className="cta mt-3 rounded-lg px-4 py-2 text-sm font-semibold"
          onClick={async () => {
            try {
              await apiSend("/api/users", "POST", { fullName, email, password, role });
              setFullName("");
              setEmail("");
              await refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed");
            }
          }}
        >
          Create user
        </button>
      </section>

      <ul className="mt-6 space-y-2 text-sm">
        {users.map((u) => (
          <li
            key={u.id}
            className="panel flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-3"
          >
            <div>
              <p className="font-semibold">{u.fullName}</p>
              <p className="text-xs text-[var(--muted)]">
                {u.email} · {u.role}
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs">
              Active
              <input
                type="checkbox"
                checked={u.active}
                onChange={async (e) => {
                  await apiSend("/api/users", "POST", {
                    action: "update",
                    id: u.id,
                    active: e.target.checked,
                  });
                  await refresh();
                }}
              />
            </label>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
