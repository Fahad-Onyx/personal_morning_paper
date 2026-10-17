/**
 * Data-access layer: the ONLY way feature code talks to storage.
 *
 *   import { db } from "@/lib/db";
 *   const user = await db.users.getUser(id);
 *
 * To move to Supabase/Postgres, re-implement these modules with the same
 * function signatures. Nothing outside /lib/db needs to change.
 */
import * as users from "./users";
import * as profiles from "./profiles";
import * as articles from "./articles";
import * as editions from "./editions";
import * as events from "./events";
import { getDb } from "./client";

export const db = { users, profiles, articles, editions, events };

export type * from "./types";

/** Row counts per table, used by the home page status panel and the db:check script. */
export async function getStats(): Promise<Record<string, number>> {
  const conn = getDb();
  const tables = ["users", "interest_profiles", "articles", "editions", "events"] as const;
  return Object.fromEntries(
    tables.map((t) => [t, (conn.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get() as { n: number }).n]),
  );
}
