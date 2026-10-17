/**
 * Unit checks for the pure logic behind the paper: profile parsing, URL
 * canonicalization, sentence splitting, scoring and learning.
 * Usage: npm run logic:check
 */
import assert from "node:assert/strict";
import type { Article, InterestProfile } from "@/lib/db";
import { keyFact } from "@/lib/edition/recap";
import { sentences } from "@/lib/edition/summarize";
import { canonicalUrl, contentHash } from "@/lib/ingestion/normalize";
import { computeWeights } from "@/lib/learning/update";
import { heuristicProfile } from "@/lib/profile/build";
import { scoreArticle, titleSimilarity } from "@/lib/ranking/score";

const now = new Date().toISOString();

// Profile: picked cards, mentions and avoid phrases.
const p = heuristicProfile({
  name: "T",
  topics: [{ id: "ai", level: 2 }],
  freeText: "Pakistan cricket and the PSL, but not crypto. No celebrity gossip.",
  storyLength: "brief",
  readingMinutes: 10,
});
assert.equal(p.topics[0].topic, "ai");
assert.ok(p.topics.some((t) => t.topic === "sports"), "cricket mention adds Sports");
assert.ok(!p.topics.some((t) => t.topic === "culture"), "avoided phrases don't add topics");
assert.deepEqual(p.avoid.sort(), ["celebrity gossip", "crypto"]);

// Dedupe helpers.
assert.equal(canonicalUrl("https://WWW.Example.com/a/?utm_source=rss&id=2#top"), "https://example.com/a?id=2");
assert.equal(contentHash("Big AI news!"), contentHash("big ai NEWS"));
assert.ok(titleSimilarity("Rocket lands for record 30th time", "Booster lands for a record 30th time") > 0.6);

// Sentences: decimals and abbreviations don't split.
assert.equal(sentences("Prices rose 3.5 percent in the U.S. economy last month. The central bank kept its rate unchanged today.").length, 2);

// Scoring: avoid list removes stories; keywords and topic weight raise them.
const profile: InterestProfile = {
  id: "p", userId: "u", rawInput: null, summary: null, createdAt: now, updatedAt: now,
  preferences: { keywords: ["psl"], avoid: ["crypto"] },
  topics: [
    { topic: "sports", weight: 0.9, baseWeight: 0.6, source: "onboarding", updatedAt: now },
    { topic: "business", weight: 0.3, baseWeight: 0.3, source: "onboarding", updatedAt: now },
  ],
};
const art = (title: string, topic: string): Article => ({
  id: title, url: `https://x/${title}`, contentHash: null, title, source: "S", author: null, topic,
  excerpt: null, contentText: null, imageUrl: null, publishedAt: now, fetchedAt: now,
});
assert.equal(scoreArticle(art("Crypto exchange rules tightened", "business"), profile), null);
const psl = scoreArticle(art("PSL draft opens", "sports"), profile)!;
const biz = scoreArticle(art("Rates held steady", "business"), profile)!;
assert.ok(psl.score > biz.score);
assert.deepEqual(psl.parts.matchedKeywords, ["psl"]);
assert.ok(psl.parts.learnedShift > 0.25);

// Learning: positive signal raises, negative lowers, bounded by ±0.35, new topics appear.
const learned = computeWeights(profile, [
  { topic: "sports", value: 5 },
  { topic: "business", value: -5 },
  { topic: "space", value: 1 },
]);
const w = (t: string) => learned.changes.find((c) => c.topic === t)!.after;
assert.ok(w("sports") > 0.6 && w("sports") <= 0.95);
assert.ok(w("business") >= 0 && w("business") < 0.3);
assert.ok(w("space") > 0 && w("space") < 0.35);
// Recomputed from base, so the same signals always give the same weights.
assert.equal(computeWeights(profile, [{ topic: "sports", value: 5 }]).changes[0].after, w("sports"));

// Recap fallback picks the most fact-dense sentence.
const factArticle = {
  ...art("Satellite launch", "space"),
  contentText:
    "Officials were pleased with how the day went for everyone involved here. " +
    "The satellite reached orbit 17 minutes after lift-off and sent signals to Karachi within 2 hours.",
};
assert.match(keyFact(factArticle), /17 minutes/);

console.log("✅ logic checks passed");
