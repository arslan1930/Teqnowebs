import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { dbListTasks } from "@/lib/db";
import { currentMonth } from "@/lib/format";
import { computeMonthPnL } from "@/lib/pnl";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const month = currentMonth();
  const mine =
    user.role === "staff"
      ? dbListTasks({ assigneeId: user.id })
      : dbListTasks();
  const inProgress = mine.filter((t) => t.status === "in_progress" || t.status === "queued");
  const recentPublished = mine
    .filter((t) => t.status === "published" || t.status === "live")
    .slice(0, 8);
  const pnl = user.role === "admin" ? computeMonthPnL(month) : null;
  return NextResponse.json({
    inProgressCount: inProgress.length,
    recentPublished,
    month,
    pnl,
  });
}
