import { NextResponse } from "next/server";
import { dbGetProfile, dbResetPassword, dbUpdateProfile } from "@/lib/db";
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

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as {
      role?: StaffRole;
      staffGroup?: StaffGroup;
      fullName?: string;
      active?: boolean;
      password?: string;
    };
    if (body.password) {
      dbResetPassword(id, body.password);
    }
    const profile = dbUpdateProfile(id, {
      role: body.role,
      staffGroup: body.staffGroup,
      fullName: body.fullName,
      active: body.active,
    });
    return NextResponse.json({ profile });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 },
    );
  }
}
