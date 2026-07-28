import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbAddUser, dbListUsers, dbUpdateUser } from "@/lib/db";
import type { UserRole } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  return NextResponse.json({ users: dbListUsers() });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  try {
    const body = (await req.json()) as {
      email?: string;
      fullName?: string;
      password?: string;
      role?: UserRole;
      id?: string;
      active?: boolean;
      action?: string;
    };
    if (body.action === "update" && body.id) {
      const user = dbUpdateUser(body.id, {
        fullName: body.fullName,
        role: body.role,
        active: body.active,
        password: body.password,
      });
      return NextResponse.json({ user });
    }
    if (!body.email || !body.fullName || !body.password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const user = dbAddUser({
      email: body.email,
      fullName: body.fullName,
      password: body.password,
      role: body.role === "admin" ? "admin" : "staff",
    });
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 400 },
    );
  }
}
