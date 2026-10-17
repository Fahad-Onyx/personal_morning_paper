import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

/** DELETE /api/session: sign out (switch reader). Data stays in the DB. */
export async function DELETE() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
