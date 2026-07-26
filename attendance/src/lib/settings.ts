import { apiGet, apiSend } from "./api-client";
import { hasSupabaseConfig, useLocalDb } from "./config";
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
  if (useLocalDb) {
    const { timings } = await apiGet<{ timings: OfficeTiming[] }>("/api/timings");
    return timings;
  }
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.from("office_timings").select("*");
  if (error) throw new Error(error.message);
  return (data || []).map((r) => mapTiming(r as Record<string, unknown>));
}

export async function saveTiming(timing: OfficeTiming): Promise<OfficeTiming> {
  if (useLocalDb) {
    const { timing: saved } = await apiSend<{ timing: OfficeTiming }>("/api/timings", "PUT", {
      timing,
    });
    return saved;
  }
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
  if (useLocalDb) {
    const { holidays } = await apiGet<{ holidays: CompanyHoliday[] }>("/api/holidays");
    return holidays;
  }
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
  if (useLocalDb) {
    const { holiday } = await apiSend<{ holiday: CompanyHoliday }>("/api/holidays", "POST", input);
    return holiday;
  }
  throw new Error("Local DB required");
}

export async function removeHoliday(id: string): Promise<void> {
  if (useLocalDb) {
    await apiSend("/api/holidays", "POST", { action: "remove", id });
    return;
  }
  throw new Error("Local DB required");
}

export async function listStaffProfiles(): Promise<StaffProfile[]> {
  if (useLocalDb) {
    const { staff } = await apiGet<{ staff: StaffProfile[] }>("/api/staff");
    return staff;
  }
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
  if (useLocalDb) {
    const { profile } = await apiSend<{ profile: StaffProfile }>(
      `/api/staff/${userId}`,
      "PATCH",
      patch,
    );
    return profile;
  }
  throw new Error("Local DB required");
}

export async function getTimingForGroup(group: StaffGroup): Promise<OfficeTiming | null> {
  const timings = await listTimings();
  return timings.find((t) => t.staffGroup === group) ?? null;
}

export async function getAppSettings(): Promise<AppSettings> {
  if (useLocalDb) {
    const { settings } = await apiGet<{ settings: AppSettings }>("/api/settings");
    return settings;
  }
  return { timezone: DEFAULT_TIMEZONE, allowedIps: [] };
}

export async function saveAppSettings(settings: AppSettings): Promise<AppSettings> {
  const cleaned: AppSettings = {
    timezone: settings.timezone.trim() || DEFAULT_TIMEZONE,
    allowedIps: settings.allowedIps.map((ip) => ip.trim()).filter(Boolean),
  };
  if (useLocalDb) {
    const { settings: saved } = await apiSend<{ settings: AppSettings }>(
      "/api/settings",
      "PUT",
      { settings: cleaned },
    );
    return saved;
  }
  return cleaned;
}

export function htaccessSnippet(allowedIps: string[]): string {
  const ips = allowedIps.length ? allowedIps : ["192.168.0.0/16"];
  const lines = ips.map((ip) => `  Require ip ${ip}`);
  return `<IfModule mod_authz_core.c>
${lines.join("\n")}
</IfModule>`;
}

void hasSupabaseConfig;
