import { apiGet, apiSend } from "./api-client";
import { hasSupabaseConfig, useLocalDb } from "./config";
import { partsInTz, todayDateStr } from "./dates";
import { listLeaves } from "./leave";
import { getAppSettings, getTimingForGroup, listHolidays, listStaffProfiles } from "./settings";
import { approvedLeaveOnDate, getDayStatus, holidayOnDate } from "./status";
import { getSupabase } from "./supabase";
import type {
  AttendanceEvent,
  AttendanceEventType,
  RosterRow,
  StaffGroup,
  StaffProfile,
  StaffRole,
} from "./types";
import { DEFAULT_TIMEZONE } from "./types";

export { getDayStatus } from "./status";
export { hasSupabaseConfig, useLocalDb };

function mapEvent(row: Record<string, unknown>): AttendanceEvent {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    type: row.type as AttendanceEventType,
    createdAt: row.created_at as string,
    note: (row.note as string | null) ?? null,
    clientIp: (row.client_ip as string | null) ?? null,
    isManual: Boolean(row.is_manual),
    editedBy: (row.edited_by as string | null) ?? null,
  };
}

async function fetchProfileRow(userId: string, email: string, fallbackName: string) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("staff_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) {
    return {
      id: userId,
      email,
      fullName: fallbackName,
      role: "staff" as StaffRole,
      staffGroup: "male" as StaffGroup,
      active: true,
    };
  }
  return {
    id: data.user_id as string,
    email: data.email as string,
    fullName: data.full_name as string,
    role: data.role as StaffRole,
    staffGroup: data.staff_group as StaffGroup,
    active: Boolean(data.active),
  };
}

export async function getSessionProfile(): Promise<StaffProfile | null> {
  if (useLocalDb) {
    const { profile } = await apiGet<{ profile: StaffProfile | null }>("/api/auth/me");
    return profile;
  }
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const email = data.user.email || "";
  const fallback =
    (data.user.user_metadata?.full_name as string | undefined) ||
    email.split("@")[0] ||
    "Staff";
  const profile = await fetchProfileRow(data.user.id, email, fallback);
  if (profile && !profile.active) {
    await supabase.auth.signOut();
    return null;
  }
  return profile;
}

export async function login(email: string, password: string): Promise<StaffProfile> {
  if (useLocalDb) {
    const { profile } = await apiSend<{ profile: StaffProfile }>("/api/auth/login", "POST", {
      email,
      password,
    });
    return profile;
  }
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw new Error(error?.message || "Login failed");
  const fallback =
    (data.user.user_metadata?.full_name as string | undefined) ||
    email.split("@")[0] ||
    "Staff";
  const profile = await fetchProfileRow(data.user.id, data.user.email || email, fallback);
  if (!profile) throw new Error("Login failed");
  if (!profile.active) {
    await supabase.auth.signOut();
    throw new Error("This account is deactivated. Contact admin.");
  }
  return profile;
}

export async function logout(): Promise<void> {
  if (useLocalDb) {
    await apiSend("/api/auth/logout", "POST");
    return;
  }
  const supabase = getSupabase();
  if (supabase) await supabase.auth.signOut();
}

export async function listEvents(userId?: string): Promise<AttendanceEvent[]> {
  if (useLocalDb) {
    const q = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    const { events } = await apiGet<{ events: AttendanceEvent[] }>(`/api/events${q}`);
    return events;
  }
  const supabase = getSupabase();
  if (!supabase) return [];
  let query = supabase
    .from("attendance_events")
    .select("id,user_id,type,created_at,note,client_ip,is_manual,edited_by")
    .order("created_at", { ascending: false })
    .limit(2000);
  if (userId) query = query.eq("user_id", userId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []).map((row) => mapEvent(row as Record<string, unknown>));
}

export async function markAttendance(
  userId: string,
  type: AttendanceEventType,
  note?: string,
): Promise<AttendanceEvent> {
  void userId;
  if (useLocalDb) {
    const { event } = await apiSend<{ event: AttendanceEvent }>("/api/events", "POST", {
      type,
      note,
    });
    return event;
  }
  throw new Error("Configure local SQLite server or Supabase");
}

export async function upsertDayAttendance(input: {
  userId: string;
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  adminNote?: string;
  editedBy: string;
}): Promise<void> {
  void input.editedBy;
  if (useLocalDb) {
    await apiSend("/api/admin/manual-day", "POST", input);
    return;
  }
  throw new Error("Configure local SQLite server");
}

export async function addStaffMember(input: {
  fullName: string;
  email: string;
  password: string;
  staffGroup: StaffGroup;
  role?: StaffRole;
}): Promise<StaffProfile> {
  if (useLocalDb) {
    const { profile } = await apiSend<{ profile: StaffProfile }>("/api/staff", "POST", input);
    return profile;
  }
  throw new Error("Local SQLite server required to add staff");
}

export async function resetStaffPassword(userId: string, password: string): Promise<void> {
  if (useLocalDb) {
    await apiSend(`/api/staff/${userId}`, "PATCH", { password });
    return;
  }
  throw new Error("Local SQLite server required to reset password");
}

export async function buildTodayRoster(): Promise<RosterRow[]> {
  const settings = await getAppSettings();
  const tz = settings.timezone || DEFAULT_TIMEZONE;
  // Admins never appear on attendance roster
  const profiles = (await listStaffProfiles()).filter((p) => p.active && p.role === "staff");
  const events = await listEvents();
  const holidays = await listHolidays();
  const leaves = await listLeaves();
  const dateStr = todayDateStr(tz);
  const holiday = holidayOnDate(holidays, dateStr);

  const rows: RosterRow[] = [];
  for (const profile of profiles) {
    const timing = await getTimingForGroup(profile.staffGroup);
    const userEvents = events.filter((e) => e.userId === profile.id);
    const leave = approvedLeaveOnDate(
      leaves.filter((l) => l.userId === profile.id),
      dateStr,
    );
    const status = getDayStatus(userEvents, {
      timing,
      holidayToday: holiday,
      leaveToday: leave,
      timeZone: tz,
      dateStr,
    });
    const checkIn = userEvents.find(
      (e) =>
        e.type === "check_in" && partsInTz(new Date(e.createdAt), tz).dateStr === dateStr,
    );
    rows.push({
      profile,
      checkedIn: status.checkedIn,
      checkedOut: status.checkedOut,
      punchStatus: status.punchStatus,
      checkInAt: checkIn?.createdAt ?? null,
      onLeave: Boolean(leave),
      isHoliday: Boolean(holiday),
    });
  }
  return rows;
}
