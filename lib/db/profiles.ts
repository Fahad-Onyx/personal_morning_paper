import { getDb } from "./client";
import type { InterestProfile, ProfileTopic, ReadingPreferences, TopicSource } from "./types";
import { newId, now, parseJson } from "./util";

type ProfileRow = {
  id: string;
  user_id: string;
  raw_input: string | null;
  summary: string | null;
  preferences: string;
  created_at: string;
  updated_at: string;
};
type TopicRow = { topic: string; weight: number; source: TopicSource; updated_at: string };

export interface UpsertProfileInput {
  userId: string;
  rawInput?: string | null;
  summary?: string | null;
  preferences?: ReadingPreferences;
  topics: { topic: string; weight: number; source?: TopicSource }[];
}

/** Weights are always kept in [0, 1]. */
const clampWeight = (w: number) => Math.min(1, Math.max(0, w));

/**
 * Creates or replaces a user's profile and its full topic list in one transaction.
 * Used by onboarding (and to edit interests later).
 */
export async function upsertProfile(input: UpsertProfileInput): Promise<InterestProfile> {
  const db = getDb();
  const ts = now();

  db.transaction(() => {
    const existing = db
      .prepare("SELECT id FROM interest_profiles WHERE user_id = ?")
      .get(input.userId) as { id: string } | undefined;
    const profileId = existing?.id ?? newId();

    db.prepare(
      `INSERT INTO interest_profiles (id, user_id, raw_input, summary, preferences, created_at, updated_at)
       VALUES (@id, @user_id, @raw_input, @summary, @preferences, @ts, @ts)
       ON CONFLICT(user_id) DO UPDATE SET
         raw_input = excluded.raw_input,
         summary = excluded.summary,
         preferences = excluded.preferences,
         updated_at = excluded.updated_at`,
    ).run({
      id: profileId,
      user_id: input.userId,
      raw_input: input.rawInput ?? null,
      summary: input.summary ?? null,
      preferences: JSON.stringify(input.preferences ?? {}),
      ts,
    });

    db.prepare("DELETE FROM profile_topics WHERE profile_id = ?").run(profileId);
    const insertTopic = db.prepare(
      `INSERT INTO profile_topics (profile_id, topic, weight, source, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
    );
    for (const t of input.topics) {
      insertTopic.run(profileId, t.topic, clampWeight(t.weight), t.source ?? "onboarding", ts);
    }
  })();

  return (await getProfileByUser(input.userId))!;
}

export async function getProfileByUser(userId: string): Promise<InterestProfile | null> {
  const db = getDb();
  const p = db.prepare("SELECT * FROM interest_profiles WHERE user_id = ?").get(userId) as
    | ProfileRow
    | undefined;
  if (!p) return null;

  const topics = db
    .prepare("SELECT topic, weight, source, updated_at FROM profile_topics WHERE profile_id = ? ORDER BY weight DESC")
    .all(p.id) as TopicRow[];

  return {
    id: p.id,
    userId: p.user_id,
    rawInput: p.raw_input,
    summary: p.summary,
    preferences: parseJson<ReadingPreferences>(p.preferences, {}),
    topics: topics.map(
      (t): ProfileTopic => ({ topic: t.topic, weight: t.weight, source: t.source, updatedAt: t.updated_at }),
    ),
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

/**
 * Sets new weights for some topics without touching the rest (the learning loop
 * uses this). Topics that don't exist yet are added with source 'learned'.
 */
export async function setTopicWeights(
  profileId: string,
  weights: { topic: string; weight: number }[],
): Promise<void> {
  const db = getDb();
  const ts = now();
  const stmt = db.prepare(
    `INSERT INTO profile_topics (profile_id, topic, weight, source, updated_at)
     VALUES (?, ?, ?, 'learned', ?)
     ON CONFLICT(profile_id, topic) DO UPDATE SET weight = excluded.weight, updated_at = excluded.updated_at`,
  );
  db.transaction(() => {
    for (const w of weights) stmt.run(profileId, w.topic, clampWeight(w.weight), ts);
    db.prepare("UPDATE interest_profiles SET updated_at = ? WHERE id = ?").run(ts, profileId);
  })();
}

/** Every topic any reader follows: ingestion only fetches feeds for these. */
export async function listFollowedTopics(): Promise<string[]> {
  const rows = getDb()
    .prepare("SELECT DISTINCT topic FROM profile_topics WHERE weight > 0")
    .all() as { topic: string }[];
  return rows.map((r) => r.topic);
}
