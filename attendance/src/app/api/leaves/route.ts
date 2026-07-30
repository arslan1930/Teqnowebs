import { NextResponse } from "next/server";
import {
  dbGetProfile,
  dbListLeaves,
  dbRequestLeave,
  dbReviewLeave,
} from "@/lib/db";
import { getSessionUserId } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = dbGetProfile(uid);
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = new URL(req.url).searchParams.get("userId") || undefined;
  if (me.role === "admin") {
    return NextResponse.json({ leaves: dbListLeaves(userId) });
  }
  return NextResponse.json({ leaves: dbListLeaves(me.id) });
}

export async function POST(req: Request) {
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = dbGetProfile(uid);
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await req.json()) as {
      date?: string;
      reason?: string;
      id?: string;
      status?: "approved" | "rejected";
      action?: string;
    };
    if (body.action === "review") {
      if (me.role !== "admin") {
        return NextResponse.json({ error: "Admin only" }, { status: 403 });
      }
      if (!body.id || (body.status !== "approved" && body.status !== "rejected")) {
        return NextResponse.json({ error: "Invalid review" }, { status: 400 });
      }
      const leave = dbReviewLeave(body.id, body.status);
      return NextResponse.json({ leave });
    }
    if (me.role === "admin") {
      return NextResponse.json(
        { error: "Admins do not request personal leave" },
        { status: 403 },
      );
    }
    if (!body.date) return NextResponse.json({ error: "Date required" }, { status: 400 });
    const leave = dbRequestLeave(me.id, body.date, body.reason);
    return NextResponse.json({ leave });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Leave error" },
      { status: 400 },
    );
  }
}
