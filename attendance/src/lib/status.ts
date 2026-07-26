import { parseTimeOnDate, startOfTodayIso, todayDateStr } from "./dates";
import type {
  AttendanceEvent,
  CompanyHoliday,
  DayStatus,
  LeaveRequest,
  OfficeTiming,
  PunchStatus,
} from "./types";

export function getDayStatus(
  events: AttendanceEvent[],
  opts?: {
    timing?: OfficeTiming | null;
    holidayToday?: CompanyHoliday | null;
    leaveToday?: LeaveRequest | null;
  },
): DayStatus {
  const today = startOfTodayIso();
  const todays = events.filter((e) => e.createdAt >= today);
  const checkIn = todays.find((e) => e.type === "check_in") || null;
  const checkedIn = Boolean(checkIn);
  const checkedOut = todays.some((e) => e.type === "check_out");

  let punchStatus: PunchStatus = "none";
  if (opts?.holidayToday) punchStatus = "holiday";
  else if (opts?.leaveToday?.status === "approved") punchStatus = "on_leave";
  else if (checkIn && opts?.timing) {
    const dateStr = todayDateStr();
    const latestOk = parseTimeOnDate(dateStr, opts.timing.startTime);
    latestOk.setMinutes(latestOk.getMinutes() + opts.timing.lateAfterMinutes);
    punchStatus = new Date(checkIn.createdAt) <= latestOk ? "on_time" : "late";
  } else if (checkIn) {
    punchStatus = "on_time";
  }

  return {
    checkedIn,
    checkedOut,
    lastEvent: todays[0] ?? null,
    punchStatus,
  };
}

export function holidayOnDate(
  holidays: CompanyHoliday[],
  dateStr: string,
): CompanyHoliday | null {
  return holidays.find((h) => h.date === dateStr) ?? null;
}

export function approvedLeaveOnDate(
  leaves: LeaveRequest[],
  dateStr: string,
): LeaveRequest | null {
  return (
    leaves.find((l) => l.date === dateStr && l.status === "approved") ?? null
  );
}
