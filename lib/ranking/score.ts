import type { Article, InterestProfile } from "@/lib/db";
import { normalizeTitle } from "@/lib/ingestion/normalize";
import { topicLabel } from "@/lib/topics";

/**
 * Scores one article against a reader's profile. The score is a weighted sum
 * of simple, explainable parts. The same parts produce the "why this story"
 * line, so the ranking is never a black box.
 *
 *   score = 0.55·topic + 0.25·recency + keywords + quality
 */

export const SCORE_WEIGHTS = { topic: 0.55, recency: 0.25 } as const;
const UNFOLLOWED_TOPIC_WEIGHT = 0.1; // small chance for serendipity
const RECENCY_HALF_LIFE_HOURS = 18;
const KEYWORD_TITLE_BONUS = 0.2;
const KEYWORD_BODY_BONUS = 0.08;
const KEYWORD_CAP = 0.4;

export interface ScoreParts {
  topicWeight: number;
  recency: number; // 0..1, halves every RECENCY_HALF_LIFE_HOURS
  ageHours: number;
  keywordBonus: number;
  matchedKeywords: string[];
  quality: number;
}

export interface ScoredArticle {
  article: Article;
  score: number;
  parts: ScoreParts;
}

/** Returns null when the article must not appear (it matches an "avoid" term). */
export function scoreArticle(article: Article, profile: InterestProfile, nowMs = Date.now()): ScoredArticle | null {
  const title = ` ${normalizeTitle(article.title)} `;
  const body = ` ${normalizeTitle(`${article.excerpt ?? ""} ${(article.contentText ?? "").slice(0, 3000)}`)} `;

  const avoid = profile.preferences.avoid ?? [];
  if (avoid.some((term) => containsTerm(title, term) || containsTerm(body.slice(0, 600), term))) return null;

  const topicWeight =
    profile.topics.find((t) => t.topic === article.topic)?.weight ?? UNFOLLOWED_TOPIC_WEIGHT;

  const published = Date.parse(article.publishedAt ?? article.fetchedAt);
  const ageHours = Math.max(0, (nowMs - published) / 3_600_000);
  const recency = Math.pow(0.5, ageHours / RECENCY_HALF_LIFE_HOURS);

  const matchedKeywords: string[] = [];
  let keywordBonus = 0;
  for (const kw of profile.preferences.keywords ?? []) {
    if (containsTerm(title, kw)) {
      keywordBonus += KEYWORD_TITLE_BONUS;
      matchedKeywords.push(kw);
    } else if (containsTerm(body, kw)) {
      keywordBonus += KEYWORD_BODY_BONUS;
      matchedKeywords.push(kw);
    }
  }
  keywordBonus = Math.min(KEYWORD_CAP, keywordBonus);

  // Prefer stories we can actually summarize well.
  const textLen = article.contentText?.length ?? 0;
  const quality = (textLen > 800 ? 0.05 : textLen > 200 ? 0.02 : 0) + (article.imageUrl ? 0.02 : 0);

  const score = SCORE_WEIGHTS.topic * topicWeight + SCORE_WEIGHTS.recency * recency + keywordBonus + quality;
  return {
    article,
    score: Math.round(score * 1000) / 1000,
    parts: { topicWeight, recency, ageHours, keywordBonus, matchedKeywords, quality },
  };
}

/** Whole-word, case-insensitive match on already-normalized text. */
function containsTerm(normalizedText: string, term: string): boolean {
  const t = normalizeTitle(term);
  return t.length > 1 && normalizedText.includes(` ${t} `);
}

/** Word-set overlap between two titles (0..1). Used to drop near-duplicate stories. */
export function titleSimilarity(a: string, b: string): number {
  const stop = new Set(["the", "a", "an", "of", "in", "on", "to", "for", "and", "is", "as", "at", "with", "by"]);
  const words = (s: string) => new Set(normalizeTitle(s).split(" ").filter((w) => w.length > 2 && !stop.has(w)));
  const A = words(a);
  const B = words(b);
  if (A.size === 0 || B.size === 0) return 0;
  let shared = 0;
  for (const w of A) if (B.has(w)) shared++;
  return shared / Math.min(A.size, B.size);
}

/**
 * Plain-English reason the story was picked, built from the score parts.
 * The edition builder may let the LLM rephrase it, but this is the source of truth.
 */
export function explain(s: ScoredArticle, ctx: { isLead: boolean; topicRank: number }): string {
  const { parts, article } = s;
  const topic = topicLabel(article.topic ?? "");
  const reasons: string[] = [];

  if (parts.matchedKeywords.length) {
    reasons.push(`it mentions ${quoteList(parts.matchedKeywords.slice(0, 2))}, which you asked us to watch`);
  }
  if (parts.topicWeight >= 0.85) reasons.push(`${topic} is one of your favourite sections`);
  else if (parts.topicWeight >= 0.5) reasons.push(`you follow ${topic}`);
  else if (parts.topicWeight <= 0.1) reasons.push(`it's outside your usual sections, as a wildcard`);

  if (parts.ageHours < 6) reasons.push(`it broke ${parts.ageHours < 1 ? "within the hour" : `${Math.round(parts.ageHours)}h ago`}`);

  const lead = ctx.isLead
    ? "Leading today because it scored highest for you: "
    : ctx.topicRank === 0
      ? "Top of your " + topic + " section: "
      : "Picked because ";
  return lead + (reasons.length ? joinReasons(reasons) : `it's among the freshest ${topic} stories`) + ".";
}

function quoteList(items: string[]): string {
  return items.map((k) => `“${k}”`).join(" and ");
}

function joinReasons(r: string[]): string {
  return r.length === 1 ? r[0] : `${r.slice(0, -1).join(", ")} and ${r.at(-1)}`;
}
