/**
 * Smoke test for the data-access layer. Runs against a throwaway database
 * file, exercises every repository, and deletes the file afterwards.
 * Usage: npm run db:check
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tmp = path.join(os.tmpdir(), `pmp-check-${Date.now()}.db`);
process.env.DATABASE_PATH = tmp; // must be set before the DB is first opened

async function main() {
  const { db, getStats } = await import("@/lib/db");

  const user = await db.users.createUser({ name: "Demo Reader" });
  assert.equal((await db.users.getUser(user.id))?.name, "Demo Reader");

  const profile = await db.profiles.upsertProfile({
    userId: user.id,
    rawInput: "I love AI and cricket",
    summary: "Tech-curious sports fan",
    preferences: { storyLength: "standard" },
    topics: [
      { topic: "ai", weight: 0.9 },
      { topic: "cricket", weight: 0.7 },
    ],
  });
  assert.equal(profile.topics.length, 2);
  assert.equal(profile.topics[0].topic, "ai"); // sorted by weight

  await db.profiles.setTopicWeights(profile.id, [
    { topic: "cricket", weight: 1.4 }, // should clamp to 1
    { topic: "space", weight: 0.3 }, // new learned topic
  ]);
  const learned = await db.profiles.getProfileByUser(user.id);
  assert.equal(learned?.topics.find((t) => t.topic === "cricket")?.weight, 1);
  assert.equal(learned?.topics.find((t) => t.topic === "space")?.source, "learned");

  const base = {
    contentHash: "h1",
    title: "A story",
    source: "Example News",
    author: null,
    topic: "ai",
    excerpt: null,
    contentText: null,
    imageUrl: null,
    publishedAt: new Date().toISOString(),
  };
  const a1 = await db.articles.insertArticleIfNew({ ...base, url: "https://example.com/a" });
  assert.ok(a1.inserted);
  const dupUrl = await db.articles.insertArticleIfNew({ ...base, url: "https://example.com/a", contentHash: "other" });
  assert.ok(!dupUrl.inserted, "same URL is a duplicate");
  const dupHash = await db.articles.insertArticleIfNew({ ...base, url: "https://example.com/b" });
  assert.ok(!dupHash.inserted, "same content hash is a duplicate");
  const recent = await db.articles.listRecentArticles(new Date(Date.now() - 86_400_000).toISOString());
  assert.equal(recent.length, 1);

  const item = {
    articleId: a1.article.id,
    section: "Technology",
    position: 0,
    isLead: true,
    length: "long" as const,
    score: 0.92,
    summary: "Summary",
    whyThisStory: "You follow AI",
  };
  const ed = await db.editions.saveEdition({ userId: user.id, editionDate: "2026-10-17", layout: { sections: ["Technology"] }, items: [item] });
  const rebuilt = await db.editions.saveEdition({ userId: user.id, editionDate: "2026-10-17", layout: {}, items: [item] });
  assert.notEqual(ed.id, rebuilt.id);
  assert.equal((await db.editions.listEditions(user.id)).length, 1, "rebuilding replaces the day's edition");
  const items = await db.editions.listEditionItems(rebuilt.id);
  assert.equal(items[0].isLead, true);

  await db.events.logEvent({ userId: user.id, articleId: a1.article.id, editionId: rebuilt.id, type: "dwell", value: 42000 });
  assert.equal((await db.events.listEventsSince(user.id, "2000-01-01")).length, 1);

  console.table(await getStats());
  console.log("✅ data-access layer OK");
}

main()
  .catch((err) => {
    console.error("❌ db:check failed:", err);
    process.exitCode = 1;
  })
  .finally(() => {
    for (const suffix of ["", "-wal", "-shm"]) fs.rmSync(tmp + suffix, { force: true });
  });
