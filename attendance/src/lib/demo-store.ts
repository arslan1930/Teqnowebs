import { monthKey, partsInTz, todayDateStr } from "./dates";
import type {
  AppSettings,
  AttendanceEvent,
  AttendanceEventType,
  CompanyHoliday,
  LeaveRequest,
  OfficeTiming,
  StaffGroup,
  StaffProfile,
  StaffRole,
} from "./types";
import { DEFAULT_TIMEZONE } from "./types";

const PROFILE_KEY = "teqnowebs.attendance.profile";
const EVENTS_KEY = "teqnowebs.attendance.events";
const TIMINGS_KEY = "teqnowebs.attendance.timings";
const HOLIDAYS_KEY = "teqnowebs.attendance.holidays";
const LEAVES_KEY = "teqnowebs.attendance.leaves";
const PROFILES_KEY = "teqnowebs.attendance.profiles";
const SETTINGS_KEY = "teqnowebs.attendance.settings";
const PASSWORDS_KEY = "teqnowebs.attendance.passwords";

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

const DEFAULT_SETTINGS: AppSettings = {
  timezone: DEFAULT_TIMEZONE,
  allowedIps: [],
};

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

function ensurePasswordsSeeded() {
  const existing = readJson<Record<string, string>>(PASSWORDS_KEY, {});
  if (Object.keys(existing).length) return existing;
  const map: Record<string, string> = {};
  for (const u of DEMO_USERS) map[u.id] = u.password;
  writeJson(PASSWORDS_KEY, map);
  return map;
}

function ensureTimingsSeeded() {
  const existing = readJson<OfficeTiming[]>(TIMINGS_KEY, []);
  if (existing.length) return existing;
  writeJson(TIMINGS_KEY, DEFAULT_TIMINGS);
  return DEFAULT_TIMINGS;
}

export function demoGetSettings(): AppSettings {
  return { ...DEFAULT_SETTINGS, ...readJson<AppSettings>(SETTINGS_KEY, DEFAULT_SETTINGS) };
}

export function demoSaveSettings(settings: AppSettings): AppSettings {
  writeJson(SETTINGS_KEY, settings);
  return settings;
}

export function demoGetProfile(): StaffProfile | null {
  if (typeof window === "undefined") return null;
  return readJson<StaffProfile | null>(PROFILE_KEY, null);
}

export function demoLogin(email: string, password: string): StaffProfile {
  ensureProfilesSeeded();
  ensureTimingsSeeded();
  ensurePasswordsSeeded();
  const profiles = ensureProfilesSeeded();
  const passwords = ensurePasswordsSeeded();
  const profile = profiles.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
  if (!profile || passwords[profile.id] !== password) {
    throw new Error(
      "Invalid email or password. Try staff@teqnowebs.com or admin@teqnowebs.com / attendance123",
    );
  }
  if (!profile.active) throw new Error("This account is deactivated. Contact admin.");
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
  clientIp?: string | null,
): AttendanceEvent {
  const settings = demoGetSettings();
  const tz = settings.timezone || DEFAULT_TIMEZONE;
  const today = todayDateStr(tz);
  const events = readJson<AttendanceEvent[]>(EVENTS_KEY, []);
  const todays = events.filter(
    (e) => e.userId === userId && partsInTz(new Date(e.createdAt), tz).dateStr === today,
  );
  if (type === "check_in" && todays.some((e) => e.type === "check_in")) {
    throw new Error("Already checked in today.");
  }
  if (type === "check_out") {
    if (!todays.some((e) => e.type === "check_in")) {
      throw new Error("Check in first before checking out.");
    }
    if (todays.some((e) => e.type === "check_out")) {
      throw new Error("Already checked out today.");
    }
  }
  const event: AttendanceEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId,
    type,
    createdAt: new Date().toISOString(),
    note: note || null,
    clientIp: clientIp || null,
    isManual: false,
  };
  events.push(event);
  writeJson(EVENTS_KEY, events);
  return event;
}

export function demoUpsertDayAttendance(input: {
  userId: string;
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  adminNote?: string;
  editedBy: string;
}): void {
  const settings = demoGetSettings();
  const tz = settings.timezone || DEFAULT_TIMEZONE;
  const events = readJson<AttendanceEvent[]>(EVENTS_KEY, []);
  const kept = events.filter(
    (e) =>
      !(e.userId === input.userId && partsInTz(new Date(e.createdAt), tz).dateStr === input.date),
  );
  const note = input.adminNote?.trim() || "Manual admin edit";
  if (input.checkInAt) {
    kept.push({
      id: `evt-manual-in-${Date.now()}`,
      userId: input.userId,
      type: "check_in",
      createdAt: input.checkInAt,
      note,
      isManual: true,
      editedBy: input.editedBy,
    });
  }
  if (input.checkOutAt) {
    kept.push({
      id: `evt-manual-out-${Date.now()}`,
      userId: input.userId,
      type: "check_out",
      createdAt: input.checkOutAt,
      note,
      isManual: true,
      editedBy: input.editedBy,
    });
  }
  writeJson(EVENTS_KEY, kept);
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

export function demoAddStaff(input: {
  fullName: string;
  email: string;
  password: string;
  staffGroup: StaffGroup;
  role?: StaffRole;
}): StaffProfile {
  const profiles = ensureProfilesSeeded();
  if (profiles.some((p) => p.email.toLowerCase() === input.email.trim().toLowerCase())) {
    throw new Error("A staff member with that email already exists");
  }
  if (profiles.length >= 16) {
    throw new Error("Seat limit reached (15 staff + admin demo seats)");
  }
  const profile: StaffProfile = {
    id: `demo-${Date.now()}`,
    email: input.email.trim().toLowerCase(),
    fullName: input.fullName.trim(),
    role: input.role || "staff",
    staffGroup: input.staffGroup,
    active: true,
  };
  profiles.push(profile);
  writeJson(PROFILES_KEY, profiles);
  const passwords = ensurePasswordsSeeded();
  passwords[profile.id] = input.password;
  writeJson(PASSWORDS_KEY, passwords);
  return profile;
}

export function demoResetPassword(userId: string, password: string): void {
  const passwords = ensurePasswordsSeeded();
  if (!ensureProfilesSeeded().some((p) => p.id === userId)) {
    throw new Error("Profile not found");
  }
  passwords[userId] = password;
  writeJson(PASSWORDS_KEY, passwords);
}

export function demoApprovedLeavesThisMonth(userId: string, ref?: string): number {
  const settings = demoGetSettings();
  const dateRef = ref || todayDateStr(settings.timezone);
  return demoListLeaves(userId).filter(
    (l) => l.status === "approved" && monthKey(l.date) === monthKey(dateRef),
  ).length;
}
