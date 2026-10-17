import { randomUUID } from "node:crypto";

export const newId = (): string => randomUUID();
export const now = (): string => new Date().toISOString();

/** Parses a JSON column, falling back to `fallback` if it's null or corrupt. */
export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (value == null) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
