import { z } from "zod";
import { db, type Article, type Edition } from "@/lib/db";
import { truncate } from "@/lib/ingestion/normalize";
import { llmJson } from "@/lib/llm";
import { sentences } from "./summarize";

/**
 * "3 things you learned today": three one-line takeaways from the edition.
 *
 * At build time they come from the front page (lead + top stories of the
 * strongest sections). After reading, the reader can refresh them from what
 * they actually engaged with: stories they opened, liked or spent time on.
 *
 * The LLM writes each takeaway as a single concrete fact. Without an LLM, we
 * pick the most fact-dense sentence of each story (numbers, names, length).
 */

export interface RecapItem {
  articleId: string;
  topic: string | null;
  title: string;
  fact: string;
}

export interface Recap {
  basis: "front-page" | "your-reading";
  via: "llm" | "extractive";
  items: RecapItem[];
  createdAt: string;
}

/** Most "fact-like" sentence among the first few: rewards numbers and proper nouns, prefers medium length. */
export function keyFact(article: Article): string {
  const candidates = sentences(article.contentText || article.excerpt || "").slice(0, 6);
  if (candidates.length === 0) return truncate(article.excerpt || article.title, 200);
  const score = (s: string) => {
    const digits = (s.match(/\d+/g) ?? []).length;
    const names = (s.slice(1).match(/\b[A-Z][a-z]+/g) ?? []).length;
    const lengthFit = s.length >= 60 && s.length <= 220 ? 1 : 0;
    return digits * 1.5 + names * 0.5 + lengthFit * 2;
  };
  const best = candidates.reduce((a, b) => (score(b) > score(a) ? b : a));
  return truncate(best, 220);
}

const LlmRecapSchema = z.object({
  takeaways: z.array(z.object({ id: z.string(), fact: z.string().min(10).max(240) })),
});

async function writeRecap(articles: Article[], basis: Recap["basis"]): Promise<Recap> {
  const llm = await llmJson({
    system:
      "You write the '3 things you learned today' box of a personal newspaper. " +
      "For each story, give ONE concrete, memorable fact from the text (a number, a decision, a finding). " +
      "One sentence, at most 25 words, no opinions, nothing that isn't in the text.",
    prompt: [
      'Return {"takeaways":[{"id","fact"}]} with exactly one entry per story.',
      ...articles.map((a) => `--- id: ${a.id}\nheadline: ${a.title}\ntext: ${(a.contentText || a.excerpt || "").slice(0, 2000)}`),
    ].join("\n\n"),
    schema: LlmRecapSchema,
    maxTokens: 800,
  });

  const facts = new Map(llm?.takeaways.map((t) => [t.id, t.fact.trim()]) ?? []);
  const items = articles.map((a) => ({
    articleId: a.id,
    topic: a.topic,
    title: a.title,
    fact: facts.get(a.id) ?? keyFact(a),
  }));
  return {
    basis,
    via: articles.every((a) => facts.has(a.id)) ? "llm" : "extractive",
    items,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Picks up to `n` items, preferring one per section (lead first), then tops
 * up with the next best stories if there are fewer sections than slots.
 */
function pickAcrossSections<T extends { section: string }>(ordered: T[], n: number, already: T[] = []): T[] {
  const picks = [...already];
  const sections = new Set(picks.map((p) => p.section));
  for (const o of ordered) {
    if (picks.length >= n) break;
    if (!picks.includes(o) && !sections.has(o.section)) {
      picks.push(o);
      sections.add(o.section);
    }
  }
  for (const o of ordered) {
    if (picks.length >= n) break;
    if (!picks.includes(o)) picks.push(o);
  }
  return picks;
}

/** Front-page recap: the lead plus the best story from each of the next sections. */
export async function buildFrontPageRecap(ordered: { article: Article; section: string }[]): Promise<Recap | null> {
  const picks = pickAcrossSections(ordered, 3).map((o) => o.article);
  return picks.length ? writeRecap(picks, "front-page") : null;
}

/**
 * Recap from the reader's own engagement with this edition: likes count most,
 * then opening the original, then time on the page. Tops up from the front
 * page if they engaged with fewer than three stories.
 */
export async function buildReadingRecap(edition: Edition): Promise<Recap | null> {
  const items = await db.editions.listEditionItems(edition.id);
  const engagement = new Map<string, number>();
  for (const e of await db.events.listEventsForEdition(edition.id)) {
    if (!e.articleId) continue;
    // A like/dislike with value 0 is the reader clearing it, so it cancels the earlier one.
    const cleared = e.value === 0;
    const add = {
      like: cleared ? -3 : 3,
      dislike: cleared ? 5 : -5,
      click: 2,
      dwell: Math.min(2, (e.value ?? 0) / 30_000),
      skip: -5,
    }[e.type];
    engagement.set(e.articleId, (engagement.get(e.articleId) ?? 0) + add);
  }

  const read = items
    .filter((it) => (engagement.get(it.articleId) ?? 0) > 0.5)
    .sort((a, b) => engagement.get(b.articleId)! - engagement.get(a.articleId)!)
    .slice(0, 3);
  // Top up from the front page, leaving out stories the reader rejected.
  const candidates = items.filter((it) => (engagement.get(it.articleId) ?? 0) >= 0);
  const ids = pickAcrossSections(candidates, 3, read).map((it) => it.articleId);

  const articles = (await Promise.all(ids.map((id) => db.articles.getArticle(id)))).filter((a): a is Article => a !== null);
  if (articles.length === 0) return null;
  const recap = await writeRecap(articles, read.length > 0 ? "your-reading" : "front-page");
  await db.editions.setRecap(edition.id, recap);
  return recap;
}
