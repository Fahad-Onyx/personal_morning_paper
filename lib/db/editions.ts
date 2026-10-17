import { getDb } from "./client";
import type { Edition, EditionItem, EditionStatus, ISODate, NewEditionItem } from "./types";
import { newId, now, parseJson } from "./util";

type EditionRow = {
  id: string;
  user_id: string;
  edition_date: string;
  status: EditionStatus;
  layout: string;
  recap: string | null;
  created_at: string;
};
type ItemRow = {
  id: string;
  edition_id: string;
  article_id: string;
  section: string;
  position: number;
  is_lead: number;
  length: EditionItem["length"];
  score: number;
  summary: string | null;
  why_this_story: string | null;
};

const toEdition = (r: EditionRow): Edition => ({
  id: r.id,
  userId: r.user_id,
  editionDate: r.edition_date,
  status: r.status,
  layout: parseJson(r.layout, {}),
  recap: parseJson(r.recap, null),
  createdAt: r.created_at,
});

const toItem = (r: ItemRow): EditionItem => ({
  id: r.id,
  editionId: r.edition_id,
  articleId: r.article_id,
  section: r.section,
  position: r.position,
  isLead: r.is_lead === 1,
  length: r.length,
  score: r.score,
  summary: r.summary,
  whyThisStory: r.why_this_story,
});

export interface SaveEditionInput {
  userId: string;
  editionDate: ISODate;
  layout: Record<string, unknown>;
  recap?: unknown;
  items: NewEditionItem[];
}

/**
 * Saves a finished edition. If the user already has one for that date it is
 * replaced, so rebuilding "today" works.
 */
export async function saveEdition(input: SaveEditionInput): Promise<Edition> {
  const db = getDb();
  const id = newId();

  db.transaction(() => {
    db.prepare("DELETE FROM editions WHERE user_id = ? AND edition_date = ?").run(
      input.userId,
      input.editionDate,
    );
    db.prepare(
      `INSERT INTO editions (id, user_id, edition_date, status, layout, recap, created_at)
       VALUES (?, ?, ?, 'ready', ?, ?, ?)`,
    ).run(
      id,
      input.userId,
      input.editionDate,
      JSON.stringify(input.layout),
      input.recap === undefined ? null : JSON.stringify(input.recap),
      now(),
    );
    const insertItem = db.prepare(
      `INSERT INTO edition_items (id, edition_id, article_id, section, position, is_lead,
                                  length, score, summary, why_this_story)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const it of input.items) {
      insertItem.run(
        newId(),
        id,
        it.articleId,
        it.section,
        it.position,
        it.isLead ? 1 : 0,
        it.length,
        it.score,
        it.summary,
        it.whyThisStory,
      );
    }
  })();

  return (await getEdition(id))!;
}

export async function getEdition(id: string): Promise<Edition | null> {
  const row = getDb().prepare("SELECT * FROM editions WHERE id = ?").get(id) as EditionRow | undefined;
  return row ? toEdition(row) : null;
}

export async function getEditionByDate(userId: string, date: ISODate): Promise<Edition | null> {
  const row = getDb()
    .prepare("SELECT * FROM editions WHERE user_id = ? AND edition_date = ?")
    .get(userId, date) as EditionRow | undefined;
  return row ? toEdition(row) : null;
}

/** Past editions, newest first (for the archive). */
export async function listEditions(userId: string, limit = 60): Promise<Edition[]> {
  const rows = getDb()
    .prepare("SELECT * FROM editions WHERE user_id = ? ORDER BY edition_date DESC LIMIT ?")
    .all(userId, limit) as EditionRow[];
  return rows.map(toEdition);
}

export async function listEditionItems(editionId: string): Promise<EditionItem[]> {
  const rows = getDb()
    .prepare("SELECT * FROM edition_items WHERE edition_id = ? ORDER BY position")
    .all(editionId) as ItemRow[];
  return rows.map(toItem);
}

/** Article ids already printed in this reader's other editions, so stories don't repeat day to day. */
export async function listPrintedArticleIds(userId: string, exceptDate: ISODate): Promise<Set<string>> {
  const rows = getDb()
    .prepare(
      `SELECT DISTINCT i.article_id FROM edition_items i
       JOIN editions e ON e.id = i.edition_id
       WHERE e.user_id = ? AND e.edition_date <> ?`,
    )
    .all(userId, exceptDate) as { article_id: string }[];
  return new Set(rows.map((r) => r.article_id));
}
