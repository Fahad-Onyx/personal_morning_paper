import { db, type Article, type Edition, type EditionItem } from "@/lib/db";
import { topicLabel } from "@/lib/topics";
import type { EditionLayout } from "./types";

/**
 * Everything a page (or the PDF template) needs to render one edition,
 * assembled in one place so the web reader and the PDF stay identical.
 */
export interface StoryView {
  item: EditionItem;
  article: Article;
  /** Reader's current reaction, from their events on this edition. */
  reaction: "like" | "dislike" | null;
  skipped: boolean;
}

export interface SectionView {
  id: string;
  label: string;
  stories: StoryView[];
}

export interface EditionView {
  edition: Edition;
  layout: EditionLayout;
  lead: StoryView;
  sections: SectionView[];
  /** 1-based issue number for this reader ("No. 3"). */
  issueNumber: number;
  readMinutes: number;
}

const WORDS_PER_MINUTE = 230;

export async function loadEditionView(edition: Edition): Promise<EditionView | null> {
  const items = await db.editions.listEditionItems(edition.id);
  if (items.length === 0) return null;

  const articles = new Map<string, Article>();
  for (const it of items) {
    const a = await db.articles.getArticle(it.articleId);
    if (a) articles.set(a.id, a);
  }

  // Replay this edition's events: the latest like/dislike wins; skips persist.
  const reactions = new Map<string, "like" | "dislike" | null>();
  const skipped = new Set<string>();
  for (const e of await db.events.listEventsForEdition(edition.id)) {
    if (!e.articleId) continue;
    if (e.type === "like" || e.type === "dislike") reactions.set(e.articleId, e.value === 0 ? null : e.type);
    if (e.type === "skip") skipped.add(e.articleId);
  }

  const stories: StoryView[] = items
    .filter((it) => articles.has(it.articleId))
    .map((item) => ({
      item,
      article: articles.get(item.articleId)!,
      reaction: reactions.get(item.articleId) ?? null,
      skipped: skipped.has(item.articleId),
    }));

  const lead = stories.find((s) => s.item.isLead) ?? stories[0];
  const layout = edition.layout as unknown as EditionLayout;
  const order = layout.sectionOrder ?? [];

  const sections: SectionView[] = [];
  for (const s of stories) {
    if (s === lead) continue;
    let section = sections.find((x) => x.id === s.item.section);
    if (!section) {
      section = { id: s.item.section, label: layout.sectionLabels?.[s.item.section] ?? topicLabel(s.item.section), stories: [] };
      sections.push(section);
    }
    section.stories.push(s);
  }
  sections.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

  const words = stories.reduce((n, s) => n + (s.item.summary ?? "").split(/\s+/).length + 12, 0);
  const all = await db.editions.listEditions(edition.userId, 1000);
  const issueNumber = all.filter((e) => e.editionDate <= edition.editionDate).length;

  return {
    edition,
    layout,
    lead,
    sections,
    issueNumber,
    readMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
  };
}
