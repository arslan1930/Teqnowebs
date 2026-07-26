"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import {
  getDayStatus,
  getSessionProfile,
  hasSupabaseConfig,
  listEvents,
  logout,
  markAttendance,
} from "@/lib/attendance";
import type { AttendanceEvent, StaffProfile } from "@/lib/types";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"check_in" | "check_out" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const refresh = useCallback(async (userId: string) => {
    const rows = await listEvents(userId);
    setEvents(rows);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const session = await getSessionProfile();
        if (!active) return;
        if (!session) {
          router.replace("/login/");
          return;
        }
        setProfile(session);
        await refresh(session.id);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [router, refresh]);

  const status = useMemo(() => getDayStatus(events), [events]);

  async function onMark(type: "check_in" | "check_out") {
    if (!profile) return;
    setBusy(type);
    setError(null);
    try {
      await markAttendance(profile.id, type, note.trim() || undefined);
      setNote("");
      await refresh(profile.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark attendance");
    } finally {
      setBusy(null);
    }
  }

  async function onLogout() {
    await logout();
    router.replace("/login/");
  }

  if (loading || !profile) {
    return (
      <main className="grid min-h-screen place-items-center px-5">
        <p className="text-sm text-[var(--muted)]">Loading your profile…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-5 py-8 sm:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <BrandMark size="sm" />
        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium text-[var(--ink-soft)] hover:border-[var(--accent)]"
        >
          Sign out
        </button>
      </header>

      <section className="panel mt-8 rounded-2xl p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
          Staff profile
        </p>
        <h1
          className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
          style={{ fontFamily: "var(--font-bricolage), system-ui, sans-serif" }}
        >
          {profile.fullName}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{profile.email}</p>

        {!hasSupabaseConfig ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Demo mode — records stay in this browser until Supabase is connected.
          </p>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--line)] bg-white px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Today check-in</p>
            <p
              className="mt-1 text-lg font-semibold"
              style={{ color: status.checkedIn ? "var(--ok)" : "var(--muted)" }}
            >
              {status.checkedIn ? "Marked" : "Not yet"}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-white px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Today check-out</p>
            <p
              className="mt-1 text-lg font-semibold"
              style={{ color: status.checkedOut ? "var(--ok)" : "var(--muted)" }}
            >
              {status.checkedOut ? "Marked" : "Not yet"}
            </p>
          </div>
        </div>

        <label className="mt-6 block">
          <span className="text-sm font-medium text-[var(--ink)]">Note (optional)</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-2 w-full rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
            placeholder="e.g. Working from office"
          />
        </label>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="cta rounded-lg px-5 py-3 text-sm font-semibold"
            disabled={busy !== null || status.checkedIn}
            onClick={() => onMark("check_in")}
          >
            {busy === "check_in" ? "Saving…" : "Mark check-in"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-[var(--ink)]/15 bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] hover:border-[var(--accent)] disabled:opacity-50"
            disabled={busy !== null || !status.checkedIn || status.checkedOut}
            onClick={() => onMark("check_out")}
          >
            {busy === "check_out" ? "Saving…" : "Mark check-out"}
          </button>
        </div>
      </section>

      <section className="mt-8">
        <h2
          className="font-display text-lg font-semibold"
          style={{ fontFamily: "var(--font-bricolage), system-ui, sans-serif" }}
        >
          Recent activity
        </h2>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">No attendance marked yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {events.map((event) => (
              <li
                key={event.id}
                className="panel flex items-center justify-between gap-4 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    {event.type === "check_in" ? "Check-in" : "Check-out"}
                  </p>
                  {event.note ? (
                    <p className="mt-0.5 text-xs text-[var(--muted)]">{event.note}</p>
                  ) : null}
                </div>
                <time className="shrink-0 text-xs text-[var(--muted)]" dateTime={event.createdAt}>
                  {formatWhen(event.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
