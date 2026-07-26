import { NextResponse } from "next/server";
import {
  dbDeleteEventsForUserDate,
  dbGetProfile,
  dbGetSettings,
  dbInsertEvent,
} from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { DEFAULT_TIMEZONE } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const uid = await getSessionUserId();
  const me = uid ? dbGetProfile(uid) : null;
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  try {
    const body = (await req.json()) as {
      userId?: string;
      date?: string;
      checkInAt?: string | null;
      checkOutAt?: string | null;
      adminNote?: string;
    };
    if (!body.userId || !body.date) {
      return NextResponse.json({ error: "userId and date required" }, { status: 400 });
    }
    const target = dbGetProfile(body.userId);
    if (!target || target.role !== "staff") {
      return NextResponse.json(
        { error: "Can only edit attendance for staff (not admin)" },
        { status: 400 },
      );
    }
    const tz = dbGetSettings().timezone || DEFAULT_TIMEZONE;
    dbDeleteEventsForUserDate(body.userId, body.date, tz);
    const note = body.adminNote?.trim() || "Manual admin edit";
    if (body.checkInAt) {
      dbInsertEvent({
        userId: body.userId,
        type: "check_in",
        createdAt: body.checkInAt,
        note,
        isManual: true,
        editedBy: me.id,
      });
    }
    if (body.checkOutAt) {
      dbInsertEvent({
        userId: body.userId,
        type: "check_out",
        createdAt: body.checkOutAt,
        note,
        isManual: true,
        editedBy: me.id,
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Edit failed" },
      { status: 400 },
    );
  }
}
