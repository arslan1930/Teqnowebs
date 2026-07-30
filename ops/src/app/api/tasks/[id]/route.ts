import { NextResponse } from "next/server";
import { requireAdmin, requireUser } from "@/lib/auth";
import { dbDeleteTask, dbGetTask, dbUpsertTask } from "@/lib/db";
import type { LinkStatus } from "@/lib/types";

export const runtime = "nodejs";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const existing = dbGetTask(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role === "staff" && existing.assigneeId && existing.assigneeId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = (await req.json()) as Partial<{
      clientId: string;
      targetUrl: string;
      siteDomain: string;
      linkType: string;
      status: LinkStatus;
      liveUrl: string;
      dr: number;
      price: number;
      cost: number;
      assigneeId: string;
      workMonth: string;
      notes: string;
    }>;
    if (user.role === "staff") {
      delete body.assigneeId;
    }
    const task = dbUpsertTask({
      id,
      clientId: body.clientId || existing.clientId,
      targetUrl: body.targetUrl ?? existing.targetUrl,
      siteDomain: body.siteDomain ?? existing.siteDomain,
      linkType: body.linkType ?? existing.linkType,
      status: body.status || existing.status,
      liveUrl: body.liveUrl ?? existing.liveUrl,
      dr: body.dr ?? existing.dr,
      price: body.price ?? existing.price,
      cost: body.cost ?? existing.cost,
      assigneeId:
        user.role === "staff" ? user.id : (body.assigneeId ?? existing.assigneeId),
      workMonth: body.workMonth || existing.workMonth,
      notes: body.notes ?? existing.notes,
    });
    return NextResponse.json({ task });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 },
    );
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { id } = await ctx.params;
  try {
    dbDeleteTask(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Delete failed" },
      { status: 400 },
    );
  }
}
