import Parser from "rss-parser";
import { db } from "@/lib/db";
import { getTopic, TOPICS } from "@/lib/topics";
import { extractArticle, USER_AGENT } from "./extract";
import { canonicalUrl, cleanText, contentHash, mapLimit, truncate } from "./normalize";

/**
 * Ingestion pipeline: for each followed topic, fetch its RSS feeds, keep
 * recent items, dedupe (canonical URL + title hash), extract full text with
 * Readability, and store new articles. One broken feed never stops the run:
 * its error is recorded in the report and the rest carry on.
 */

export interface IngestOptions {
  /** Topic ids to fetch. Defaults to every topic a reader follows (or all topics if nobody has onboarded). */
  topics?: string[];
  /** Download each article page for full text. Slower, but better summaries. */
  extract?: boolean;
  /** Max items taken from each feed. */
  perFeed?: number;
  /** Ignore items older than this. */
  maxAgeHours?: number;
}

export interface FeedReport {
  topic: string;
  name: string;
  url: string;
  ok: boolean;
  error?: string;
  found: number;
  inserted: number;
  duplicates: number;
}

export interface IngestReport {
  mode: "live" | "sample";
  startedAt: string;
  durationMs: number;
  topics: string[];
  feeds: FeedReport[];
  inserted: number;
  duplicates: number;
  failedFeeds: number;
}

const FEED_TIMEOUT_MS = 10_000;
const parser = new Parser({ timeout: FEED_TIMEOUT_MS });

export async function runIngestion(opts: IngestOptions = {}): Promise<IngestReport> {
  const started = Date.now();
  const followed = opts.topics ?? (await db.profiles.listFollowedTopics());
  const topics = (followed.length ? followed : TOPICS.map((t) => t.id)).filter((t) => getTopic(t));
  const perFeed = opts.perFeed ?? 12;
  const cutoff = Date.now() - (opts.maxAgeHours ?? 72) * 3_600_000;
  const extract = opts.extract ?? true;

  const jobs = topics.flatMap((topic) => getTopic(topic)!.feeds.map((feed) => ({ topic, ...feed })));

  // Feeds run 4 at a time; each feed extracts its articles 3 at a time.
  const feeds = await mapLimit(jobs, 4, async (job): Promise<FeedReport> => {
    const report: FeedReport = { ...job, ok: false, found: 0, inserted: 0, duplicates: 0 };
    try {
      const items = await fetchFeed(job.url);
      const fresh = items
        .filter((i) => i.link && i.title)
        .filter((i) => !i.isoDate || Date.parse(i.isoDate) >= cutoff)
        .slice(0, perFeed);
      report.found = fresh.length;

      await mapLimit(fresh, 3, async (item) => {
        const url = canonicalUrl(item.link!);
        const title = cleanText(item.title);
        const snippet = cleanText(item.contentSnippet ?? item.content ?? item.summary);

        // Skip the network round-trip for articles we already have.
        if (await db.articles.existsByUrlOrHash(url, contentHash(title))) {
          report.duplicates++;
          return;
        }

        const full = extract ? await extractArticle(url) : null;
        const { inserted } = await db.articles.insertArticleIfNew({
          url,
          contentHash: contentHash(title),
          title,
          source: job.name,
          author: full?.author ?? item.creator ?? null,
          topic: job.topic,
          excerpt: truncate(full?.excerpt || snippet || "", 300) || null,
          contentText: full?.text ?? (snippet || null),
          imageUrl: full?.imageUrl ?? item.enclosure?.url ?? null,
          publishedAt: item.isoDate ?? null,
        });
        if (inserted) report.inserted++;
        else report.duplicates++;
      });
      report.ok = true;
    } catch (err) {
      report.error = (err as Error).message.slice(0, 160);
    }
    return report;
  });

  return finish({ mode: "live", started, topics, feeds });
}

async function fetchFeed(url: string) {
  // Fetch ourselves (with a timeout and UA) and hand the XML to rss-parser.
  const res = await fetch(url, {
    headers: { "user-agent": USER_AGENT, accept: "application/rss+xml, application/xml, text/xml, */*" },
    signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const feed = await parser.parseString(await res.text());
  return feed.items;
}

/**
 * Loads the bundled sample stories instead of hitting the network. Used for
 * offline demos; every story is labelled "Sample Desk".
 */
export async function ingestSamples(): Promise<IngestReport> {
  const started = Date.now();
  const { SAMPLE_ARTICLES } = await import("./sample-articles");
  const byTopic = new Map<string, FeedReport>();

  for (const s of SAMPLE_ARTICLES) {
    const report =
      byTopic.get(s.topic) ??
      byTopic
        .set(s.topic, { topic: s.topic, name: "Sample Desk", url: "sample", ok: true, found: 0, inserted: 0, duplicates: 0 })
        .get(s.topic)!;
    report.found++;
    const { inserted } = await db.articles.insertArticleIfNew({
      url: `https://example.com/sample/${s.slug}`,
      contentHash: contentHash(s.title),
      title: s.title,
      source: "Sample Desk",
      author: null,
      topic: s.topic,
      excerpt: s.excerpt,
      contentText: s.body,
      imageUrl: null,
      // Spread "publish" times over the last day so recency scoring has something to work with.
      publishedAt: new Date(Date.now() - s.hoursAgo * 3_600_000).toISOString(),
    });
    if (inserted) report.inserted++;
    else report.duplicates++;
  }

  return finish({ mode: "sample", started, topics: [...byTopic.keys()], feeds: [...byTopic.values()] });
}

async function finish(r: { mode: IngestReport["mode"]; started: number; topics: string[]; feeds: FeedReport[] }) {
  const report: IngestReport = {
    mode: r.mode,
    startedAt: new Date(r.started).toISOString(),
    durationMs: Date.now() - r.started,
    topics: r.topics,
    feeds: r.feeds,
    inserted: r.feeds.reduce((n, f) => n + f.inserted, 0),
    duplicates: r.feeds.reduce((n, f) => n + f.duplicates, 0),
    failedFeeds: r.feeds.filter((f) => !f.ok).length,
  };
  await db.meta.setMeta("last_ingest", report);
  return report;
}
