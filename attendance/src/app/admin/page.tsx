"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import {
  addStaffMember,
  buildTodayRoster,
  getSessionProfile,
  hasSupabaseConfig,
  logout,
  resetStaffPassword,
  upsertDayAttendance,
} from "@/lib/attendance";
import { daysAgo, endOfMonth, formatClock, monthKey, todayDateStr } from "@/lib/dates";
import { listLeaves, reviewLeave } from "@/lib/leave";
import {
  attendanceCsv,
  attendanceReport,
  downloadCsv,
  employeeStatsFor,
} from "@/lib/reports";
import {
  addHoliday,
  getAppSettings,
  htaccessSnippet,
  listHolidays,
  listStaffProfiles,
  listTimings,
  removeHoliday,
  saveAppSettings,
  saveTiming,
  updateStaffProfile,
} from "@/lib/settings";
import type {
  AppSettings,
  CompanyHoliday,
  DayAttendanceRow,
  EmployeePeriodStats,
  LeaveRequest,
  OfficeTiming,
  RosterRow,
  StaffGroup,
  StaffProfile,
  StaffRole,
} from "@/lib/types";
import { DEFAULT_TIMEZONE, GROUP_LABELS } from "@/lib/types";

export default function AdminPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [timings, setTimings] = useState<OfficeTiming[]>([]);
  const [holidays, setHolidays] = useState<CompanyHoliday[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [roster, setRoster] = useState<RosterRow[]>([]);
  const [report, setReport] = useState<DayAttendanceRow[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    timezone: DEFAULT_TIMEZONE,
    allowedIps: [],
  });
  const [ipDraft, setIpDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [holDate, setHolDate] = useState(todayDateStr());
  const [holTitle, setHolTitle] = useState("");
  const [holNote, setHolNote] = useState("");
  const [from, setFrom] = useState(daysAgo(13));
  const [to, setTo] = useState(todayDateStr());
  const [filterUser, setFilterUser] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("attendance123");
  const [newGroup, setNewGroup] = useState<StaffGroup>("female");
  const [editUserId, setEditUserId] = useState("");
  const [editDate, setEditDate] = useState(todayDateStr());
  const [editIn, setEditIn] = useState("09:00");
  const [editOut, setEditOut] = useState("18:00");
  const [editNote, setEditNote] = useState("");
  const [clearOut, setClearOut] = useState(false);
  const [statsMonth, setStatsMonth] = useState(monthKey(todayDateStr()));
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedStats, setSelectedStats] = useState<EmployeePeriodStats | null>(null);

  const refresh = useCallback(async () => {
    const s = await getAppSettings();
    setSettings(s);
    setIpDraft(s.allowedIps.join("\n"));
    const tz = s.timezone || DEFAULT_TIMEZONE;
    const monthStart = `${statsMonth}-01`;
    const monthEnd = endOfMonth(statsMonth);
    const [t, h, l, st, r, rep] = await Promise.all([
      listTimings(),
      listHolidays(),
      listLeaves(),
      listStaffProfiles(),
      buildTodayRoster(),
      attendanceReport({
        from,
        to,
        userId: filterUser || undefined,
      }),
    ]);
    setTimings(t);
    setHolidays(h);
    setLeaves(l);
    setStaff(st);
    setRoster(r);
    setReport(rep);
    setHolDate((d) => d || todayDateStr(tz));
    if (selectedEmployeeId) {
      const toDate = monthEnd < todayDateStr(tz) ? monthEnd : todayDateStr(tz);
      const stats = await employeeStatsFor(selectedEmployeeId, monthStart, toDate);
      setSelectedStats(stats);
    }
  }, [from, to, filterUser, selectedEmployeeId, statsMonth]);

  async function onSelectEmployee(userId: string) {
    setSelectedEmployeeId(userId);
    setError(null);
    try {
      const tz = settings.timezone || DEFAULT_TIMEZONE;
      const monthStart = `${statsMonth}-01`;
      const monthEnd = endOfMonth(statsMonth);
      const toDate = monthEnd < todayDateStr(tz) ? monthEnd : todayDateStr(tz);
      const stats = await employeeStatsFor(userId, monthStart, toDate);
      setSelectedStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load employee stats");
    }
  }

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
        if (session.role !== "admin") {
          router.replace("/dashboard/");
          return;
        }
        setProfile(session);
        await refresh();
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load admin");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [router, refresh]);

  function flash(msg: string) {
    setMessage(msg);
    setError(null);
  }

  async function onSaveTiming(group: StaffGroup, patch: Partial<OfficeTiming>) {
    const current = timings.find((t) => t.staffGroup === group);
    if (!current) return;
    try {
      await saveTiming({ ...current, ...patch });
      await refresh();
      flash("Office timings saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save timings");
    }
  }

  async function onAddHoliday() {
    try {
      await addHoliday({
        date: holDate,
        title: holTitle.trim() || "Holiday",
        note: holNote.trim() || undefined,
      });
      setHolTitle("");
      setHolNote("");
      await refresh();
      flash("Holiday announced");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add holiday");
    }
  }

  async function onReview(id: string, status: "approved" | "rejected") {
    try {
      await reviewLeave(id, status);
      await refresh();
      flash(`Leave ${status}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update leave");
    }
  }

  async function onStaffPatch(
    userId: string,
    patch: Partial<Pick<StaffProfile, "role" | "staffGroup" | "active">>,
  ) {
    try {
      await updateStaffProfile(userId, patch);
      await refresh();
      flash("Staff updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update staff");
    }
  }

  async function onSaveSettings() {
    try {
      const allowedIps = ipDraft
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const next = await saveAppSettings({
        timezone: settings.timezone || DEFAULT_TIMEZONE,
        allowedIps,
      });
      setSettings(next);
      setIpDraft(next.allowedIps.join("\n"));
      flash("Settings saved — copy the .htaccess snippet onto Hostinger for IP lock");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save settings");
    }
  }

  async function onExport() {
    try {
      const csv = await attendanceCsv({
        from,
        to,
        userId: filterUser || undefined,
      });
      downloadCsv(`attendance-${from}-to-${to}.csv`, csv);
      flash("CSV downloaded");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not export CSV");
    }
  }

  async function onAddStaff() {
    try {
      await addStaffMember({
        fullName: newName,
        email: newEmail,
        password: newPassword,
        staffGroup: newGroup,
      });
      setNewName("");
      setNewEmail("");
      await refresh();
      flash("Staff added (demo mode)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add staff");
    }
  }

  async function onManualEdit() {
    if (!profile || !editUserId) return;
    try {
      const checkInAt = editIn ? new Date(`${editDate}T${editIn}:00`).toISOString() : null;
      const checkOutAt =
        !clearOut && editOut ? new Date(`${editDate}T${editOut}:00`).toISOString() : null;
      await upsertDayAttendance({
        userId: editUserId,
        date: editDate,
        checkInAt,
        checkOutAt,
        adminNote: editNote,
        editedBy: profile.id,
      });
      await refresh();
      flash("Attendance day updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not edit attendance");
    }
  }

  if (loading || !profile) {
    return (
      <main className="grid min-h-screen place-items-center px-5">
        <p className="text-sm text-[var(--muted)]">Loading admin…</p>
      </main>
    );
  }

  const pendingLeaves = leaves.filter((l) => l.status === "pending");
  const present = roster.filter((r) => r.checkedIn && !r.onLeave && !r.isHoliday).length;
  const late = roster.filter((r) => r.punchStatus === "late").length;
  const absent = roster.filter(
    (r) => !r.checkedIn && !r.onLeave && !r.isHoliday,
  ).length;

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 py-8 sm:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <BrandMark size="sm" />
        <div className="flex gap-2">
          <Link
            href="/dashboard/"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
          >
            Staff dashboard
          </Link>
          <button
            type="button"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
            onClick={async () => {
              await logout();
              router.replace("/login/");
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <h1
        className="font-display mt-8 text-3xl font-semibold tracking-tight"
        style={{ fontFamily: "var(--font-bricolage), system-ui, sans-serif" }}
      >
        Admin panel
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Admin works from anywhere. Staff dashboard is office-LAN only. Checkout before 3:00pm is
        blocked; 3:00–3:59pm = half leave.
      </p>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}

      <section className="panel mt-8 rounded-2xl p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Employees — one click</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Tap a person to see leaves, late days, days present, and half leaves.
            </p>
          </div>
          <label className="text-sm">
            Month
            <input
              type="month"
              value={statsMonth}
              onChange={async (e) => {
                setStatsMonth(e.target.value);
                if (selectedEmployeeId) {
                  // refresh will pick up new month via effect dependency
                }
              }}
              className="mt-1 block rounded-lg border border-[var(--line)] px-3 py-2"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {staff
            .filter((s) => s.active)
            .map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectEmployee(s.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  selectedEmployeeId === s.id
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--accent)]"
                }`}
              >
                {s.fullName}
              </button>
            ))}
        </div>
        {selectedStats ? (
          <div className="mt-5 rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent)]/5 p-5">
            <h3 className="font-display text-xl font-semibold">{selectedStats.userName}</h3>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {GROUP_LABELS[selectedStats.staffGroup]} · {statsMonth}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-[var(--line)] bg-white px-3 py-3">
                <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
                  Days present
                </p>
                <p className="mt-1 text-2xl font-semibold">{selectedStats.daysPresent}</p>
              </div>
              <div className="rounded-xl border border-[var(--line)] bg-white px-3 py-3">
                <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
                  Late coming
                </p>
                <p className="mt-1 text-2xl font-semibold">{selectedStats.lateDays}</p>
              </div>
              <div className="rounded-xl border border-[var(--line)] bg-white px-3 py-3">
                <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
                  Half leaves
                </p>
                <p className="mt-1 text-2xl font-semibold">{selectedStats.halfLeaves}</p>
              </div>
              <div className="rounded-xl border border-[var(--line)] bg-white px-3 py-3">
                <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
                  Personal leaves
                </p>
                <p className="mt-1 text-2xl font-semibold">{selectedStats.personalLeaves}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-[var(--muted)]">
              Also: absent {selectedStats.absentDays} · missing checkout{" "}
              {selectedStats.missingCheckoutDays}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted)]">Select an employee above.</p>
        )}
      </section>

      <section className="panel mt-8 rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold">Today overview</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {todayDateStr(settings.timezone)} · {settings.timezone}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--line)] bg-white px-4 py-3">
            <p className="text-xs uppercase text-[var(--muted)]">Present</p>
            <p className="mt-1 text-2xl font-semibold">{present}</p>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-white px-4 py-3">
            <p className="text-xs uppercase text-[var(--muted)]">Late</p>
            <p className="mt-1 text-2xl font-semibold">{late}</p>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-white px-4 py-3">
            <p className="text-xs uppercase text-[var(--muted)]">Absent</p>
            <p className="mt-1 text-2xl font-semibold">{absent}</p>
          </div>
        </div>
        <ul className="mt-4 space-y-2">
          {roster.map((row) => (
            <li
              key={row.profile.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
            >
              <span>
                <strong>{row.profile.fullName}</strong>{" "}
                <span className="text-[var(--muted)]">
                  ({GROUP_LABELS[row.profile.staffGroup]})
                </span>
              </span>
              <span className="capitalize text-[var(--muted)]">
                {row.isHoliday
                  ? "Holiday"
                  : row.onLeave
                    ? "On leave"
                    : row.checkedIn
                      ? `${row.punchStatus.replaceAll("_", " ")}${
                          row.checkInAt
                            ? ` · ${formatClock(row.checkInAt, settings.timezone)}`
                            : ""
                        }${row.checkedOut ? " · out" : " · still in"}`
                      : "Absent"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel mt-8 rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold">Attendance report</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <label className="text-sm">
            From
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2"
            />
          </label>
          <label className="text-sm">
            To
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            Person
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2"
            >
              <option value="">All staff</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="cta rounded-lg px-4 py-2 text-sm font-semibold"
            onClick={() => refresh().then(() => flash("Report refreshed"))}
          >
            Refresh report
          </button>
          <button
            type="button"
            className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold"
            onClick={onExport}
          >
            Export CSV
          </button>
        </div>
        <div className="mt-4 max-h-80 overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--muted)]">
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">In</th>
                <th className="py-2 pr-3">Out</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.slice(0, 200).map((row) => (
                <tr
                  key={`${row.userId}-${row.date}`}
                  className="border-b border-[var(--line)]/70"
                >
                  <td className="py-2 pr-3">{row.date}</td>
                  <td className="py-2 pr-3">{row.userName}</td>
                  <td className="py-2 pr-3">
                    {row.checkInAt ? formatClock(row.checkInAt, settings.timezone) : "—"}
                  </td>
                  <td className="py-2 pr-3">
                    {row.checkOutAt ? formatClock(row.checkOutAt, settings.timezone) : "—"}
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

      <section className="panel mt-8 rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold">Manual edit (fix punch)</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Overwrites that person&apos;s punches for the selected date and stores an admin note.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Staff
            <select
              value={editUserId}
              onChange={(e) => setEditUserId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2"
            >
              <option value="">Select…</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Date
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Check-in time
            <input
              type="time"
              value={editIn}
              onChange={(e) => setEditIn(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Check-out time
            <input
              type="time"
              value={editOut}
              onChange={(e) => setEditOut(e.target.value)}
              disabled={clearOut}
              className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2 disabled:opacity-50"
            />
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={clearOut}
              onChange={(e) => setClearOut(e.target.checked)}
            />
            Leave checkout empty (missing checkout)
          </label>
          <label className="text-sm sm:col-span-2">
            Admin note
            <input
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder="Reason for correction"
              className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2"
            />
          </label>
        </div>
        <button
          type="button"
          className="cta mt-3 rounded-lg px-4 py-2 text-sm font-semibold"
          onClick={onManualEdit}
        >
          Save correction
        </button>
      </section>

      <section className="panel mt-8 rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold">Settings</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Recommended: host on an <strong>office PC</strong> so staff use LAN (
          <code>192.168.x.x</code>). Router public-IP changes after reboot then do not matter.
          <code>.htaccess</code> already allows LAN for staff and <code>/admin</code> +{" "}
          <code>/login</code> from anywhere. See <code>ARCHITECTURE.md</code>.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            Office timezone
            <input
              value={settings.timezone}
              onChange={(e) => setSettings((s) => ({ ...s, timezone: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2"
              placeholder="Asia/Karachi"
            />
          </label>
          <label className="text-sm">
            Extra public IPs (optional backup)
            <textarea
              value={ipDraft}
              onChange={(e) => setIpDraft(e.target.value)}
              rows={3}
              placeholder={"Only if not using office LAN hosting"}
              className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2 font-mono text-xs"
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">
          Optional public-IP snippet (LAN ranges are already in the shipped{" "}
          <code>.htaccess</code>):
        </p>
        <pre className="mt-2 overflow-x-auto rounded-lg border border-[var(--line)] bg-slate-950 p-3 text-xs text-slate-100">
          {htaccessSnippet(
            ipDraft
              .split(/[\n,]+/)
              .map((s) => s.trim())
              .filter(Boolean),
          )}
        </pre>
        <button
          type="button"
          className="cta mt-3 rounded-lg px-4 py-2 text-sm font-semibold"
          onClick={onSaveSettings}
        >
          Save settings
        </button>
      </section>

      <section className="panel mt-8 rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold">Office timings</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(["female", "male"] as StaffGroup[]).map((group) => {
            const t = timings.find((x) => x.staffGroup === group) || {
              staffGroup: group,
              startTime: "09:00",
              endTime: "17:00",
              lateAfterMinutes: 15,
            };
            return (
              <div key={group} className="rounded-xl border border-[var(--line)] bg-white p-4">
                <p className="text-sm font-semibold">{GROUP_LABELS[group]}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <label>
                    Start
                    <input
                      type="time"
                      value={t.startTime}
                      onChange={(e) =>
                        setTimings((prev) =>
                          prev.map((row) =>
                            row.staffGroup === group
                              ? { ...row, startTime: e.target.value }
                              : row,
                          ),
                        )
                      }
                      className="mt-1 w-full rounded border border-[var(--line)] px-2 py-1.5"
                    />
                  </label>
                  <label>
                    End
                    <input
                      type="time"
                      value={t.endTime}
                      onChange={(e) =>
                        setTimings((prev) =>
                          prev.map((row) =>
                            row.staffGroup === group
                              ? { ...row, endTime: e.target.value }
                              : row,
                          ),
                        )
                      }
                      className="mt-1 w-full rounded border border-[var(--line)] px-2 py-1.5"
                    />
                  </label>
                  <label>
                    Late after (min)
                    <input
                      type="number"
                      min={0}
                      value={t.lateAfterMinutes}
                      onChange={(e) =>
                        setTimings((prev) =>
                          prev.map((row) =>
                            row.staffGroup === group
                              ? {
                                  ...row,
                                  lateAfterMinutes: Number(e.target.value) || 0,
                                }
                              : row,
                          ),
                        )
                      }
                      className="mt-1 w-full rounded border border-[var(--line)] px-2 py-1.5"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="cta mt-3 rounded-lg px-4 py-2 text-sm font-semibold"
                  onClick={() => onSaveTiming(group, t)}
                >
                  Save {GROUP_LABELS[group]}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel mt-8 rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold">Announce company holiday</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            type="date"
            value={holDate}
            onChange={(e) => setHolDate(e.target.value)}
            className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
          />
          <input
            value={holTitle}
            onChange={(e) => setHolTitle(e.target.value)}
            placeholder="Title"
            className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
          />
          <input
            value={holNote}
            onChange={(e) => setHolNote(e.target.value)}
            placeholder="Note (optional)"
            className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          className="cta mt-3 rounded-lg px-4 py-2 text-sm font-semibold"
          onClick={onAddHoliday}
        >
          Announce holiday
        </button>
        <ul className="mt-4 space-y-2">
          {holidays.map((h) => (
            <li
              key={h.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
            >
              <span>
                <strong>{h.date}</strong> — {h.title}
                {h.note ? ` (${h.note})` : ""}
              </span>
              <button
                type="button"
                className="text-red-600"
                onClick={async () => {
                  await removeHoliday(h.id);
                  await refresh();
                  flash("Holiday removed");
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel mt-8 rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold">Leave approvals (1 / month)</h2>
        {pendingLeaves.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">No pending leave requests.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {pendingLeaves.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-white px-3 py-3 text-sm"
              >
                <span>
                  <strong>{l.userName || l.userId}</strong> — {l.date}
                  {l.reason ? `: ${l.reason}` : ""}
                </span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    className="cta rounded-lg px-3 py-1.5 text-xs font-semibold"
                    onClick={() => onReview(l.id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs"
                    onClick={() => onReview(l.id, "rejected")}
                  >
                    Reject
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel mt-8 rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold">Staff directory (≈15 seats)</h2>
        {!hasSupabaseConfig ? (
          <div className="mt-4 grid gap-3 rounded-xl border border-[var(--line)] bg-white p-4 sm:grid-cols-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Full name"
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
            <input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email"
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Password"
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
            <select
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value as StaffGroup)}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            >
              <option value="female">Female staff</option>
              <option value="male">Male staff</option>
            </select>
            <button
              type="button"
              className="cta rounded-lg px-4 py-2 text-sm font-semibold sm:col-span-2"
              onClick={onAddStaff}
            >
              Add staff (demo)
            </button>
          </div>
        ) : (
          <p className="mt-2 text-xs text-[var(--muted)]">
            Create Auth users in Supabase first, then set role/group/active here. Password resets
            use Supabase Auth (service role not available on static Hostinger).
          </p>
        )}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--muted)]">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Group</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Active</th>
                <th className="py-2">Password</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-b border-[var(--line)]/70">
                  <td className="py-2 pr-3">
                    <div className="font-medium">{s.fullName}</div>
                    <div className="text-xs text-[var(--muted)]">{s.email}</div>
                  </td>
                  <td className="py-2 pr-3">
                    <select
                      value={s.staffGroup}
                      onChange={(e) =>
                        onStaffPatch(s.id, { staffGroup: e.target.value as StaffGroup })
                      }
                      className="rounded border border-[var(--line)] px-2 py-1"
                    >
                      <option value="female">Female staff</option>
                      <option value="male">Male staff</option>
                    </select>
                  </td>
                  <td className="py-2 pr-3">
                    <select
                      value={s.role}
                      onChange={(e) =>
                        onStaffPatch(s.id, { role: e.target.value as StaffRole })
                      }
                      className="rounded border border-[var(--line)] px-2 py-1"
                    >
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="checkbox"
                      checked={s.active}
                      onChange={(e) => onStaffPatch(s.id, { active: e.target.checked })}
                    />
                  </td>
                  <td className="py-2">
                    <button
                      type="button"
                      className="text-xs text-[var(--accent-deep)]"
                      onClick={async () => {
                        const pw = window.prompt(`New password for ${s.fullName}`);
                        if (!pw) return;
                        try {
                          await resetStaffPassword(s.id, pw);
                          flash("Password updated (demo)");
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Reset failed");
                        }
                      }}
                    >
                      Reset
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
