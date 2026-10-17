import { db, type InterestProfile, type ReaderEvent } from "@/lib/db";

/**
 * The learning loop. Before each edition is built, the reader's recent
 * behaviour is turned into a per-topic signal, and each topic weight becomes
 *
 *   weight = clamp( baseWeight + RATE · tanh(signal / SOFTNESS), 0, 1 )
 *
 * - baseWeight is what the reader told us at onboarding (0 for new topics).
 * - signal is the sum of event values, each multiplied by a time decay that
 *   halves every HALF_LIFE_DAYS, so last week matters more than last month.
 * - tanh keeps one enthusiastic day from swamping the profile: learning can
 *   move a topic by at most ±RATE.
 *
 * Because it's recomputed from the base each time (not added on top of the
 * previous weight), running it twice gives the same answer.
 */

export const EVENT_VALUES = {
  click: 0.6, // opened the original article
  like: 1.0,
  dislike: -1.0,
  skip: -0.6,
  dwellPerMinute: 0.5, // reading time on the page, capped below
} as const;
const DWELL_CAP = 0.5;
export const HALF_LIFE_DAYS = 5;
const LOOKBACK_DAYS = 30;
const RATE = 0.35;
const SOFTNESS = 2;

export interface TopicChange {
  topic: string;
  before: number;
  after: number;
  base: number;
  signal: number;
  events: number;
}

export interface LearningResult {
  changes: TopicChange[];
  eventsConsidered: number;
  ranAt: string;
}

/** Collapses raw events into one net value per article (and its topic). */
function articleSignals(events: (ReaderEvent & { topic: string | null })[], nowMs: number) {
  type Acc = { topic: string; reaction: number; click: boolean; skip: boolean; dwellMs: number; latestMs: number };
  const byArticle = new Map<string, Acc>();

  for (const e of events) {
    if (!e.articleId || !e.topic) continue;
    const acc =
      byArticle.get(e.articleId) ??
      byArticle.set(e.articleId, { topic: e.topic, reaction: 0, click: false, skip: false, dwellMs: 0, latestMs: 0 }).get(e.articleId)!;
    acc.latestMs = Math.max(acc.latestMs, Date.parse(e.createdAt));
    if (e.type === "click") acc.click = true; // several clicks on one story count once
    if (e.type === "skip") acc.skip = true;
    if (e.type === "dwell") acc.dwellMs += e.value ?? 0;
    // Like/dislike is a toggle: the latest event wins, value 0 means "cleared".
    if (e.type === "like") acc.reaction = e.value === 0 ? 0 : EVENT_VALUES.like;
    if (e.type === "dislike") acc.reaction = e.value === 0 ? 0 : EVENT_VALUES.dislike;
  }

  return [...byArticle.values()].map((a) => {
    const raw =
      a.reaction +
      (a.click ? EVENT_VALUES.click : 0) +
      (a.skip ? EVENT_VALUES.skip : 0) +
      Math.min(DWELL_CAP, (a.dwellMs / 60_000) * EVENT_VALUES.dwellPerMinute);
    const ageDays = (nowMs - a.latestMs) / 86_400_000;
    return { topic: a.topic, value: raw * Math.pow(0.5, ageDays / HALF_LIFE_DAYS) };
  });
}

export async function applyLearning(userId: string): Promise<LearningResult | null> {
  const profile = await db.profiles.getProfileByUser(userId);
  if (!profile) return null;

  const nowMs = Date.now();
  const events = await db.events.listEventsWithTopicSince(userId, new Date(nowMs - LOOKBACK_DAYS * 86_400_000).toISOString());
  const result = computeWeights(profile, articleSignals(events, nowMs));
  result.eventsConsidered = events.length;

  const changed = result.changes.filter((c) => Math.abs(c.after - c.before) >= 0.005);
  if (changed.length) await db.profiles.setTopicWeights(profile.id, changed.map((c) => ({ topic: c.topic, weight: c.after })));
  await db.meta.setMeta(`learning:${userId}`, result);
  return result;
}

/** Pure function so it's easy to test and to explain. */
export function computeWeights(profile: InterestProfile, signals: { topic: string; value: number }[]): LearningResult {
  const perTopic = new Map<string, { signal: number; events: number }>();
  for (const s of signals) {
    const t = perTopic.get(s.topic) ?? { signal: 0, events: 0 };
    perTopic.set(s.topic, { signal: t.signal + s.value, events: t.events + 1 });
  }

  const topics = new Set([...profile.topics.map((t) => t.topic), ...perTopic.keys()]);
  const changes: TopicChange[] = [];
  for (const topic of topics) {
    const current = profile.topics.find((t) => t.topic === topic);
    const base = current?.baseWeight ?? 0;
    const { signal, events } = perTopic.get(topic) ?? { signal: 0, events: 0 };
    const after = round(Math.min(1, Math.max(0, base + RATE * Math.tanh(signal / SOFTNESS))));
    changes.push({ topic, before: round(current?.weight ?? 0), after, base: round(base), signal: round(signal), events });
  }
  changes.sort((a, b) => Math.abs(b.after - b.before) - Math.abs(a.after - a.before));
  return { changes, eventsConsidered: 0, ranAt: new Date().toISOString() };
}

const round = (n: number) => Math.round(n * 1000) / 1000;
