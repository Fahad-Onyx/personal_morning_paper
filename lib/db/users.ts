import { getDb } from "./client";
import type { User } from "./types";
import { newId, now } from "./util";

type UserRow = { id: string; name: string; email: string | null; created_at: string };

const toUser = (r: UserRow): User => ({
  id: r.id,
  name: r.name,
  email: r.email,
  createdAt: r.created_at,
});

// Repository functions are async even though better-sqlite3 is synchronous,
// so callers won't change when this moves to a network database.

export async function createUser(input: { name: string; email?: string | null }): Promise<User> {
  const row: UserRow = { id: newId(), name: input.name, email: input.email ?? null, created_at: now() };
  getDb()
    .prepare("INSERT INTO users (id, name, email, created_at) VALUES (@id, @name, @email, @created_at)")
    .run(row);
  return toUser(row);
}

export async function getUser(id: string): Promise<User | null> {
  const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
  return row ? toUser(row) : null;
}

export async function listUsers(): Promise<User[]> {
  const rows = getDb().prepare("SELECT * FROM users ORDER BY created_at").all() as UserRow[];
  return rows.map(toUser);
}
