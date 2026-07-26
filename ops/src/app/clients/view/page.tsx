"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusPill } from "@/components/StatusPill";
import { apiGet } from "@/lib/api-client";
import { money } from "@/lib/format";
import { useSession } from "@/lib/use-session";
import type { Client, LinkTask } from "@/lib/types";

function ClientDetailInner() {
  const { user, loading } = useSession();
  const search = useSearchParams();
  const id = search.get("id");
  const [client, setClient] = useState<Client | null>(null);
  const [tasks, setTasks] = useState<LinkTask[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      try {
        const data = await apiGet<{ client: Client; tasks: LinkTask[] }>(
          `/api/clients/${id}`,
        );
        setClient(data.client);
        setTasks(data.tasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      }
    })();
  }, [user, id]);

  if (loading || !user) {
    return (
      <main className="grid min-h-screen place-items-center">
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      </main>
    );
  }

  if (!id) {
    return (
      <main className="grid min-h-screen place-items-center">
        <p className="text-sm text-red-600">Missing client id</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center">
        <p className="text-sm text-red-600">{error}</p>
      </main>
    );
  }

  if (!client) {
    return (
      <main className="grid min-h-screen place-items-center">
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      </main>
    );
  }

  const revenue = tasks
    .filter((t) => t.status === "published" || t.status === "live")
    .reduce((s, t) => s + t.price, 0);
  const cost = tasks
    .filter((t) => t.status === "published" || t.status === "live")
    .reduce((s, t) => s + t.cost, 0);

  return (
    <AppShell user={user}>
      <h1
        className="font-display text-3xl font-semibold"
        style={{ fontFamily: "var(--font-bricolage), system-ui, sans-serif" }}
      >
        {client.name}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {client.website || "No website"} · {client.packageName || "—"} · fee{" "}
        {money(client.monthlyFee)}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-xs uppercase text-emerald-800">Billable revenue</p>
          <p className="mt-1 text-xl font-semibold">{money(revenue)}</p>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
          <p className="text-xs uppercase text-orange-800">Costs</p>
          <p className="mt-1 text-xl font-semibold">{money(cost)}</p>
        </div>
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
          <p className="text-xs uppercase text-sky-800">Profit</p>
          <p className="mt-1 text-xl font-semibold">{money(revenue - cost)}</p>
        </div>
      </div>
      <ul className="mt-6 space-y-2">
        {tasks.map((t) => (
          <li
            key={t.id}
            className="panel flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium">{t.siteDomain || t.targetUrl || "Link task"}</p>
              <p className="text-xs text-[var(--muted)]">
                {t.workMonth} · {money(t.price)} − {money(t.cost)}
              </p>
            </div>
            <StatusPill status={t.status} />
          </li>
        ))}
      </ul>
    </AppShell>
  );
}

export default function ClientDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center">
          <p className="text-sm text-[var(--muted)]">Loading…</p>
        </main>
      }
    >
      <ClientDetailInner />
    </Suspense>
  );
}
