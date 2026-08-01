"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { apiSend } from "@/lib/api-client";
import { useSession } from "@/lib/use-session";

export default function ImportPage() {
  const { user, loading } = useSession({ adminOnly: true });
  const [csv, setCsv] = useState(
    "Client,Target URL,Site,Type,Status,Live URL,DR,Price,Cost,Assignee email,Month,Notes\n",
  );
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        Import CSV
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Export <code>Teqnowebs_Link_Inventory.xlsx</code> to CSV, paste below, then freeze the
        Excel sheet.
      </p>
      <p className="mt-3 text-xs text-[var(--muted)]">
        Expected headers: Client, Target URL, Site, Type, Status, Live URL, DR, Price, Cost,
        Assignee email, Month, Notes
      </p>
      <textarea
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        rows={14}
        className="mt-4 w-full rounded-xl border border-[var(--line)] bg-white p-3 font-mono text-xs"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <label className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm">
          Upload file
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setCsv(await file.text());
            }}
          />
        </label>
        <button
          type="button"
          className="cta rounded-lg px-4 py-2 text-sm font-semibold"
          onClick={async () => {
            setError(null);
            try {
              const res = await apiSend<{ imported: number; errors: string[] }>(
                "/api/import",
                "POST",
                { csv },
              );
              setResult(res);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Import failed");
            }
          }}
        >
          Run import
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {result ? (
        <div className="panel mt-6 rounded-2xl p-5 text-sm">
          <p>
            Imported <strong>{result.imported}</strong> rows.
          </p>
          {result.errors.length ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-red-700">
              {result.errors.slice(0, 20).map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-emerald-700">No row errors.</p>
          )}
        </div>
      ) : null}
    </AppShell>
  );
}
