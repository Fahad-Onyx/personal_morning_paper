import { z } from "zod";
import { llmJson } from "@/lib/llm";
import { TOPICS, TOPIC_IDS, topicLabel } from "@/lib/topics";
import type { StoryLength } from "@/lib/db";

/**
 * Turns raw onboarding answers into a structured interest profile.
 *
 * 1. A baseline is always computed deterministically: picked cards give
 *    weights by enthusiasm, and catalogue keywords found in the free text
 *    add or boost topics.
 * 2. If an LLM is configured, it reads the free text and refines the weights,
 *    pulls out specific keywords to boost and things to avoid, and writes a
 *    one-line summary. Its output is validated and restricted to known topics.
 * 3. If the LLM is unavailable or fails, the baseline is used as-is.
 */

export const OnboardingInputSchema = z.object({
  name: z.string().trim().min(1).max(40),
  topics: z
    .array(z.object({ id: z.enum(TOPIC_IDS as [string, ...string[]]), level: z.union([z.literal(1), z.literal(2)]) }))
    .max(TOPICS.length),
  freeText: z.string().trim().max(1000).default(""),
  storyLength: z.enum(["brief", "standard", "long"]),
  readingMinutes: z.number().int().min(5).max(60),
});
export type OnboardingInput = z.infer<typeof OnboardingInputSchema>;

export interface BuiltProfile {
  summary: string;
  topics: { topic: string; weight: number }[];
  keywords: string[];
  avoid: string[];
  storyLength: StoryLength;
  readingMinutes: number;
  /** Which path produced this profile, shown on the reveal screen. */
  via: "llm" | "heuristic";
}

// Picked once = interested, picked twice = "love it".
const LEVEL_WEIGHT = { 1: 0.6, 2: 0.9 } as const;
const MENTION_BOOST = 0.15;
const MENTION_ONLY_WEIGHT = 0.55;

const round = (n: number) => Math.round(n * 100) / 100;

export function heuristicProfile(input: OnboardingInput): BuiltProfile {
  const weights = new Map<string, number>();
  for (const t of input.topics) weights.set(t.id, LEVEL_WEIGHT[t.level]);

  // "not interested in X", "but not X", "no X", "avoid X", "hate X" → avoid list.
  const raw = ` ${input.freeText.toLowerCase()} `;
  const AVOID_RE =
    /\b(?:not interested in|don't care about|not into|avoid|hate|skip|not|no)\s+([a-z0-9][a-z0-9 \-]{1,30}?)(?=[,.;!?]|\s+and\s|\s*$)/g;
  const avoid = [...raw.matchAll(AVOID_RE)].map((m) => m[1].trim()).slice(0, 5);
  // Remove the avoided phrases so "no celebrity gossip" doesn't boost Culture.
  const text = raw.replace(AVOID_RE, " ");

  const keywords = new Set<string>();
  for (const topic of TOPICS) {
    const hits = topic.keywords.filter((k) => new RegExp(`\\b${escapeRe(k)}\\b`).test(text));
    if (hits.length === 0) continue;
    const current = weights.get(topic.id);
    weights.set(topic.id, current ? Math.min(1, current + MENTION_BOOST) : MENTION_ONLY_WEIGHT);
    // Keep the specific words (not the generic topic name) as boost keywords.
    hits.filter((h) => h !== topic.id && h !== topic.label.toLowerCase()).forEach((h) => keywords.add(h));
  }

  const topics = [...weights.entries()]
    .map(([topic, weight]) => ({ topic, weight: round(weight) }))
    .sort((a, b) => b.weight - a.weight);

  return {
    summary: describe(input.name, topics, input.storyLength),
    topics,
    keywords: [...keywords].slice(0, 12),
    avoid,
    storyLength: input.storyLength,
    readingMinutes: input.readingMinutes,
    via: "heuristic",
  };
}

const LlmProfileSchema = z.object({
  summary: z.string().min(5).max(300),
  topics: z.array(z.object({ topic: z.string(), weight: z.number().min(0).max(1) })).min(1).max(15),
  keywords: z.array(z.string().min(2).max(40)).max(15),
  avoid: z.array(z.string().min(2).max(40)).max(10),
});

export async function buildProfile(input: OnboardingInput): Promise<BuiltProfile> {
  const baseline = heuristicProfile(input);
  // Nothing written → nothing for the LLM to interpret.
  if (!input.freeText) return baseline;

  const llm = await llmJson({
    system:
      "You build reader interest profiles for a personalized daily newspaper. " +
      `Allowed topic ids: ${TOPIC_IDS.join(", ")}. Never invent topic ids.`,
    prompt: [
      `Reader name: ${input.name}`,
      `Topics they picked (level 2 = loves it): ${JSON.stringify(input.topics)}`,
      `Baseline weights: ${JSON.stringify(baseline.topics)}`,
      `In their own words: """${input.freeText}"""`,
      "",
      "Return {summary, topics:[{topic, weight 0-1}], keywords:[...], avoid:[...]}.",
      "- Keep every picked topic; adjust weights using what they wrote; add topics their text clearly implies.",
      "- keywords: specific people, teams, companies, products, places or subjects to boost (lowercase).",
      "- avoid: things they say they don't want (lowercase).",
      "- summary: one warm sentence in second person describing their paper.",
    ].join("\n"),
    schema: LlmProfileSchema,
  });
  if (!llm) return baseline;

  // Trust but verify: drop unknown topics and make sure picked ones survive.
  const known = new Map<string, number>();
  for (const t of llm.topics) if (TOPIC_IDS.includes(t.topic)) known.set(t.topic, round(t.weight));
  for (const t of baseline.topics) if (!known.has(t.topic)) known.set(t.topic, t.weight);

  return {
    ...baseline,
    summary: llm.summary,
    topics: [...known.entries()].map(([topic, weight]) => ({ topic, weight })).sort((a, b) => b.weight - a.weight),
    keywords: dedupeLower([...llm.keywords, ...baseline.keywords]).slice(0, 15),
    avoid: dedupeLower([...llm.avoid, ...baseline.avoid]).slice(0, 10),
    via: "llm",
  };
}

function describe(name: string, topics: { topic: string }[], length: StoryLength): string {
  const top = topics.slice(0, 3).map((t) => topicLabel(t.topic));
  const style = { brief: "quick briefs", standard: "a balanced read", long: "deeper reads" }[length];
  if (top.length === 0) return `${name}, your paper starts broad and will learn what you like as you read.`;
  const list = top.length > 1 ? `${top.slice(0, -1).join(", ")} and ${top.at(-1)}` : top[0];
  return `${name}, your paper leads with ${list}, written as ${style}.`;
}

function dedupeLower(items: string[]): string[] {
  return [...new Set(items.map((s) => s.toLowerCase().trim()).filter(Boolean))];
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
