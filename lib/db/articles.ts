import { getDb } from "./client";
import type { Article, NewArticle } from "./types";
import { newId, now } from "./util";

type ArticleRow = {
  id: string;
  url: string;
  content_hash: string | null;
  title: string;
  source: string;
  author: string | null;
  topic: string | null;
  excerpt: string | null;
  content_text: string | null;
  image_url: string | null;
  published_at: string | null;
  fetched_at: string;
};

const toArticle = (r: ArticleRow): Article => ({
  id: r.id,
  url: r.url,
  contentHash: r.content_hash,
  title: r.title,
  source: r.source,
  author: r.author,
  topic: r.topic,
  excerpt: r.excerpt,
  contentText: r.content_text,
  imageUrl: r.image_url,
  publishedAt: r.published_at,
  fetchedAt: r.fetched_at,
});

/**
 * Inserts an article unless one with the same URL or content hash already
 * exists. Returns the stored article and whether it was newly inserted.
 */
export async function insertArticleIfNew(
  a: NewArticle,
): Promise<{ article: Article; inserted: boolean }> {
  const db = getDb();
  const dup = db
    .prepare("SELECT * FROM articles WHERE url = ? OR (content_hash IS NOT NULL AND content_hash = ?) LIMIT 1")
    .get(a.url, a.contentHash) as ArticleRow | undefined;
  if (dup) return { article: toArticle(dup), inserted: false };

  const row: ArticleRow = {
    id: newId(),
    url: a.url,
    content_hash: a.contentHash,
    title: a.title,
    source: a.source,
    author: a.author,
    topic: a.topic,
    excerpt: a.excerpt,
    content_text: a.contentText,
    image_url: a.imageUrl,
    published_at: a.publishedAt,
    fetched_at: now(),
  };
  db.prepare(
    `INSERT INTO articles (id, url, content_hash, title, source, author, topic, excerpt,
                           content_text, image_url, published_at, fetched_at)
     VALUES (@id, @url, @content_hash, @title, @source, @author, @topic, @excerpt,
             @content_text, @image_url, @published_at, @fetched_at)`,
  ).run(row);
  return { article: toArticle(row), inserted: true };
}

export async function getArticle(id: string): Promise<Article | null> {
  const row = getDb().prepare("SELECT * FROM articles WHERE id = ?").get(id) as ArticleRow | undefined;
  return row ? toArticle(row) : null;
}

/** Articles fetched since `sinceIso`, newest first: the candidate pool for an edition. */
export async function listRecentArticles(sinceIso: string, limit = 500): Promise<Article[]> {
  const rows = getDb()
    .prepare(
      `SELECT * FROM articles
       WHERE COALESCE(published_at, fetched_at) >= ?
       ORDER BY COALESCE(published_at, fetched_at) DESC
       LIMIT ?`,
    )
    .all(sinceIso, limit) as ArticleRow[];
  return rows.map(toArticle);
}

/** Cheap pre-check so ingestion can skip downloading pages it already has. */
export async function existsByUrlOrHash(url: string, contentHash: string | null): Promise<boolean> {
  return Boolean(
    getDb()
      .prepare("SELECT 1 FROM articles WHERE url = ? OR (content_hash IS NOT NULL AND content_hash = ?) LIMIT 1")
      .get(url, contentHash),
  );
}
