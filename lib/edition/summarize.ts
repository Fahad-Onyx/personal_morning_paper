import { z } from "zod";
import type { Article, StoryLength } from "@/lib/db";
import { mapLimit, truncate } from "@/lib/ingestion/normalize";
import { llmJson } from "@/lib/llm";

/**
 * Story summaries, sized by the story's length slot.
 * The LLM writes them in batches; any story it misses (or every story, when
 * the LLM is off or fails) gets an extractive summary: the article's own
 * leading sentences.
 */

const TARGET_WORDS: Record<StoryLength, number> = { brief: 35, standard: 75, long: 140 };
const EXTRACT_SENTENCES: Record<StoryLength, number> = { brief: 1, standard: 2, long: 4 };
const EXTRACT_CHARS: Record<StoryLength, number> = { brief: 240, standard: 460, long: 900 };
const BATCH_SIZE = 6;
const SOURCE_CHARS = 2500;

export interface SummaryRequest {
  article: Article;
  length: StoryLength;
}

/** Splits text into sentences and drops fragments like bylines and captions. */
export function sentences(text: string): string[] {
  return (text.match(/[^.!?]+[.!?]+["”’)]?(\s|$)|[^.!?]+$/g) ?? [])
    .map((s) => s.trim())
    .filter((s) => s.length >= 40 && s.split(" ").length >= 6);
}

export function extractiveSummary(article: Article, length: StoryLength): string {
  const source = article.contentText || article.excerpt || "";
  const picked = sentences(source).slice(0, EXTRACT_SENTENCES[length]).join(" ");
  return truncate(picked || article.excerpt || article.title, EXTRACT_CHARS[length]);
}

const BatchSchema = z.object({
  summaries: z.array(z.object({ id: z.string(), summary: z.string().min(10).max(1500) })),
});

export async function summarizeAll(reqs: SummaryRequest[]): Promise<{ summaries: Map<string, string>; llmCount: number }> {
  const summaries = new Map<string, string>();
  const batches: SummaryRequest[][] = [];
  for (let i = 0; i < reqs.length; i += BATCH_SIZE) batches.push(reqs.slice(i, i + BATCH_SIZE));

  await mapLimit(batches, 3, async (batch) => {
    const out = await llmJson({
      system:
        "You are a newspaper sub-editor. Summarize each story faithfully using only the text provided. " +
        "Plain, neutral newspaper English. No hype, no opinions, no facts that aren't in the source.",
      prompt: [
        'Return {"summaries":[{"id","summary"}]} with one entry per story.',
        ...batch.map((r) =>
          [
            `--- id: ${r.article.id}`,
            `target length: about ${TARGET_WORDS[r.length]} words`,
            `headline: ${r.article.title}`,
            `text: ${(r.article.contentText || r.article.excerpt || "").slice(0, SOURCE_CHARS)}`,
          ].join("\n"),
        ),
      ].join("\n\n"),
      schema: BatchSchema,
      maxTokens: 2500,
    });
    for (const s of out?.summaries ?? []) {
      if (batch.some((r) => r.article.id === s.id)) summaries.set(s.id, s.summary.trim());
    }
  });

  const llmCount = summaries.size;
  for (const r of reqs) {
    if (!summaries.has(r.article.id)) summaries.set(r.article.id, extractiveSummary(r.article, r.length));
  }
  return { summaries, llmCount };
}
