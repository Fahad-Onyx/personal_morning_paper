import Link from "next/link";
import { Masthead } from "@/components/Masthead";
import { getStats } from "@/lib/db";
import { getCurrentReader } from "@/lib/session";

// Read DB counts on every request instead of caching them at build time.
export const dynamic = "force-dynamic";

const FEATURES = [
  { title: "Learns your interests", body: "Tell us what you care about in your own words. We turn it into a reading profile." },
  { title: "One edition a day", body: "Stories gathered from across the web, ranked for you, with a lead story and sections." },
  { title: "Read or print", body: "Read on the web with links to the original articles, or download the same edition as a PDF." },
  { title: "Gets better daily", body: "Clicks, skips and likes change what makes tomorrow's front page." },
];

async function loadStats() {
  try {
    return { ok: true as const, stats: await getStats() };
  } catch (err) {
    console.error("Database unavailable:", err);
    return { ok: false as const };
  }
}

export default async function Home() {
  const status = await loadStats();
  const reader = status.ok ? await getCurrentReader().catch(() => null) : null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <Masthead date={new Date()} />

      <section className="grid gap-8 border-b border-rule py-10 md:grid-cols-[2fr_1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Front page</p>
          <h2 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">
            Each morning, a newspaper written for one reader: you.
          </h2>
          <p className="mt-4 max-w-prose text-lg text-ink-muted">
            Personal Morning Paper reads the web overnight and builds a single edition around your
            interests, then learns from what you read so tomorrow&apos;s paper fits you better.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            {reader ? (
              <>
                <Link href="/paper" className="rounded-sm bg-ink px-5 py-3 font-medium text-paper">
                  Read today&apos;s paper
                </Link>
                <Link href="/onboarding" className="text-sm text-ink-muted underline-offset-4 hover:underline">
                  Edit my interests
                </Link>
                <span className="text-sm text-ink-muted">Welcome back, {reader.user.name}.</span>
              </>
            ) : (
              <>
                <Link href="/onboarding" className="rounded-sm bg-ink px-5 py-3 font-medium text-paper">
                  Start my paper
                </Link>
                <span className="text-sm text-ink-muted">Two minutes, no sign-up form.</span>
              </>
            )}
          </div>
        </div>

        <aside className="border-t border-rule pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
          <h3 className="font-serif text-lg font-semibold">System status</h3>
          {status.ok ? (
            <dl className="mt-3 grid grid-cols-2 gap-y-1 text-sm">
              {Object.entries(status.stats).map(([table, n]) => (
                <div key={table} className="contents">
                  <dt className="text-ink-muted">{table.replace("_", " ")}</dt>
                  <dd className="text-right tabular-nums">{n}</dd>
                </div>
              ))}
            </dl>
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
        NaSCon &apos;26 · Eynvision
      </footer>
    </main>
  );
}
