import { getDb } from "./client";
import { now, parseJson } from "./util";

/** Tiny key/value store for app state (e.g. the last ingestion report). Values are JSON. */
export async function getMeta<T>(key: string): Promise<{ value: T; updatedAt: string } | null> {
  const row = getDb().prepare("SELECT value, updated_at FROM app_meta WHERE key = ?").get(key) as
    | { value: string; updated_at: string }
    | undefined;
  return row ? { value: parseJson<T>(row.value, null as T), updatedAt: row.updated_at } : null;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  getDb()
    .prepare(
      `INSERT INTO app_meta (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    )
    .run(key, JSON.stringify(value), now());
}
