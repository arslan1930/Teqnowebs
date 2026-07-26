import {
  hhmmToMinutes,
  minutesSinceMidnightInTz,
  partsInTz,
  todayDateStr,
} from "./dates";
import type {
  AttendanceEvent,
  CompanyHoliday,
  DayAttendanceRow,
  DayStatus,
  LeaveRequest,
  OfficeTiming,
  PunchStatus,
  StaffGroup,
  StaffProfile,
} from "./types";
import { DEFAULT_TIMEZONE } from "./types";

export function eventsOnDate(
  events: AttendanceEvent[],
  dateStr: string,
  timeZone: string,
): AttendanceEvent[] {
  return events.filter((e) => partsInTz(new Date(e.createdAt), timeZone).dateStr === dateStr);
}

export function getDayStatus(
  events: AttendanceEvent[],
  opts?: {
    timing?: OfficeTiming | null;
    holidayToday?: CompanyHoliday | null;
    leaveToday?: LeaveRequest | null;
    timeZone?: string;
    dateStr?: string;
  },
): DayStatus {
  const timeZone = opts?.timeZone || DEFAULT_TIMEZONE;
  const dateStr = opts?.dateStr || todayDateStr(timeZone);
  const todays = eventsOnDate(events, dateStr, timeZone).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  const checkIn = todays.find((e) => e.type === "check_in") || null;
  const checkOut = todays.find((e) => e.type === "check_out") || null;
  const checkedIn = Boolean(checkIn);
  const checkedOut = Boolean(checkOut);
  const isToday = dateStr === todayDateStr(timeZone);

  let punchStatus: PunchStatus = "none";
  let message = "Ready to check in.";

  if (opts?.holidayToday) {
    punchStatus = "holiday";
    message = "Company holiday — attendance not required.";
  } else if (opts?.leaveToday?.status === "approved") {
    punchStatus = "on_leave";
    message = "Approved leave today — attendance not required.";
  } else if (!checkedIn) {
    punchStatus = isToday ? "none" : "absent";
    message = isToday ? "You have not checked in yet today." : "Absent — no check-in recorded.";
  } else if (checkedIn && !checkedOut) {
    if (isToday) {
      punchStatus =
        checkIn && opts?.timing
          ? isLate(checkIn.createdAt, dateStr, opts.timing, timeZone)
            ? "late"
            : "on_time"
          : "on_time";
      message =
        punchStatus === "late"
          ? "Checked in late. Don’t forget to check out before you leave."
          : "Checked in. Don’t forget to check out before you leave.";
    } else {
      punchStatus = "missing_checkout";
      message = "Missing checkout — checked in but never checked out.";
    }
  } else {
    punchStatus =
      checkIn && opts?.timing
        ? isLate(checkIn.createdAt, dateStr, opts.timing, timeZone)
          ? "late"
          : "on_time"
        : "on_time";
    message =
      punchStatus === "late"
        ? "Day complete (late check-in)."
        : "Day complete — checked in and out.";
  }

  return {
    checkedIn,
    checkedOut,
    lastEvent: [...todays].reverse()[0] ?? null,
    punchStatus,
    message,
  };
}

function isLate(
  checkInIso: string,
  dateStr: string,
  timing: OfficeTiming,
  timeZone: string,
): boolean {
  const checkMins = minutesSinceMidnightInTz(new Date(checkInIso), timeZone);
  const limit = hhmmToMinutes(timing.startTime) + timing.lateAfterMinutes;
  // Ensure check-in is on same calendar date in TZ
  void dateStr;
  return checkMins > limit;
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
  return leaves.find((l) => l.date === dateStr && l.status === "approved") ?? null;
}

export function buildDayRows(input: {
  profiles: StaffProfile[];
  events: AttendanceEvent[];
  holidays: CompanyHoliday[];
  leaves: LeaveRequest[];
  timings: OfficeTiming[];
  from: string;
  to: string;
  timeZone: string;
  userId?: string;
}): DayAttendanceRow[] {
  const profiles = input.userId
    ? input.profiles.filter((p) => p.id === input.userId)
    : input.profiles.filter((p) => p.active);
  const dates: string[] = [];
  let cur = input.from;
  while (cur <= input.to) {
    dates.push(cur);
    const d = new Date(`${cur}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    cur = d.toISOString().slice(0, 10);
  }

  const rows: DayAttendanceRow[] = [];
  for (const profile of profiles) {
    const timing =
      input.timings.find((t) => t.staffGroup === profile.staffGroup) || null;
    for (const date of dates) {
      const dayEvents = eventsOnDate(input.events, date, input.timeZone);
      const checkIn = dayEvents.find((e) => e.type === "check_in") || null;
      const checkOut = dayEvents.find((e) => e.type === "check_out") || null;
      const holiday = holidayOnDate(input.holidays, date);
      const leave = approvedLeaveOnDate(
        input.leaves.filter((l) => l.userId === profile.id),
        date,
      );
      const status = getDayStatus(input.events, {
        timing,
        holidayToday: holiday,
        leaveToday: leave,
        timeZone: input.timeZone,
        dateStr: date,
      });
      const note =
        [checkIn?.note, checkOut?.note].filter(Boolean).join(" · ") || null;
      rows.push({
        date,
        userId: profile.id,
        userName: profile.fullName,
        staffGroup: profile.staffGroup as StaffGroup,
        checkInAt: checkIn?.createdAt ?? null,
        checkOutAt: checkOut?.createdAt ?? null,
        checkInIp: checkIn?.clientIp ?? null,
        checkOutIp: checkOut?.clientIp ?? null,
        status: status.punchStatus,
        note,
        isManual: Boolean(checkIn?.isManual || checkOut?.isManual),
      });
    }
  }
  return rows.sort((a, b) =>
    a.date === b.date
      ? a.userName.localeCompare(b.userName)
      : b.date.localeCompare(a.date),
  );
}

export function toCsv(rows: DayAttendanceRow[]): string {
  const header = [
    "date",
    "name",
    "group",
    "status",
    "check_in",
    "check_out",
    "check_in_ip",
    "check_out_ip",
    "note",
    "manual_edit",
  ];
  const lines = rows.map((r) =>
    [
      r.date,
      r.userName,
      r.staffGroup,
      r.status,
      r.checkInAt || "",
      r.checkOutAt || "",
      r.checkInIp || "",
      r.checkOutIp || "",
      (r.note || "").replace(/"/g, '""'),
      r.isManual ? "yes" : "no",
    ]
      .map((cell) => `"${cell}"`)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}
