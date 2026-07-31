import { NextResponse } from "next/server";
import { dbGetProfile, dbGetSettings, dbSaveSettings } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import type { AppSettings } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ settings: dbGetSettings() });
}

export async function PUT(req: Request) {
  const uid = await getSessionUserId();
  const me = uid ? dbGetProfile(uid) : null;
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  try {
    const body = (await req.json()) as { settings: AppSettings };
    const settings = dbSaveSettings(body.settings);
    return NextResponse.json({ settings });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Save failed" },
      { status: 400 },
    );
  }
}
