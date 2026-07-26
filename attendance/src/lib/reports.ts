import { listEvents } from "./attendance";
import { daysAgo, todayDateStr } from "./dates";
import { listLeaves } from "./leave";
import { getAppSettings, listHolidays, listStaffProfiles, listTimings } from "./settings";
import { buildDayRows, toCsv } from "./status";
import type { DayAttendanceRow } from "./types";
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
