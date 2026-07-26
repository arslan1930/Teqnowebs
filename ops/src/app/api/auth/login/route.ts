import { NextResponse } from "next/server";
import { dbLogin } from "@/lib/db";
import { setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    const user = dbLogin(body.email, body.password);
    await setSessionCookie(user.id);
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Login failed" },
      { status: 401 },
    );
  }
}
