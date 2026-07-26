import { listEvents } from "./attendance";
import { daysAgo, monthKey, todayDateStr } from "./dates";
import { listLeaves } from "./leave";
import { getAppSettings, listHolidays, listStaffProfiles, listTimings } from "./settings";
import { buildDayRows, toCsv } from "./status";
import type { DayAttendanceRow, EmployeePeriodStats } from "./types";
import { DEFAULT_TIMEZONE } from "./types";

export async function attendanceReport(opts?: {
  from?: string;
  to?: string;
  userId?: string;
}): Promise<DayAttendanceRow[]> {
  const settings = await getAppSettings();
  const tz = settings.timezone || DEFAULT_TIMEZONE;
  const to = opts?.to || todayDateStr(tz);
  const from = opts?.from || daysAgo(29, tz);
  const [profiles, events, holidays, leaves, timings] = await Promise.all([
    listStaffProfiles(),
    listEvents(opts?.userId),
    listHolidays(),
    listLeaves(opts?.userId),
    listTimings(),
  ]);
  return buildDayRows({
    profiles,
    events,
    holidays,
    leaves,
    timings,
    from,
    to,
    timeZone: tz,
    userId: opts?.userId,
  });
}

export async function attendanceCsv(opts?: {
  from?: string;
  to?: string;
  userId?: string;
}): Promise<string> {
  const rows = await attendanceReport(opts);
  return toCsv(rows);
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function employeeStats(opts?: {
  from?: string;
  to?: string;
  userId?: string;
}): Promise<EmployeePeriodStats[]> {
  const settings = await getAppSettings();
  const tz = settings.timezone || DEFAULT_TIMEZONE;
  const to = opts?.to || todayDateStr(tz);
  const from = opts?.from || `${monthKey(to)}-01`;
  const [rows, leaves, profiles] = await Promise.all([
    attendanceReport({ from, to, userId: opts?.userId }),
    listLeaves(opts?.userId),
    listStaffProfiles(),
  ]);

  const target = opts?.userId
    ? profiles.filter((p) => p.id === opts.userId)
    : profiles.filter((p) => p.active && p.role === "staff");

  return target.map((profile) => {
    const mine = rows.filter((r) => r.userId === profile.id);
    const personalLeaves = leaves.filter(
      (l) =>
        l.userId === profile.id &&
        l.status === "approved" &&
        l.date >= from &&
        l.date <= to,
    ).length;
    return {
      userId: profile.id,
      userName: profile.fullName,
      staffGroup: profile.staffGroup,
      daysPresent: mine.filter((r) => Boolean(r.checkInAt) && r.status !== "holiday").length,
      lateDays: mine.filter((r) => r.wasLate).length,
      halfLeaves: mine.filter((r) => r.halfLeave || r.status === "half_leave").length,
      personalLeaves,
      absentDays: mine.filter((r) => r.status === "absent").length,
      missingCheckoutDays: mine.filter((r) => r.status === "missing_checkout").length,
    };
  });
}

export async function employeeStatsFor(
  userId: string,
  from?: string,
  to?: string,
): Promise<EmployeePeriodStats | null> {
  const list = await employeeStats({ userId, from, to });
  return list[0] ?? null;
}
