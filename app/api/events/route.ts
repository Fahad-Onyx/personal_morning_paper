import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/**
 * POST /api/events
 * Reader behaviour signals from the web reader. Accepts one event or a batch
 * (dwell times are flushed in batches with navigator.sendBeacon).
 *
 *   click    reader opened the original article
 *   skip     reader dismissed a story (undo: true removes the latest skip)
 *   like / dislike   value 1 sets the reaction, value 0 clears it
 *   dwell    value = milliseconds the story was on screen
 */
const EventSchema = z.object({
  editionId: z.string().uuid(),
  articleId: z.string().uuid(),
  type: z.enum(["click", "skip", "like", "dislike", "dwell"]),
  value: z.number().min(0).max(3_600_000).optional(),
  undo: z.boolean().optional(),
});
const BodySchema = z.union([EventSchema, z.object({ events: z.array(EventSchema).max(100) })]);

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  // sendBeacon posts text/plain, so parse the body ourselves.
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  const events = "events" in parsed.data ? parsed.data.events : [parsed.data];

  // Events must refer to the reader's own editions.
  const owned = new Map<string, boolean>();
  for (const e of events) {
    if (!owned.has(e.editionId)) owned.set(e.editionId, (await db.editions.getEdition(e.editionId))?.userId === user.id);
  }

  let logged = 0;
  for (const e of events) {
    if (!owned.get(e.editionId)) continue;
    if (e.undo) {
      await db.events.deleteLatest(user.id, e.articleId, e.type);
      continue;
    }
    if (e.type === "dwell" && (e.value ?? 0) < 2000) continue; // ignore fly-bys
    await db.events.logEvent({
      userId: user.id,
      editionId: e.editionId,
      articleId: e.articleId,
      type: e.type,
      value: e.value ?? 1,
    });
    logged++;
  }
  return NextResponse.json({ logged });
}
