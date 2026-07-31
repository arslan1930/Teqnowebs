import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireUser();
  return NextResponse.json({ user });
}
