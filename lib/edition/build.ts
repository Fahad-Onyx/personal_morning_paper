import { db, type Edition, type InterestProfile, type NewEditionItem, type StoryLength, type User } from "@/lib/db";
import { applyLearning } from "@/lib/learning/update";
import { llmEnabled } from "@/lib/llm";
import { explain, scoreArticle, titleSimilarity, type ScoredArticle } from "@/lib/ranking/score";
import { topicLabel } from "@/lib/topics";
import { summarizeAll } from "./summarize";
import { localDate, type EditionLayout } from "./types";

/**
 * Builds one reader's edition for a date:
 *
 *   candidates → score → filter (avoid, already printed, skipped)
 *   → pick stories (diversity + per-section caps) → lead + section order
 *   → story lengths → summaries + "why this story" → save
 *
 * Presentation is personalized too: section order follows the reader's
 * weights, story lengths follow their reading style, and the number of
 * stories follows their time budget.
 */

export class EditionError extends Error {
  constructor(
    public code: "no_profile" | "no_articles",
    message: string,
  ) {
    super(message);
  }
}

// Minutes a reader spends per story at each length; sizes the edition.
const MINUTES_PER_STORY: Record<StoryLength, number> = { brief: 0.75, standard: 1.5, long: 3 };
const MIN_STORIES = 5;
const MAX_STORIES = 24;
const NEAR_DUPLICATE = 0.6; // title overlap above this = same story from another outlet
const SAME_SOURCE_DECAY = 0.85; // each extra story from one outlet counts a bit less
const MAX_WILDCARDS = 2; // stories from topics the reader doesn't follow, for serendipity
export const WILDCARD_SECTION = "wildcard";

export async function buildEdition(user: User, opts: { date?: string } = {}): Promise<Edition> {
  // Learning loop first: fold recent clicks, skips, likes and dwell into the topic weights.
  const learning = await applyLearning(user.id);
  const profile = await db.profiles.getProfileByUser(user.id);
  if (!profile) throw new EditionError("no_profile", "Finish onboarding first.");

  const date = opts.date ?? localDate();
  const scored = await rankCandidates(user, profile, date);
  if (scored.length === 0) {
    throw new EditionError("no_articles", "No fresh stories yet. Fetch the news, then print again.");
  }

  const prefLength = profile.preferences.storyLength ?? "standard";
  const minutes = profile.preferences.readingMinutes ?? 15;
  const target = clamp(Math.round(minutes / MINUTES_PER_STORY[prefLength]), MIN_STORIES, MAX_STORIES);

  const picked = pickStories(scored, profile, target);
  const lead = picked[0];

  // Sections: the reader's topics in weight order; stories from topics they
  // don't follow are grouped last under "Off your beat".
  const weightOf = (topic: string) => profile.topics.find((t) => t.topic === topic)?.weight ?? 0;
  const sectionOf = (s: ScoredArticle) => {
    const topic = s.article.topic ?? "";
    return weightOf(topic) > 0 ? topic : WILDCARD_SECTION;
  };
  const sectionOrder = [...new Set(picked.slice(1).map(sectionOf))].sort((a, b) => weightOf(b) - weightOf(a));

  // Order inside the paper: lead first, then each section's stories by score.
  const bySection = new Map<string, ScoredArticle[]>();
  for (const s of picked.slice(1)) {
    const key = sectionOf(s);
    bySection.set(key, [...(bySection.get(key) ?? []), s]);
  }
  const ordered: { s: ScoredArticle; section: string; isLead: boolean; topicRank: number }[] = [
    { s: lead, section: sectionOf(lead), isLead: true, topicRank: 0 },
    ...sectionOrder.flatMap((section) => bySection.get(section)!.map((s, topicRank) => ({ s, section, isLead: false, topicRank }))),
  ];

  const withLength = ordered.map((o) => ({ ...o, length: storyLength(o, prefLength, weightOf(o.section)) }));
  const { summaries, llmCount } = await summarizeAll(withLength.map((o) => ({ article: o.s.article, length: o.length })));

  const items: NewEditionItem[] = withLength.map((o, position) => ({
    articleId: o.s.article.id,
    section: o.section,
    position,
    isLead: o.isLead,
    length: o.length,
    score: o.s.score,
    summary: summaries.get(o.s.article.id) ?? null,
    whyThisStory: explain(o.s, { isLead: o.isLead, topicRank: o.topicRank }),
  }));

  const layout: EditionLayout = {
    version: 1,
    mastheadName: user.name,
    leadArticleId: lead.article.id,
    sectionOrder,
    sectionLabels: Object.fromEntries(
      sectionOrder.map((s) => [s, s === WILDCARD_SECTION ? "Off your beat" : topicLabel(s)]),
    ),
    storyLength: prefLength,
    readingMinutes: minutes,
    storyCount: items.length,
    candidates: scored.length,
    summariesBy: llmCount === items.length ? "llm" : llmCount > 0 ? "mixed" : "extractive",
    llm: llmEnabled(),
    builtAt: new Date().toISOString(),
    learning: (learning?.changes ?? [])
      .filter((c) => Math.abs(c.after - c.before) >= 0.01)
      .slice(0, 6)
      .map(({ topic, before, after, events }) => ({ topic, before, after, events })),
  };

  return db.editions.saveEdition({ userId: user.id, editionDate: date, layout, items });
}

/** Scores the candidate pool and removes what this reader shouldn't see again. */
async function rankCandidates(user: User, profile: InterestProfile, date: string): Promise<ScoredArticle[]> {
  const printed = await db.editions.listPrintedArticleIds(user.id, date);
  const rejected = new Set(
    (await db.events.listEventsSince(user.id, daysAgo(30)))
      .filter((e) => e.type === "skip" || e.type === "dislike")
      .map((e) => e.articleId),
  );

  // Prefer the last two days; widen to a week if the pool is thin.
  let pool = await db.articles.listRecentArticles(daysAgo(2));
  if (pool.length < MAX_STORIES) pool = await db.articles.listRecentArticles(daysAgo(7));

  const now = Date.now();
  return pool
    .filter((a) => !printed.has(a.id) && !rejected.has(a.id))
    .map((a) => scoreArticle(a, profile, now))
    .filter((s): s is ScoredArticle => s !== null)
    .sort((a, b) => b.score - a.score);
}

/**
 * Greedy pick with three guards:
 * - drop near-duplicate headlines (same story, different outlet)
 * - each extra story from the same outlet scores a little less
 * - each section gets a share of slots proportional to its weight
 */
function pickStories(scored: ScoredArticle[], profile: InterestProfile, target: number): ScoredArticle[] {
  const totalWeight = profile.topics.reduce((n, t) => n + t.weight, 0) || 1;
  const capFor = (topic: string) => {
    const w = profile.topics.find((t) => t.topic === topic)?.weight ?? 0;
    return Math.max(1, Math.ceil((target * w) / totalWeight) + 1);
  };

  const follows = (topic: string | null) => profile.topics.some((t) => t.topic === topic && t.weight > 0);
  const picked: ScoredArticle[] = [];
  const perSource = new Map<string, number>();
  const perTopic = new Map<string, number>();
  // A short paper beats one padded with things the reader never asked for.
  let wildcards = 0;
  let remaining = [...scored];

  while (picked.length < target && remaining.length > 0) {
    // Re-rank with the outlet penalty for what's already picked.
    const adjusted = remaining
      .map((s) => ({ s, adj: s.score * Math.pow(SAME_SOURCE_DECAY, perSource.get(s.article.source) ?? 0) }))
      .sort((a, b) => b.adj - a.adj);

    const allowed = adjusted.filter(({ s }) => follows(s.article.topic) || wildcards < MAX_WILDCARDS);
    if (allowed.length === 0) break;
    const next = allowed.find(({ s }) => (perTopic.get(s.article.topic ?? "") ?? 0) < capFor(s.article.topic ?? ""));
    // Every section is full: relax the caps rather than print a thin paper.
    const choice = (next ?? allowed[0]).s;
    if (!follows(choice.article.topic)) wildcards++;

    picked.push(choice);
    perSource.set(choice.article.source, (perSource.get(choice.article.source) ?? 0) + 1);
    perTopic.set(choice.article.topic ?? "", (perTopic.get(choice.article.topic ?? "") ?? 0) + 1);
    remaining = remaining.filter(
      (s) => s !== choice && titleSimilarity(s.article.title, choice.article.title) < NEAR_DUPLICATE,
    );
  }
  return picked;
}

/**
 * Story length. The lead always runs long. The top story of a strong section
 * gets one step longer than the reader's default; weak sections run as briefs.
 */
function storyLength(
  o: { isLead: boolean; topicRank: number },
  pref: StoryLength,
  sectionWeight: number,
): StoryLength {
  if (o.isLead) return "long";
  const steps: StoryLength[] = ["brief", "standard", "long"];
  let i = steps.indexOf(pref);
  if (o.topicRank === 0 && sectionWeight >= 0.7) i += 1;
  else if (sectionWeight < 0.4 || o.topicRank >= 3) i -= 1;
  return steps[clamp(i, 0, 2)];
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();
