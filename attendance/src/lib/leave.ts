import { apiGet, apiSend } from "./api-client";
import { useLocalDb } from "./config";
import { monthKey, todayDateStr } from "./dates";
import type { LeaveRequest } from "./types";

export async function listLeaves(userId?: string): Promise<LeaveRequest[]> {
  if (!useLocalDb) return [];
  const q = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  const { leaves } = await apiGet<{ leaves: LeaveRequest[] }>(`/api/leaves${q}`);
  return leaves;
}

export async function approvedLeavesThisMonth(
  userId: string,
  ref = todayDateStr(),
): Promise<number> {
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
  void userId;
  if (!useLocalDb) throw new Error("Local DB required");
  const { leave } = await apiSend<{ leave: LeaveRequest }>("/api/leaves", "POST", {
    date,
    reason,
  });
  return leave;
}

export async function reviewLeave(
  id: string,
  status: "approved" | "rejected",
): Promise<LeaveRequest> {
  if (!useLocalDb) throw new Error("Local DB required");
  const { leave } = await apiSend<{ leave: LeaveRequest }>("/api/leaves", "POST", {
    action: "review",
    id,
    status,
  });
  return leave;
}
