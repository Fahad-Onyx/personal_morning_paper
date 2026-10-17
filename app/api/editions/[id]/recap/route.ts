import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildReadingRecap } from "@/lib/edition/recap";
import { getCurrentUser } from "@/lib/session";

/** POST /api/editions/:id/recap: rewrite "3 things you learned today" from what the reader actually read. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const edition = await db.editions.getEdition(id);
  if (!edition || edition.userId !== user.id) return NextResponse.json({ error: "Edition not found" }, { status: 404 });

  try {
    const recap = await buildReadingRecap(edition);
    if (!recap) return NextResponse.json({ error: "Nothing to recap yet" }, { status: 409 });
    return NextResponse.json({ recap });
  } catch (err) {
    console.error("[recap] failed:", err);
    return NextResponse.json({ error: "Couldn't update the recap." }, { status: 500 });
  }
}
