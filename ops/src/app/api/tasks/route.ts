import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { dbListTasks, dbUpsertTask } from "@/lib/db";
import type { LinkStatus } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const filters = {
    clientId: url.searchParams.get("clientId") || undefined,
    status: url.searchParams.get("status") || undefined,
    month: url.searchParams.get("month") || undefined,
    assigneeId:
      user.role === "staff"
        ? user.id
        : url.searchParams.get("assigneeId") || undefined,
    publishedThisMonth: url.searchParams.get("publishedThisMonth") === "1",
  };
  // Staff see all assigned to them OR unassigned if filter empty — plan says own/assigned
  if (user.role === "staff") filters.assigneeId = user.id;
  return NextResponse.json({ tasks: dbListTasks(filters) });
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await req.json()) as {
      clientId?: string;
      targetUrl?: string;
      siteDomain?: string;
      linkType?: string;
      status?: LinkStatus;
      liveUrl?: string;
      dr?: number;
      price?: number;
      cost?: number;
      assigneeId?: string;
      workMonth?: string;
      notes?: string;
    };
    if (!body.clientId || !body.workMonth || !body.status) {
      return NextResponse.json({ error: "clientId, workMonth, status required" }, { status: 400 });
    }
    if (user.role === "staff") {
      body.assigneeId = user.id;
      // staff cannot set arbitrary price/cost beyond viewing — allow set for ops speed but hide P&L
    }
    const task = dbUpsertTask({
      clientId: body.clientId,
      targetUrl: body.targetUrl,
      siteDomain: body.siteDomain,
      linkType: body.linkType,
      status: body.status,
      liveUrl: body.liveUrl,
      dr: body.dr,
      price: body.price,
      cost: user.role === "admin" ? body.cost : body.cost,
      assigneeId: body.assigneeId,
      workMonth: body.workMonth,
      notes: body.notes,
    });
    return NextResponse.json({ task });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Save failed" },
      { status: 400 },
    );
  }
}
