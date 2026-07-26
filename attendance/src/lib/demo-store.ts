import { monthKey, todayDateStr } from "./dates";
import type {
  AttendanceEvent,
  AttendanceEventType,
  CompanyHoliday,
  LeaveRequest,
  OfficeTiming,
  StaffGroup,
  StaffProfile,
  StaffRole,
} from "./types";

const PROFILE_KEY = "teqnowebs.attendance.profile";
const EVENTS_KEY = "teqnowebs.attendance.events";
const TIMINGS_KEY = "teqnowebs.attendance.timings";
const HOLIDAYS_KEY = "teqnowebs.attendance.holidays";
const LEAVES_KEY = "teqnowebs.attendance.leaves";
const PROFILES_KEY = "teqnowebs.attendance.profiles";

type DemoUser = StaffProfile & { password: string };

export const DEMO_USERS: DemoUser[] = [
  {
    id: "demo-admin",
    email: "admin@teqnowebs.com",
    fullName: "Office Admin",
    role: "admin",
    staffGroup: "male",
    active: true,
    password: "attendance123",
  },
  {
    id: "demo-staff-f",
    email: "staff@teqnowebs.com",
    fullName: "Demo Female Staff",
    role: "staff",
    staffGroup: "female",
    active: true,
    password: "attendance123",
  },
  {
    id: "demo-staff-m",
    email: "hr@teqnowebs.com",
    fullName: "Demo Male Staff",
    role: "staff",
    staffGroup: "male",
    active: true,
    password: "attendance123",
  },
];

const DEFAULT_TIMINGS: OfficeTiming[] = [
  { staffGroup: "female", startTime: "09:00", endTime: "17:00", lateAfterMinutes: 15 },
  { staffGroup: "male", startTime: "09:00", endTime: "18:00", lateAfterMinutes: 15 },
];

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureProfilesSeeded() {
  const existing = readJson<StaffProfile[]>(PROFILES_KEY, []);
  if (existing.length) return existing;
  const seeded = DEMO_USERS.map(({ password: _p, ...p }) => p);
  writeJson(PROFILES_KEY, seeded);
  return seeded;
}

function ensureTimingsSeeded() {
  const existing = readJson<OfficeTiming[]>(TIMINGS_KEY, []);
  if (existing.length) return existing;
  writeJson(TIMINGS_KEY, DEFAULT_TIMINGS);
  return DEFAULT_TIMINGS;
}

export function demoGetProfile(): StaffProfile | null {
  if (typeof window === "undefined") return null;
  return readJson<StaffProfile | null>(PROFILE_KEY, null);
}

export function demoLogin(email: string, password: string): StaffProfile {
  ensureProfilesSeeded();
  ensureTimingsSeeded();
  const user = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  );
  if (!user) {
    throw new Error(
      "Invalid email or password. Try staff@teqnowebs.com or admin@teqnowebs.com / attendance123",
    );
  }
  const profiles = ensureProfilesSeeded();
  const profile = profiles.find((p) => p.id === user.id) || {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    staffGroup: user.staffGroup,
    active: true,
  };
  writeJson(PROFILE_KEY, profile);
  return profile;
}

export function demoLogout() {
  localStorage.removeItem(PROFILE_KEY);
}

export function demoListEvents(userId?: string): AttendanceEvent[] {
  const events = readJson<AttendanceEvent[]>(EVENTS_KEY, []);
  const filtered = userId ? events.filter((e) => e.userId === userId) : events;
  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function demoMark(
  userId: string,
  type: AttendanceEventType,
  note?: string,
): AttendanceEvent {
  const event: AttendanceEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId,
    type,
    createdAt: new Date().toISOString(),
    note: note || null,
  };
  const events = readJson<AttendanceEvent[]>(EVENTS_KEY, []);
  events.push(event);
  writeJson(EVENTS_KEY, events);
  return event;
}

export function demoListTimings(): OfficeTiming[] {
  return ensureTimingsSeeded();
}

export function demoSaveTiming(timing: OfficeTiming): OfficeTiming {
  const timings = ensureTimingsSeeded();
  const next = timings.map((t) => (t.staffGroup === timing.staffGroup ? timing : t));
  writeJson(TIMINGS_KEY, next);
  return timing;
}

export function demoListHolidays(): CompanyHoliday[] {
  return readJson<CompanyHoliday[]>(HOLIDAYS_KEY, []).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

export function demoAddHoliday(input: {
  date: string;
  title: string;
  note?: string;
}): CompanyHoliday {
  const holidays = demoListHolidays();
  if (holidays.some((h) => h.date === input.date)) {
    throw new Error("A holiday is already announced for that date");
  }
  const row: CompanyHoliday = {
    id: `hol-${Date.now()}`,
    date: input.date,
    title: input.title,
    note: input.note || null,
  };
  holidays.push(row);
  writeJson(HOLIDAYS_KEY, holidays);
  return row;
}

export function demoRemoveHoliday(id: string) {
  writeJson(
    HOLIDAYS_KEY,
    demoListHolidays().filter((h) => h.id !== id),
  );
}

export function demoListLeaves(userId?: string): LeaveRequest[] {
  const leaves = readJson<LeaveRequest[]>(LEAVES_KEY, []);
  const profiles = ensureProfilesSeeded();
  const enriched = leaves.map((l) => ({
    ...l,
    userName: profiles.find((p) => p.id === l.userId)?.fullName,
  }));
  const filtered = userId ? enriched.filter((l) => l.userId === userId) : enriched;
  return filtered.sort((a, b) => b.date.localeCompare(a.date));
}

export function demoRequestLeave(
  userId: string,
  date: string,
  reason?: string,
): LeaveRequest {
  const leaves = readJson<LeaveRequest[]>(LEAVES_KEY, []);
  if (leaves.some((l) => l.userId === userId && l.date === date)) {
    throw new Error("You already have a leave request for that date");
  }
  const approvedThisMonth = leaves.filter(
    (l) =>
      l.userId === userId &&
      l.status === "approved" &&
      monthKey(l.date) === monthKey(date),
  ).length;
  const pendingThisMonth = leaves.filter(
    (l) =>
      l.userId === userId &&
      l.status === "pending" &&
      monthKey(l.date) === monthKey(date),
  ).length;
  if (approvedThisMonth >= 1 || pendingThisMonth >= 1) {
    throw new Error("Only 1 personal leave is allowed per month");
  }
  const row: LeaveRequest = {
    id: `leave-${Date.now()}`,
    userId,
    date,
    reason: reason || null,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  leaves.push(row);
  writeJson(LEAVES_KEY, leaves);
  return row;
}

export function demoReviewLeave(
  id: string,
  status: "approved" | "rejected",
): LeaveRequest {
  const leaves = readJson<LeaveRequest[]>(LEAVES_KEY, []);
  const idx = leaves.findIndex((l) => l.id === id);
  if (idx < 0) throw new Error("Leave request not found");
  const current = leaves[idx];
  if (status === "approved") {
    const approved = leaves.filter(
      (l) =>
        l.userId === current.userId &&
        l.status === "approved" &&
        monthKey(l.date) === monthKey(current.date) &&
        l.id !== id,
    );
    if (approved.length >= 1) {
      throw new Error("This staff member already has 1 approved leave this month");
    }
  }
  leaves[idx] = { ...current, status };
  writeJson(LEAVES_KEY, leaves);
  return leaves[idx];
}

export function demoListProfiles(): StaffProfile[] {
  return ensureProfilesSeeded();
}

export function demoUpdateProfile(
  userId: string,
  patch: Partial<Pick<StaffProfile, "role" | "staffGroup" | "fullName" | "active">>,
): StaffProfile {
  const profiles = ensureProfilesSeeded();
  const next = profiles.map((p) => (p.id === userId ? { ...p, ...patch } : p));
  writeJson(PROFILES_KEY, next);
  const updated = next.find((p) => p.id === userId);
  if (!updated) throw new Error("Profile not found");
  const session = demoGetProfile();
  if (session?.id === userId) writeJson(PROFILE_KEY, updated);
  return updated;
}

export function demoApprovedLeavesThisMonth(userId: string, ref = todayDateStr()): number {
  return demoListLeaves(userId).filter(
    (l) => l.status === "approved" && monthKey(l.date) === monthKey(ref),
  ).length;
}
