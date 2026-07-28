import { NextResponse } from "next/server";
import { dbGetProfile, dbListTimings, dbSaveTiming } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import type { OfficeTiming } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ timings: dbListTimings() });
}

export async function PUT(req: Request) {
  const uid = await getSessionUserId();
  const me = uid ? dbGetProfile(uid) : null;
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  try {
    const body = (await req.json()) as { timing: OfficeTiming };
    const timing = dbSaveTiming(body.timing);
    return NextResponse.json({ timing });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Save failed" },
      { status: 400 },
    );
  }
}
