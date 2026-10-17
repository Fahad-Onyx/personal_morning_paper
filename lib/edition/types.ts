import type { StoryLength } from "@/lib/db";

/** What the builder stores in `editions.layout`: how this reader's paper is presented. */
export type EditionLayout = {
  version: 1;
  mastheadName: string;
  leadArticleId: string;
  /** Section ids in print order (strongest interest first). */
  sectionOrder: string[];
  sectionLabels: Record<string, string>;
  storyLength: StoryLength;
  readingMinutes: number;
  storyCount: number;
  /** How many scored candidates the stories were chosen from. */
  candidates: number;
  summariesBy: "llm" | "mixed" | "extractive";
  llm: boolean;
  builtAt: string;
};

/** Today's date in the server's time zone as YYYY-MM-DD (the edition key). */
export function localDate(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
