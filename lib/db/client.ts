import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { env } from "@/lib/env";
import { MIGRATIONS } from "./schema";

/**
 * The single SQLite connection. Only files inside /lib/db import this;
 * feature code calls the repository functions instead.
 *
 * The connection is cached on globalThis so Next.js hot reload in dev doesn't
 * open a new connection on every code change.
 */
const globalForDb = globalThis as unknown as { __pmpDb?: Database.Database };

export function getDb(): Database.Database {
  if (!globalForDb.__pmpDb) {
    globalForDb.__pmpDb = open(env().DATABASE_PATH);
  }
  return globalForDb.__pmpDb;
}

function open(dbPath: string): Database.Database {
  const resolved = path.resolve(process.cwd(), dbPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });

  const db = new Database(resolved);
  db.pragma("journal_mode = WAL"); // lets reads run while a write is in progress
  db.pragma("foreign_keys = ON"); // SQLite leaves foreign keys off by default
  migrate(db);
  return db;
}

/** Runs every migration newer than the database's user_version, in one transaction. */
export function migrate(db: Database.Database): void {
  const current = db.pragma("user_version", { simple: true }) as number;
  if (current >= MIGRATIONS.length) return;

  db.transaction(() => {
    for (let v = current; v < MIGRATIONS.length; v++) {
      db.exec(MIGRATIONS[v]);
    }
    db.pragma(`user_version = ${MIGRATIONS.length}`);
  })();
}
