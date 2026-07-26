"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { apiGet, apiSend } from "@/lib/api-client";
import { money } from "@/lib/format";
import { useSession } from "@/lib/use-session";
import type { Client } from "@/lib/types";

export default function ClientsPage() {
  const { user, loading } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [packageName, setPackageName] = useState("");
  const [monthlyFee, setMonthlyFee] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    const { clients: list } = await apiGet<{ clients: Client[] }>("/api/clients");
    setClients(list);
  }

  useEffect(() => {
    if (user) refresh().catch((e) => setError(e.message));
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
        Clients
      </h1>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}

      {user.role === "admin" ? (
        <section className="panel mt-6 rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">Add client</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
            <input
              placeholder="Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
            <input
              placeholder="Package"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
            <input
              placeholder="Monthly fee (PKR)"
              value={monthlyFee}
              onChange={(e) => setMonthlyFee(e.target.value)}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            className="cta mt-3 rounded-lg px-4 py-2 text-sm font-semibold"
            onClick={async () => {
              try {
                await apiSend("/api/clients", "POST", {
                  name,
                  website,
                  packageName,
                  monthlyFee: Number(monthlyFee) || 0,
                });
                setName("");
                setWebsite("");
                setPackageName("");
                setMonthlyFee("0");
                setMessage("Client added");
                await refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed");
              }
            }}
          >
            Save client
          </button>
        </section>
      ) : null}

      <ul className="mt-6 space-y-2">
        {clients.map((c) => (
          <li key={c.id}>
            <Link
              href={`/clients/${c.id}`}
              className="panel flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm"
            >
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-[var(--muted)]">
                  {c.packageName || "No package"} · {c.active ? "Active" : "Inactive"}
                </p>
              </div>
              <span className="text-xs font-medium text-[var(--accent-deep)]">
                {money(c.monthlyFee)} / mo →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
