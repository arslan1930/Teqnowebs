import { NextResponse } from "next/server";
import { requireAdmin, requireUser } from "@/lib/auth";
import { dbGetClient, dbListTasks, dbUpsertClient } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const client = dbGetClient(id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const tasks = dbListTasks({ clientId: id });
  return NextResponse.json({ client, tasks });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const client = dbUpsertClient({ ...body, id });
    return NextResponse.json({ client });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 },
    );
  }
}
