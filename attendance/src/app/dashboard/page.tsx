"use client";

import Link from "next/link";
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
import { daysAgo, formatClock, formatTimeLabel, formatWhen, todayDateStr } from "@/lib/dates";
import { approvedLeavesThisMonth, listLeaves, requestLeave } from "@/lib/leave";
import { getAppSettings, getTimingForGroup, listHolidays } from "@/lib/settings";
import { attendanceReport } from "@/lib/reports";
import { approvedLeaveOnDate, holidayOnDate } from "@/lib/status";
import type {
  AttendanceEvent,
  CompanyHoliday,
  DayAttendanceRow,
  LeaveRequest,
  OfficeTiming,
  StaffProfile,
} from "@/lib/types";
import { DEFAULT_TIMEZONE, GROUP_LABELS } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [timing, setTiming] = useState<OfficeTiming | null>(null);
  const [holidays, setHolidays] = useState<CompanyHoliday[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [history, setHistory] = useState<DayAttendanceRow[]>([]);
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);
  const [usedLeaves, setUsedLeaves] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"check_in" | "check_out" | "leave" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [leaveDate, setLeaveDate] = useState(todayDateStr());
  const [leaveReason, setLeaveReason] = useState("");

  const refresh = useCallback(async (user: StaffProfile) => {
    const settings = await getAppSettings();
    const tz = settings.timezone || DEFAULT_TIMEZONE;
    setTimezone(tz);
    const dateStr = todayDateStr(tz);
    setLeaveDate((prev) => prev || dateStr);
    const [ev, t, hol, lv, used, hist] = await Promise.all([
      listEvents(user.id),
      getTimingForGroup(user.staffGroup),
      listHolidays(),
      listLeaves(user.id),
      approvedLeavesThisMonth(user.id),
      attendanceReport({
        from: daysAgo(29, tz),
        to: todayDateStr(tz),
        userId: user.id,
      }),
    ]);
    setEvents(ev);
    setTiming(t);
    setHolidays(hol);
    setLeaves(lv);
    setUsedLeaves(used);
    setHistory(hist);
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
        await refresh(session);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [router, refresh]);

  const dateStr = todayDateStr(timezone);
  const holidayToday = useMemo(
    () => holidayOnDate(holidays, dateStr),
    [holidays, dateStr],
  );
  const leaveToday = useMemo(
    () => approvedLeaveOnDate(leaves, dateStr),
    [leaves, dateStr],
  );
  const upcomingHoliday = useMemo(
    () => holidays.find((h) => h.date >= dateStr) ?? null,
    [holidays, dateStr],
  );

  const status = useMemo(
    () =>
      getDayStatus(events, {
        timing,
        holidayToday,
        leaveToday,
        timeZone: timezone,
        dateStr,
      }),
    [events, timing, holidayToday, leaveToday, timezone, dateStr],
  );

  const attendanceBlocked = Boolean(holidayToday || leaveToday);

  async function onMark(type: "check_in" | "check_out") {
    if (!profile) return;
    setBusy(type);
    setError(null);
    try {
      await markAttendance(profile.id, type, note.trim() || undefined);
      setNote("");
      await refresh(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark attendance");
    } finally {
      setBusy(null);
    }
  }

  async function onRequestLeave() {
    if (!profile) return;
    setBusy("leave");
    setError(null);
    try {
      await requestLeave(profile.id, leaveDate, leaveReason.trim() || undefined);
      setLeaveReason("");
      await refresh(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not request leave");
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

  const punchLabel =
    status.punchStatus === "late"
      ? "Late"
      : status.punchStatus === "on_time"
        ? "On time"
        : status.punchStatus === "holiday"
          ? "Holiday"
          : status.punchStatus === "on_leave"
            ? "On leave"
            : status.punchStatus === "missing_checkout"
              ? "Missing checkout"
              : "—";

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-5 py-8 sm:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <BrandMark size="sm" />
        <div className="flex flex-wrap items-center gap-2">
          {profile.role === "admin" ? (
            <Link
              href="/admin/"
              className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-3 py-2 text-sm font-medium text-[var(--accent-deep)]"
            >
              Admin panel
            </Link>
          ) : null}
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium text-[var(--ink-soft)] hover:border-[var(--accent)]"
          >
            Sign out
          </button>
        </div>
      </header>

      {upcomingHoliday ? (
        <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
          <strong>Holiday:</strong> {upcomingHoliday.title} on {upcomingHoliday.date}
          {upcomingHoliday.note ? ` — ${upcomingHoliday.note}` : ""}
        </div>
      ) : null}

      <section className="panel mt-6 rounded-2xl p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
          Staff profile
        </p>
        <h1
          className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
          style={{ fontFamily: "var(--font-bricolage), system-ui, sans-serif" }}
        >
          {profile.fullName}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {profile.email} · {GROUP_LABELS[profile.staffGroup]} · {timezone}
        </p>

        {timing ? (
          <p className="mt-3 text-sm text-[var(--ink-soft)]">
            Office hours: {formatTimeLabel(timing.startTime)} –{" "}
            {formatTimeLabel(timing.endTime)} (late after {timing.lateAfterMinutes} min)
          </p>
        ) : null}

        {!hasSupabaseConfig ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Demo mode — records stay in this browser until Supabase is connected.
          </p>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--line)] bg-white px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Check-in</p>
            <p
              className="mt-1 text-lg font-semibold"
              style={{ color: status.checkedIn ? "var(--ok)" : "var(--muted)" }}
            >
              {status.checkedIn ? "Marked" : "Not yet"}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-white px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Check-out</p>
            <p
              className="mt-1 text-lg font-semibold"
              style={{ color: status.checkedOut ? "var(--ok)" : "var(--muted)" }}
            >
              {status.checkedOut ? "Marked" : "Not yet"}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-white px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Status</p>
            <p className="mt-1 text-lg font-semibold text-[var(--ink)]">{punchLabel}</p>
          </div>
        </div>

        <p
          className="mt-4 rounded-lg border px-3 py-2 text-sm"
          style={{
            borderColor:
              status.punchStatus === "late" || status.punchStatus === "missing_checkout"
                ? "#f59e0b55"
                : "var(--line)",
            background:
              status.punchStatus === "late" || status.punchStatus === "missing_checkout"
                ? "#fffbeb"
                : "#fff",
            color: "var(--ink-soft)",
          }}
        >
          {status.message}
        </p>

        {attendanceBlocked ? (
          <p className="mt-3 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--muted)]">
            {holidayToday
              ? "Company holiday today — attendance not required."
              : "Approved leave today — attendance not required."}
          </p>
        ) : null}

        <label className="mt-6 block">
          <span className="text-sm font-medium text-[var(--ink)]">Note (optional)</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={attendanceBlocked}
            className="mt-2 w-full rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--accent)] disabled:opacity-50"
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
            disabled={busy !== null || status.checkedIn || attendanceBlocked}
            onClick={() => onMark("check_in")}
          >
            {busy === "check_in"
              ? "Saving…"
              : status.checkedIn
                ? "Already checked in"
                : "Mark check-in"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-[var(--ink)]/15 bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] hover:border-[var(--accent)] disabled:opacity-50"
            disabled={
              busy !== null || !status.checkedIn || status.checkedOut || attendanceBlocked
            }
            onClick={() => onMark("check_out")}
          >
            {busy === "check_out"
              ? "Saving…"
              : status.checkedOut
                ? "Already checked out"
                : !status.checkedIn
                  ? "Check in first"
                  : "Mark check-out (after 3:00pm)"}
          </button>
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">
          Check-out opens at <strong>3:00pm</strong>. Between <strong>3:00pm–3:59pm</strong> =
          half leave. From <strong>4:00pm</strong> = full day.
        </p>
      </section>

      <section className="panel mt-8 rounded-2xl p-6 sm:p-8">
        <h2
          className="font-display text-lg font-semibold"
          style={{ fontFamily: "var(--font-bricolage), system-ui, sans-serif" }}
        >
          Personal leave
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Used this month: <strong>{usedLeaves}/1</strong> (company holidays do not count)
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Date</span>
            <input
              type="date"
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Reason (optional)</span>
            <input
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm"
              placeholder="Personal leave"
            />
          </label>
        </div>
        <button
          type="button"
          className="cta mt-4 rounded-lg px-5 py-3 text-sm font-semibold"
          disabled={busy !== null || usedLeaves >= 1}
          onClick={onRequestLeave}
        >
          {busy === "leave" ? "Submitting…" : "Request leave"}
        </button>
        {leaves.length ? (
          <ul className="mt-4 space-y-2">
            {leaves.slice(0, 5).map((l) => (
              <li
                key={l.id}
                className="flex justify-between gap-3 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
              >
                <span>
                  {l.date}
                  {l.reason ? ` — ${l.reason}` : ""}
                </span>
                <span className="capitalize text-[var(--muted)]">{l.status}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="panel mt-8 rounded-2xl p-6 sm:p-8">
        <h2
          className="font-display text-lg font-semibold"
          style={{ fontFamily: "var(--font-bricolage), system-ui, sans-serif" }}
        >
          My history (last 30 days)
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--muted)]">
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">In</th>
                <th className="py-2 pr-3">Out</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.date} className="border-b border-[var(--line)]/70">
                  <td className="py-2 pr-3">{row.date}</td>
                  <td className="py-2 pr-3">
                    {row.checkInAt ? formatClock(row.checkInAt, timezone) : "—"}
                  </td>
                  <td className="py-2 pr-3">
                    {row.checkOutAt ? formatClock(row.checkOutAt, timezone) : "—"}
                  </td>
                  <td className="py-2 capitalize">
                    {row.status.replaceAll("_", " ")}
                    {row.isManual ? " · edited" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2
          className="font-display text-lg font-semibold"
          style={{ fontFamily: "var(--font-bricolage), system-ui, sans-serif" }}
        >
          Recent punches
        </h2>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">No attendance marked yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {events.slice(0, 12).map((event) => (
              <li
                key={event.id}
                className="panel flex items-center justify-between gap-4 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    {event.type === "check_in" ? "Check-in" : "Check-out"}
                    {event.isManual ? " (admin edit)" : ""}
                  </p>
                  {event.note ? (
                    <p className="mt-0.5 text-xs text-[var(--muted)]">{event.note}</p>
                  ) : null}
                </div>
                <time className="shrink-0 text-xs text-[var(--muted)]" dateTime={event.createdAt}>
                  {formatWhen(event.createdAt, timezone)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
