import { getDb } from "./client";
import type { NewReaderEvent, ReaderEvent } from "./types";
import { newId, now } from "./util";

type EventRow = {
  id: string;
  user_id: string;
  article_id: string | null;
  edition_id: string | null;
  type: ReaderEvent["type"];
  value: number | null;
  created_at: string;
};

const toEvent = (r: EventRow): ReaderEvent => ({
  id: r.id,
  userId: r.user_id,
  articleId: r.article_id,
  editionId: r.edition_id,
  type: r.type,
  value: r.value,
  createdAt: r.created_at,
});

export async function logEvent(e: NewReaderEvent): Promise<ReaderEvent> {
  const row: EventRow = {
    id: newId(),
    user_id: e.userId,
    article_id: e.articleId,
    edition_id: e.editionId,
    type: e.type,
    value: e.value,
    created_at: now(),
  };
  getDb()
    .prepare(
      `INSERT INTO events (id, user_id, article_id, edition_id, type, value, created_at)
       VALUES (@id, @user_id, @article_id, @edition_id, @type, @value, @created_at)`,
    )
    .run(row);
  return toEvent(row);
}

/** A user's events since `sinceIso`, oldest first (input to the learning loop). */
export async function listEventsSince(userId: string, sinceIso: string): Promise<ReaderEvent[]> {
  const rows = getDb()
    .prepare("SELECT * FROM events WHERE user_id = ? AND created_at >= ? ORDER BY created_at")
    .all(userId, sinceIso) as EventRow[];
  return rows.map(toEvent);
}

/** All events on one edition, oldest first (to replay skips and reactions in the reader). */
export async function listEventsForEdition(editionId: string): Promise<ReaderEvent[]> {
  const rows = getDb()
    .prepare("SELECT * FROM events WHERE edition_id = ? ORDER BY created_at, rowid")
    .all(editionId) as EventRow[];
  return rows.map(toEvent);
}

/** Removes the reader's most recent event of a type on an article (used by "Undo skip"). */
export async function deleteLatest(userId: string, articleId: string, type: ReaderEvent["type"]): Promise<boolean> {
  const res = getDb()
    .prepare(
      `DELETE FROM events WHERE id = (
         SELECT id FROM events WHERE user_id = ? AND article_id = ? AND type = ?
         ORDER BY created_at DESC, rowid DESC LIMIT 1)`,
    )
    .run(userId, articleId, type);
  return res.changes > 0;
}
