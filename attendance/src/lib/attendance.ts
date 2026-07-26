import {
  demoGetProfile,
  demoGetSettings,
  demoListEvents,
  demoLogin,
  demoLogout,
  demoMark,
  demoListProfiles,
  demoUpsertDayAttendance,
  demoAddStaff,
  demoResetPassword,
} from "./demo-store";
import { hasSupabaseConfig } from "./config";
import { partsInTz, todayDateStr } from "./dates";
import { listLeaves } from "./leave";
import {
  getAppSettings,
  getTimingForGroup,
  listHolidays,
  listStaffProfiles,
} from "./settings";
import { approvedLeaveOnDate, getDayStatus, holidayOnDate } from "./status";
import { getSupabase } from "./supabase";
import type {
  AttendanceEvent,
  AttendanceEventType,
  RosterRow,
  StaffProfile,
  StaffRole,
  StaffGroup,
} from "./types";
import { DEFAULT_TIMEZONE } from "./types";

export { getDayStatus } from "./status";
export { hasSupabaseConfig };

async function fetchPublicIp(): Promise<string | null> {
  try {
    const res = await fetch("https://api.ipify.org?format=json", {
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { ip?: string };
    return data.ip || null;
  } catch {
    return null;
  }
}

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
  if (!hasSupabaseConfig) return demoGetProfile();

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
  if (!hasSupabaseConfig) return demoLogin(email, password);

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
  if (!hasSupabaseConfig) {
    demoLogout();
    return;
  }
  const supabase = getSupabase();
  if (supabase) await supabase.auth.signOut();
}

export async function listEvents(userId?: string): Promise<AttendanceEvent[]> {
  if (!hasSupabaseConfig) return demoListEvents(userId);

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
  const settings = hasSupabaseConfig ? await getAppSettings() : demoGetSettings();
  const tz = settings.timezone || DEFAULT_TIMEZONE;
  const dateStr = todayDateStr(tz);
  const holidays = await listHolidays();
  if (holidayOnDate(holidays, dateStr)) {
    throw new Error("Today is a company holiday — no attendance required");
  }
  const leaves = await listLeaves(userId);
  if (approvedLeaveOnDate(leaves, dateStr)) {
    throw new Error("You are on approved leave today");
  }

  const existing = await listEvents(userId);
  const todays = existing.filter(
    (e) => partsInTz(new Date(e.createdAt), tz).dateStr === dateStr,
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

  const clientIp = await fetchPublicIp();

  if (!hasSupabaseConfig) return demoMark(userId, type, note, clientIp);

  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase
    .from("attendance_events")
    .insert({
      user_id: userId,
      type,
      note: note || null,
      client_ip: clientIp,
      is_manual: false,
    })
    .select("id,user_id,type,created_at,note,client_ip,is_manual,edited_by")
    .single();
  if (error || !data) throw new Error(error?.message || "Could not mark attendance");
  return mapEvent(data as Record<string, unknown>);
}

export async function upsertDayAttendance(input: {
  userId: string;
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  adminNote?: string;
  editedBy: string;
}): Promise<void> {
  if (!hasSupabaseConfig) {
    demoUpsertDayAttendance(input);
    return;
  }
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");
  const settings = await getAppSettings();
  const tz = settings.timezone || DEFAULT_TIMEZONE;

  // Remove existing events for that calendar day in office TZ (fetch then filter)
  const { data: existing, error: listErr } = await supabase
    .from("attendance_events")
    .select("id,created_at")
    .eq("user_id", input.userId);
  if (listErr) throw new Error(listErr.message);
  const toDelete = (existing || [])
    .filter((e) => partsInTz(new Date(e.created_at as string), tz).dateStr === input.date)
    .map((e) => e.id as string);
  if (toDelete.length) {
    const { error: delErr } = await supabase
      .from("attendance_events")
      .delete()
      .in("id", toDelete);
    if (delErr) throw new Error(delErr.message);
  }

  const note = input.adminNote?.trim() || "Manual admin edit";
  const inserts = [];
  if (input.checkInAt) {
    inserts.push({
      user_id: input.userId,
      type: "check_in",
      created_at: input.checkInAt,
      note,
      is_manual: true,
      edited_by: input.editedBy,
    });
  }
  if (input.checkOutAt) {
    inserts.push({
      user_id: input.userId,
      type: "check_out",
      created_at: input.checkOutAt,
      note,
      is_manual: true,
      edited_by: input.editedBy,
    });
  }
  if (inserts.length) {
    const { error: insErr } = await supabase.from("attendance_events").insert(inserts);
    if (insErr) throw new Error(insErr.message);
  }
}

export async function addStaffMember(input: {
  fullName: string;
  email: string;
  password: string;
  staffGroup: StaffGroup;
  role?: StaffRole;
}): Promise<StaffProfile> {
  if (!hasSupabaseConfig) return demoAddStaff(input);
  throw new Error(
    "On Hostinger/static deploy, create Auth users in the Supabase dashboard, then insert a staff_profiles row (or ask admin to assign role/group here).",
  );
}

export async function resetStaffPassword(userId: string, password: string): Promise<void> {
  if (!hasSupabaseConfig) {
    demoResetPassword(userId, password);
    return;
  }
  throw new Error(
    "Password resets for live users must be done in Supabase Auth (dashboard or email recovery). Static hosting cannot hold a service-role key.",
  );
}

export async function buildTodayRoster(): Promise<RosterRow[]> {
  const settings = hasSupabaseConfig ? await getAppSettings() : demoGetSettings();
  const tz = settings.timezone || DEFAULT_TIMEZONE;
  const profiles = hasSupabaseConfig
    ? await listStaffProfiles()
    : demoListProfiles().filter((p) => p.role === "staff" || p.role === "admin");
  const events = await listEvents();
  const holidays = await listHolidays();
  const leaves = await listLeaves();
  const dateStr = todayDateStr(tz);
  const holiday = holidayOnDate(holidays, dateStr);

  const rows: RosterRow[] = [];
  for (const profile of profiles.filter((p) => p.active)) {
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
