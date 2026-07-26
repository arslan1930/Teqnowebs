import {
  demoGetProfile,
  demoListEvents,
  demoLogin,
  demoLogout,
  demoMark,
} from "./demo-store";
import { hasSupabaseConfig } from "./config";
import { getSupabase } from "./supabase";
import type {
  AttendanceEvent,
  AttendanceEventType,
  DayStatus,
  StaffProfile,
} from "./types";

function startOfTodayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function getDayStatus(events: AttendanceEvent[]): DayStatus {
  const today = startOfTodayIso();
  const todays = events.filter((e) => e.createdAt >= today);
  const checkedIn = todays.some((e) => e.type === "check_in");
  const checkedOut = todays.some((e) => e.type === "check_out");
  return {
    checkedIn,
    checkedOut,
    lastEvent: todays[0] ?? null,
  };
}

export async function getSessionProfile(): Promise<StaffProfile | null> {
  if (!hasSupabaseConfig) {
    return demoGetProfile();
  }

  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  return {
    id: data.user.id,
    email: data.user.email || "",
    fullName:
      (data.user.user_metadata?.full_name as string | undefined) ||
      data.user.email?.split("@")[0] ||
      "Staff",
  };
}

export async function login(email: string, password: string): Promise<StaffProfile> {
  if (!hasSupabaseConfig) {
    return demoLogin(email, password);
  }

  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    throw new Error(error?.message || "Login failed");
  }

  return {
    id: data.user.id,
    email: data.user.email || email,
    fullName:
      (data.user.user_metadata?.full_name as string | undefined) ||
      email.split("@")[0] ||
      "Staff",
  };
}

export async function logout(): Promise<void> {
  if (!hasSupabaseConfig) {
    demoLogout();
    return;
  }
  const supabase = getSupabase();
  if (supabase) await supabase.auth.signOut();
}

export async function listEvents(userId: string): Promise<AttendanceEvent[]> {
  if (!hasSupabaseConfig) {
    return demoListEvents(userId);
  }

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("attendance_events")
    .select("id,user_id,type,created_at,note")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(40);

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
  if (!hasSupabaseConfig) {
    return demoMark(userId, type, note);
  }

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

export { hasSupabaseConfig };
