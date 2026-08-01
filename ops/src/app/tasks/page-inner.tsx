"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusPill } from "@/components/StatusPill";
import { apiGet, apiSend } from "@/lib/api-client";
import { currentMonth, money } from "@/lib/format";
import { useSession } from "@/lib/use-session";
import type { Client, LinkStatus, LinkTask, User } from "@/lib/types";
import { LINK_STATUSES, STATUS_LABELS } from "@/lib/types";

function initialQueryFlag(key: string) {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(key) || "";
}

export default function TasksPage() {
  const { user, loading } = useSession();
  const [tasks, setTasks] = useState<LinkTask[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState("");
  const [month, setMonth] = useState("");
  const [clientId, setClientId] = useState("");
  const [publishedThisMonth, setPublishedThisMonth] = useState(false);

  useEffect(() => {
    setStatus(initialQueryFlag("status"));
    setMonth(initialQueryFlag("month"));
    setPublishedThisMonth(initialQueryFlag("publishedThisMonth") === "1");
  }, []);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    clientId: "",
    targetUrl: "",
    siteDomain: "",
    linkType: "guest_post",
    status: "queued" as LinkStatus,
    liveUrl: "",
    dr: "",
    price: "0",
    cost: "0",
    assigneeId: "",
    workMonth: currentMonth(),
    notes: "",
  });

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (month) p.set("month", month);
    if (clientId) p.set("clientId", clientId);
    if (publishedThisMonth) p.set("publishedThisMonth", "1");
    const q = p.toString();
    return q ? `?${q}` : "";
  }, [status, month, clientId, publishedThisMonth]);

  async function refresh() {
    const { tasks: list } = await apiGet<{ tasks: LinkTask[] }>(`/api/tasks${query}`);
    setTasks(list);
  }

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [{ clients: c }] = await Promise.all([
          apiGet<{ clients: Client[] }>("/api/clients"),
          refresh(),
        ]);
        setClients(c);
        if (user.role === "admin") {
          const { users: u } = await apiGet<{ users: User[] }>("/api/users");
          setUsers(u.filter((x) => x.role === "staff"));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, query]);

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
            Link inventory
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Replaces Teqnowebs_Link_Inventory.xlsx</p>
        </div>
        <button
          type="button"
          className="cta rounded-lg px-4 py-2 text-sm font-semibold"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Close form" : "Add task"}
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {LINK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
        />
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
        >
          <option value="">All clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="rounded-lg border px-3 py-2 text-sm font-medium"
          style={{
            background: publishedThisMonth ? "var(--accent)" : "#fff",
            color: publishedThisMonth ? "#fff" : "var(--ink)",
            borderColor: publishedThisMonth ? "var(--accent)" : "var(--line)",
          }}
          onClick={() => setPublishedThisMonth((v) => !v)}
        >
          Published this month
        </button>
      </div>

      {showForm ? (
        <section className="panel mt-6 rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">New link task</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <select
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            >
              <option value="">Client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              placeholder="Site domain"
              value={form.siteDomain}
              onChange={(e) => setForm({ ...form, siteDomain: e.target.value })}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
            <input
              placeholder="Target URL"
              value={form.targetUrl}
              onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
            <input
              placeholder="Live URL"
              value={form.liveUrl}
              onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as LinkStatus })}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            >
              {LINK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <input
              type="month"
              value={form.workMonth}
              onChange={(e) => setForm({ ...form, workMonth: e.target.value })}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
            <input
              placeholder="Price (PKR)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
            <input
              placeholder="Cost (PKR)"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
            {user.role === "admin" ? (
              <select
                value={form.assigneeId}
                onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
                className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
              >
                <option value="">Assignee…</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName}
                  </option>
                ))}
              </select>
            ) : null}
            <input
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm sm:col-span-2"
            />
          </div>
          <button
            type="button"
            className="cta mt-3 rounded-lg px-4 py-2 text-sm font-semibold"
            onClick={async () => {
              try {
                await apiSend("/api/tasks", "POST", {
                  ...form,
                  dr: form.dr ? Number(form.dr) : null,
                  price: Number(form.price) || 0,
                  cost: Number(form.cost) || 0,
                  assigneeId: form.assigneeId || undefined,
                });
                setShowForm(false);
                await refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Save failed");
              }
            }}
          >
            Save task
          </button>
        </section>
      ) : null}

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-[var(--muted)]">
              <th className="py-2 pr-3">Client</th>
              <th className="py-2 pr-3">Site</th>
              <th className="py-2 pr-3">Month</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Price</th>
              <th className="py-2">Update</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-b border-[var(--line)]/70">
                <td className="py-3 pr-3 font-medium">{t.clientName}</td>
                <td className="py-3 pr-3">
                  <div>{t.siteDomain || "—"}</div>
                  {t.liveUrl ? (
                    <a
                      href={t.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[var(--accent-deep)]"
                    >
                      Live URL
                    </a>
                  ) : null}
                </td>
                <td className="py-3 pr-3">{t.workMonth}</td>
                <td className="py-3 pr-3">
                  <StatusPill status={t.status} />
                </td>
                <td className="py-3 pr-3">{money(t.price)}</td>
                <td className="py-3">
                  <select
                    value={t.status}
                    className="rounded border border-[var(--line)] px-2 py-1 text-xs"
                    onChange={async (e) => {
                      try {
                        await apiSend(`/api/tasks/${t.id}`, "PATCH", {
                          status: e.target.value,
                        });
                        await refresh();
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Update failed");
                      }
                    }}
                  >
                    {LINK_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tasks.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">No tasks match these filters.</p>
        ) : null}
      </div>
    </AppShell>
  );
}
