import { NextResponse } from "next/server";
import { dbAddStaff, dbGetProfile, dbListProfiles } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import type { StaffGroup, StaffRole } from "@/lib/types";

export const runtime = "nodejs";

async function requireAdmin() {
  const uid = await getSessionUserId();
  if (!uid) return null;
  const me = dbGetProfile(uid);
  if (!me || me.role !== "admin") return null;
  return me;
}

export async function GET() {
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ staff: dbListProfiles() });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  try {
    const body = (await req.json()) as {
      fullName?: string;
      email?: string;
      password?: string;
      staffGroup?: StaffGroup;
      role?: StaffRole;
    };
    if (!body.fullName || !body.email || !body.password || !body.staffGroup) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const profile = dbAddStaff({
      fullName: body.fullName,
      email: body.email,
      password: body.password,
      staffGroup: body.staffGroup,
      role: body.role === "admin" ? "admin" : "staff",
    });
    return NextResponse.json({ profile });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not add staff" },
      { status: 400 },
    );
  }
}
