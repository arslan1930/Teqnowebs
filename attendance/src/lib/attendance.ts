import {
  demoGetProfile,
  demoListEvents,
  demoLogin,
  demoLogout,
  demoMark,
  demoListProfiles,
} from "./demo-store";
import { hasSupabaseConfig } from "./config";
import { todayDateStr } from "./dates";
import { listLeaves } from "./leave";
import { getTimingForGroup, listHolidays, listStaffProfiles } from "./settings";
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

export { getDayStatus } from "./status";
export { hasSupabaseConfig };

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
  return fetchProfileRow(data.user.id, email, fallback);
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
    .select("id,user_id,type,created_at,note")
    .order("created_at", { ascending: false })
    .limit(200);
  if (userId) query = query.eq("user_id", userId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []).map((row) => ({
    id: row.id as string,
    userId: row.user_id as string,
    type: row.type as AttendanceEventType,
    createdAt: row.created_at as string,
    note: (row.note as string | null) ?? null,
  }));
}

export async function markAttendance(
  userId: string,
  type: AttendanceEventType,
  note?: string,
): Promise<AttendanceEvent> {
  const dateStr = todayDateStr();
  const holidays = await listHolidays();
  if (holidayOnDate(holidays, dateStr)) {
    throw new Error("Today is a company holiday — no attendance required");
  }
  const leaves = await listLeaves(userId);
  if (approvedLeaveOnDate(leaves, dateStr)) {
    throw new Error("You are on approved leave today");
  }

  if (!hasSupabaseConfig) return demoMark(userId, type, note);

  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase
    .from("attendance_events")
    .insert({
      user_id: userId,
      type,
      note: note || null,
    })
    .select("id,user_id,type,created_at,note")
    .single();
  if (error || !data) throw new Error(error?.message || "Could not mark attendance");
  return {
    id: data.id as string,
    userId: data.user_id as string,
    type: data.type as AttendanceEventType,
    createdAt: data.created_at as string,
    note: (data.note as string | null) ?? null,
  };
}

export async function buildTodayRoster(): Promise<RosterRow[]> {
  const profiles = hasSupabaseConfig
    ? await listStaffProfiles()
    : demoListProfiles().filter((p) => p.role === "staff" || p.role === "admin");
  const events = await listEvents();
  const holidays = await listHolidays();
  const leaves = await listLeaves();
  const dateStr = todayDateStr();
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
    });
    const checkIn = userEvents.find(
      (e) => e.type === "check_in" && e.createdAt.slice(0, 10) === dateStr,
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
