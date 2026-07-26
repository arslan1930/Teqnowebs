import {
  demoAddHoliday,
  demoListHolidays,
  demoListProfiles,
  demoListTimings,
  demoRemoveHoliday,
  demoSaveTiming,
  demoUpdateProfile,
} from "./demo-store";
import { hasSupabaseConfig } from "./config";
import { getSupabase } from "./supabase";
import type {
  CompanyHoliday,
  OfficeTiming,
  StaffGroup,
  StaffProfile,
  StaffRole,
} from "./types";

function mapTiming(row: Record<string, unknown>): OfficeTiming {
  return {
    staffGroup: row.staff_group as StaffGroup,
    startTime: String(row.start_time).slice(0, 5),
    endTime: String(row.end_time).slice(0, 5),
    lateAfterMinutes: Number(row.late_after_minutes),
  };
}

function mapProfile(row: Record<string, unknown>): StaffProfile {
  return {
    id: row.user_id as string,
    email: row.email as string,
    fullName: row.full_name as string,
    role: row.role as StaffRole,
    staffGroup: row.staff_group as StaffGroup,
    active: Boolean(row.active),
  };
}

function mapHoliday(row: Record<string, unknown>): CompanyHoliday {
  return {
    id: row.id as string,
    date: row.holiday_date as string,
    title: row.title as string,
    note: (row.note as string | null) ?? null,
  };
}

export async function listTimings(): Promise<OfficeTiming[]> {
  if (!hasSupabaseConfig) return demoListTimings();
  const supabase = getSupabase();
  if (!supabase) return demoListTimings();
  const { data, error } = await supabase.from("office_timings").select("*");
  if (error) throw new Error(error.message);
  return (data || []).map((r) => mapTiming(r as Record<string, unknown>));
}

export async function saveTiming(timing: OfficeTiming): Promise<OfficeTiming> {
  if (!hasSupabaseConfig) return demoSaveTiming(timing);
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase.from("office_timings").upsert({
    staff_group: timing.staffGroup,
    start_time: timing.startTime,
    end_time: timing.endTime,
    late_after_minutes: timing.lateAfterMinutes,
  });
  if (error) throw new Error(error.message);
  return timing;
}

export async function listHolidays(): Promise<CompanyHoliday[]> {
  if (!hasSupabaseConfig) return demoListHolidays();
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("company_holidays")
    .select("*")
    .order("holiday_date", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map((r) => mapHoliday(r as Record<string, unknown>));
}

export async function addHoliday(input: {
  date: string;
  title: string;
  note?: string;
}): Promise<CompanyHoliday> {
  if (!hasSupabaseConfig) return demoAddHoliday(input);
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("company_holidays")
    .insert({
      holiday_date: input.date,
      title: input.title,
      note: input.note || null,
      created_by: userData.user?.id ?? null,
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message || "Could not add holiday");
  return mapHoliday(data as Record<string, unknown>);
}

export async function removeHoliday(id: string): Promise<void> {
  if (!hasSupabaseConfig) {
    demoRemoveHoliday(id);
    return;
  }
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase.from("company_holidays").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listStaffProfiles(): Promise<StaffProfile[]> {
  if (!hasSupabaseConfig) return demoListProfiles();
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("staff_profiles")
    .select("*")
    .order("full_name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map((r) => mapProfile(r as Record<string, unknown>));
}

export async function updateStaffProfile(
  userId: string,
  patch: Partial<Pick<StaffProfile, "role" | "staffGroup" | "fullName" | "active">>,
): Promise<StaffProfile> {
  if (!hasSupabaseConfig) return demoUpdateProfile(userId, patch);
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");
  const payload: Record<string, unknown> = {};
  if (patch.role) payload.role = patch.role;
  if (patch.staffGroup) payload.staff_group = patch.staffGroup;
  if (patch.fullName) payload.full_name = patch.fullName;
  if (typeof patch.active === "boolean") payload.active = patch.active;
  const { data, error } = await supabase
    .from("staff_profiles")
    .update(payload)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message || "Could not update profile");
  return mapProfile(data as Record<string, unknown>);
}

export async function getTimingForGroup(group: StaffGroup): Promise<OfficeTiming | null> {
  const timings = await listTimings();
  return timings.find((t) => t.staffGroup === group) ?? null;
}
