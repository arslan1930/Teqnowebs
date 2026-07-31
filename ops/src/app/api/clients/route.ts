import { NextResponse } from "next/server";
import { requireAdmin, requireUser } from "@/lib/auth";
import { dbListClients, dbUpsertClient } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ clients: dbListClients(false) });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  try {
    const body = await req.json();
    const client = dbUpsertClient(body);
    return NextResponse.json({ client });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Save failed" },
      { status: 400 },
    );
  }
}
