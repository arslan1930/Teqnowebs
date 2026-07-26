import type { AttendanceEvent, AttendanceEventType, StaffProfile } from "./types";

const PROFILE_KEY = "teqnowebs.attendance.profile";
const EVENTS_KEY = "teqnowebs.attendance.events";

/** Demo accounts for local / pre-Supabase use */
export const DEMO_USERS: Array<StaffProfile & { password: string }> = [
  {
    id: "demo-arslan",
    email: "staff@teqnowebs.com",
    fullName: "Demo Staff",
    password: "attendance123",
  },
  {
    id: "demo-hr",
    email: "hr@teqnowebs.com",
    fullName: "HR Demo",
    password: "attendance123",
  },
];

function readEvents(): AttendanceEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    return raw ? (JSON.parse(raw) as AttendanceEvent[]) : [];
  } catch {
    return [];
  }
}

function writeEvents(events: AttendanceEvent[]) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export function demoGetProfile(): StaffProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as StaffProfile) : null;
  } catch {
    return null;
  }
}

export function demoLogin(email: string, password: string): StaffProfile {
  const user = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  );
  if (!user) {
    throw new Error("Invalid email or password. Try staff@teqnowebs.com / attendance123");
  }
  const profile: StaffProfile = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export function demoLogout() {
  localStorage.removeItem(PROFILE_KEY);
}

export function demoListEvents(userId: string): AttendanceEvent[] {
  return readEvents()
    .filter((e) => e.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
  const events = readEvents();
  events.push(event);
  writeEvents(events);
  return event;
}
