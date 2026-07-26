"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { buildTodayRoster, getSessionProfile, logout } from "@/lib/attendance";
import { todayDateStr } from "@/lib/dates";
import { listLeaves, reviewLeave } from "@/lib/leave";
import {
  addHoliday,
  listHolidays,
  listStaffProfiles,
  listTimings,
  removeHoliday,
  saveTiming,
  updateStaffProfile,
} from "@/lib/settings";
import type {
  CompanyHoliday,
  LeaveRequest,
  OfficeTiming,
  RosterRow,
  StaffGroup,
  StaffProfile,
  StaffRole,
} from "@/lib/types";
import { GROUP_LABELS } from "@/lib/types";

export default function AdminPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [timings, setTimings] = useState<OfficeTiming[]>([]);
  const [holidays, setHolidays] = useState<CompanyHoliday[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [roster, setRoster] = useState<RosterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [holDate, setHolDate] = useState(todayDateStr());
  const [holTitle, setHolTitle] = useState("");
  const [holNote, setHolNote] = useState("");

  const refresh = useCallback(async () => {
    const [t, h, l, s, r] = await Promise.all([
      listTimings(),
      listHolidays(),
      listLeaves(),
      listStaffProfiles(),
      buildTodayRoster(),
    ]);
    setTimings(t);
    setHolidays(h);
    setLeaves(l);
    setStaff(s);
    setRoster(r);
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

  if (loading || !profile) {
    return (
      <main className="grid min-h-screen place-items-center px-5">
        <p className="text-sm text-[var(--muted)]">Loading admin…</p>
      </main>
    );
  }

  const pendingLeaves = leaves.filter((l) => l.status === "pending");

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
        Manage female/male office hours, holidays, leave approvals, and today’s roster.
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
        <h2 className="font-display text-lg font-semibold">Staff directory</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Create Auth users in Supabase first, then set role and group here.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--muted)]">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Group</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2">Active</th>
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
                  <td className="py-2">
                    <input
                      type="checkbox"
                      checked={s.active}
                      onChange={(e) => onStaffPatch(s.id, { active: e.target.checked })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel mt-8 rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold">Today overview</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">{todayDateStr()}</p>
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
                      ? `${row.punchStatus.replace("_", " ")}${row.checkedOut ? " · out" : ""}`
                      : "Absent"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
