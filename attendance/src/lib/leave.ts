import {
  demoApprovedLeavesThisMonth,
  demoListLeaves,
  demoRequestLeave,
  demoReviewLeave,
} from "./demo-store";
import { monthKey, todayDateStr } from "./dates";
import { hasSupabaseConfig } from "./config";
import { listStaffProfiles } from "./settings";
import { getSupabase } from "./supabase";
import type { LeaveRequest, LeaveStatus } from "./types";

function mapLeave(row: Record<string, unknown>, userName?: string): LeaveRequest {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    userName,
    date: row.leave_date as string,
    reason: (row.reason as string | null) ?? null,
    status: row.status as LeaveStatus,
    createdAt: row.created_at as string,
  };
}

export async function listLeaves(userId?: string): Promise<LeaveRequest[]> {
  if (!hasSupabaseConfig) return demoListLeaves(userId);
  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase
    .from("leave_requests")
    .select("*")
    .order("leave_date", { ascending: false });
  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const profiles = await listStaffProfiles().catch(() => []);
  const nameById = new Map(profiles.map((p) => [p.id, p.fullName]));

  return (data || []).map((r) => {
    const row = r as Record<string, unknown>;
    return mapLeave(row, nameById.get(row.user_id as string));
  });
}

export async function approvedLeavesThisMonth(
  userId: string,
  ref = todayDateStr(),
): Promise<number> {
  if (!hasSupabaseConfig) return demoApprovedLeavesThisMonth(userId, ref);
  const leaves = await listLeaves(userId);
  return leaves.filter(
    (l) => l.status === "approved" && monthKey(l.date) === monthKey(ref),
  ).length;
}

export async function requestLeave(
  userId: string,
  date: string,
  reason?: string,
): Promise<LeaveRequest> {
  if (!hasSupabaseConfig) return demoRequestLeave(userId, date, reason);

  const used = await approvedLeavesThisMonth(userId, date);
  const mine = await listLeaves(userId);
  const pending = mine.filter(
    (l) => l.status === "pending" && monthKey(l.date) === monthKey(date),
  );
  if (used >= 1 || pending.length >= 1) {
    throw new Error("Only 1 personal leave is allowed per month");
  }

  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase
    .from("leave_requests")
    .insert({
      user_id: userId,
      leave_date: date,
      reason: reason || null,
      status: "pending",
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message || "Could not request leave");
  return mapLeave(data as Record<string, unknown>);
}

export async function reviewLeave(
  id: string,
  status: "approved" | "rejected",
): Promise<LeaveRequest> {
  if (!hasSupabaseConfig) return demoReviewLeave(id, status);
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");

  if (status === "approved") {
    const { data: current, error: readErr } = await supabase
      .from("leave_requests")
      .select("*")
      .eq("id", id)
      .single();
    if (readErr || !current) throw new Error(readErr?.message || "Leave not found");
    const used = await approvedLeavesThisMonth(
      current.user_id as string,
      current.leave_date as string,
    );
    if (used >= 1) {
      throw new Error("This staff member already has 1 approved leave this month");
    }
  }

  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("leave_requests")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: userData.user?.id ?? null,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message || "Could not update leave");
  return mapLeave(data as Record<string, unknown>);
}
