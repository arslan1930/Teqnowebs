import { NextResponse } from "next/server";
import { dbGetProfile } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const id = await getSessionUserId();
  if (!id) return NextResponse.json({ profile: null });
  const profile = dbGetProfile(id);
  if (!profile || !profile.active) return NextResponse.json({ profile: null });
  return NextResponse.json({ profile });
}
