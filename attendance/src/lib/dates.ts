import { DEFAULT_TIMEZONE } from "./types";

export function dateStrInTz(date = new Date(), timeZone = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function todayDateStr(timeZone = DEFAULT_TIMEZONE): string {
  return dateStrInTz(new Date(), timeZone);
}

export function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // YYYY-MM
}

/** Local wall-clock parts in an IANA timezone. */
export function partsInTz(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value || "00";
  return {
    dateStr: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour") === "24" ? "0" : get("hour")),
    minute: Number(get("minute")),
    second: Number(get("second")),
  };
}

export function minutesSinceMidnightInTz(date: Date, timeZone: string): number {
  const p = partsInTz(date, timeZone);
  return p.hour * 60 + p.minute;
}

export function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** Start of calendar day in timezone, as UTC ISO (approx via noon trick avoided — use date string filter). */
export function startOfTodayIso(timeZone = DEFAULT_TIMEZONE): string {
  // Prefer filtering by date string in TZ; this returns a lower bound ISO for "today" in TZ.
  const dateStr = todayDateStr(timeZone);
  // Interpret as UTC midnight of that calendar date for coarse filtering
  return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
}

export function parseTimeOnDate(dateStr: string, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(`${dateStr}T00:00:00`);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

export function formatTimeLabel(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function formatWhen(iso: string, timeZone = DEFAULT_TIMEZONE): string {
  return new Date(iso).toLocaleString(undefined, {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatClock(iso: string, timeZone = DEFAULT_TIMEZONE): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function addDays(dateStr: string, delta: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

export function daysAgo(n: number, timeZone = DEFAULT_TIMEZONE): string {
  const today = todayDateStr(timeZone);
  return addDays(today, -n);
}

export function eachDateInclusive(from: string, to: string): string[] {
  const out: string[] = [];
  let cur = from;
  while (cur <= to) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}
