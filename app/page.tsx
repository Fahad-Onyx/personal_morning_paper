import Link from "next/link";
import { IngestButton } from "@/components/IngestButton";
import { Masthead } from "@/components/Masthead";
import { db, getStats } from "@/lib/db";
import { localDate } from "@/lib/edition/types";
import type { IngestReport } from "@/lib/ingestion/ingest";
import { llmLabel } from "@/lib/llm";
import { timeAgo } from "@/lib/format";
import { getCurrentReader } from "@/lib/session";

// Read live DB state on every request instead of caching it at build time.
export const dynamic = "force-dynamic";

const FEATURES = [
  { title: "Learns your interests", body: "Pick topic cards and tell us in your own words. An AI editor turns it into a weighted reading profile." },
  { title: "One edition a day", body: "Stories from curated feeds, deduped and ranked for you, with a lead story, sections and a 'why this story' note." },
  { title: "Read or print", body: "Read on the web with links to the originals, or download the same edition as a newspaper-style PDF." },
  { title: "Gets better daily", body: "Clicks, skips, likes and reading time shift your section weights, with older signals fading over time." },
];

async function loadHome() {
  try {
    const [stats, reader, lastIngest] = await Promise.all([
      getStats(),
      getCurrentReader(),
      db.meta.getMeta<IngestReport>("last_ingest"),
    ]);
    const today = reader ? await db.editions.getEditionByDate(reader.user.id, localDate()) : null;
    const lead = today ? (await db.editions.listEditionSummaries(reader!.user.id, 1))[0] : null;
    return { ok: true as const, stats, reader, lastIngest, today, lead };
  } catch (err) {
    console.error("Database unavailable:", err);
    return { ok: false as const };
  }
}

export default async function Home() {
  const home = await loadHome();
  const reader = home.ok ? home.reader : null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <Masthead date={new Date()} />

      <section className="grid gap-8 border-b border-rule py-10 md:grid-cols-[2fr_1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Front page</p>
          {reader ? (
            <>
              <h2 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">Good morning, {reader.user.name}.</h2>
              {home.ok && home.lead ? (
                <p className="mt-4 max-w-prose text-lg text-ink-muted">
                  Today&apos;s paper leads with{" "}
                  <Link href="/paper" className="font-serif font-semibold text-ink underline-offset-4 hover:underline">
                    {home.lead.leadTitle}
                  </Link>
                  .
                </p>
              ) : (
                <p className="mt-4 max-w-prose text-lg text-ink-muted">Today&apos;s edition is ready to print.</p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link href="/paper" className="rounded-sm bg-ink px-5 py-3 font-medium text-paper">
                  {home.ok && home.today ? "Read today's paper" : "Print today's paper"}
                </Link>
                <Link href="/archive" className="text-sm underline underline-offset-4">
                  Archive
                </Link>
                <Link href="/profile" className="text-sm underline underline-offset-4">
                  My profile
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">
                Each morning, a newspaper written for one reader: you.
              </h2>
              <p className="mt-4 max-w-prose text-lg text-ink-muted">
                Personal Morning Paper reads the web and builds a single edition around your interests, then learns from
                what you read so tomorrow&apos;s paper fits you better.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link href="/onboarding" className="rounded-sm bg-ink px-5 py-3 font-medium text-paper">
                  Start my paper
                </Link>
                <span className="text-sm text-ink-muted">Two minutes, no sign-up form.</span>
              </div>
            </>
          )}
        </div>

        <aside className="border-t border-rule pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
          <h3 className="font-serif text-lg font-semibold">The newsroom</h3>
          {home.ok ? (
            <>
              <dl className="mt-3 grid grid-cols-2 gap-y-1 text-sm">
                <dt className="text-ink-muted">stories on file</dt>
                <dd className="text-right tabular-nums">{home.stats.articles}</dd>
                <dt className="text-ink-muted">readers</dt>
                <dd className="text-right tabular-nums">{home.stats.users}</dd>
                <dt className="text-ink-muted">editions printed</dt>
                <dd className="text-right tabular-nums">{home.stats.editions}</dd>
                <dt className="text-ink-muted">reader signals</dt>
                <dd className="text-right tabular-nums">{home.stats.events}</dd>
                <dt className="text-ink-muted">editor</dt>
                <dd className="text-right">{llmLabel()}</dd>
                <dt className="text-ink-muted">last fetch</dt>
                <dd className="text-right">
                  {home.lastIngest
                    ? `${timeAgo(home.lastIngest.updatedAt)}${home.lastIngest.value.mode === "sample" ? " (samples)" : ""}`
                    : "never"}
                </dd>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <IngestButton label="Fetch the news" />
                <IngestButton sample label="Load samples" />
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-accent">
              Can&apos;t open the database. Check DATABASE_PATH in .env.local, then run
              <code className="mx-1">npm run db:init</code>.
            </p>
          )}
        </aside>
      </section>

      <section className="grid gap-x-8 gap-y-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <article key={f.title} className="border-t-2 border-ink pt-3">
            <h3 className="font-serif text-xl font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-ink-muted">{f.body}</p>
          </article>
        ))}
      </section>

      <footer className="border-t border-rule pt-4 text-center text-xs text-ink-muted">
        NaSCon &apos;26 · Eynvision · Personal Morning Paper
      </footer>
    </main>
  );
}
