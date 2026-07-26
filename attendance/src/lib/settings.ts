import {
  demoAddHoliday,
  demoGetSettings,
  demoListHolidays,
  demoListProfiles,
  demoListTimings,
  demoRemoveHoliday,
  demoSaveSettings,
  demoSaveTiming,
  demoUpdateProfile,
} from "./demo-store";
import { hasSupabaseConfig } from "./config";
import { getSupabase } from "./supabase";
import type {
  AppSettings,
  CompanyHoliday,
  OfficeTiming,
  StaffGroup,
  StaffProfile,
  StaffRole,
} from "./types";
import { DEFAULT_TIMEZONE } from "./types";

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

export async function getAppSettings(): Promise<AppSettings> {
  if (!hasSupabaseConfig) return demoGetSettings();
  const supabase = getSupabase();
  if (!supabase) return demoGetSettings();
  const { data, error } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    return { timezone: DEFAULT_TIMEZONE, allowedIps: [] };
  }
  return {
    timezone: (data.timezone as string) || DEFAULT_TIMEZONE,
    allowedIps: Array.isArray(data.allowed_ips) ? (data.allowed_ips as string[]) : [],
  };
}

export async function saveAppSettings(settings: AppSettings): Promise<AppSettings> {
  const cleaned: AppSettings = {
    timezone: settings.timezone.trim() || DEFAULT_TIMEZONE,
    allowedIps: settings.allowedIps.map((ip) => ip.trim()).filter(Boolean),
  };
  if (!hasSupabaseConfig) return demoSaveSettings(cleaned);
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase.from("app_settings").upsert({
    id: 1,
    timezone: cleaned.timezone,
    allowed_ips: cleaned.allowedIps,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
  return cleaned;
}

export function htaccessSnippet(allowedIps: string[]): string {
  const ips = allowedIps.length ? allowedIps : ["REPLACE_WITH_OFFICE_PUBLIC_IP"];
  const lines = ips.map((ip) => `  Require ip ${ip}`);
  return `<IfModule mod_authz_core.c>
${lines.join("\n")}
</IfModule>`;
}
