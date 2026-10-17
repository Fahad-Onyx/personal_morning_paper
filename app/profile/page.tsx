import Link from "next/link";
import { redirect } from "next/navigation";
import { PrintButton } from "@/components/paper/PrintButton";
import { SignOutButton } from "@/components/SignOutButton";
import { db } from "@/lib/db";
import { EVENT_VALUES, HALF_LIFE_DAYS, type LearningResult } from "@/lib/learning/update";
import { getCurrentReader } from "@/lib/session";
import { topicLabel } from "@/lib/topics";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your profile · Personal Morning Paper" };

/**
 * The reader's interest profile, made visible: what they told us (base),
 * what the paper now believes (current weight), and the signals behind it.
 */
export default async function ProfilePage() {
  const reader = await getCurrentReader();
  if (!reader) redirect("/onboarding");
  const { user, profile } = reader;

  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const counts = await db.events.countByType(user.id, since);
  const lastRun = await db.meta.getMeta<LearningResult>(`learning:${user.id}`);
  const signalOf = new Map(lastRun?.value.changes.map((c) => [c.topic, c]) ?? []);
  const topics = profile.topics.filter((t) => t.weight > 0 || t.baseWeight > 0);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b-4 border-double border-ink pb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-muted">
            <Link href="/paper" className="hover:text-ink">
              ← Today&apos;s paper
            </Link>
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold">{user.name}&apos;s reading profile</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/onboarding" className="text-sm underline underline-offset-4">
            Edit interests
          </Link>
          <SignOutButton />
        </div>
      </header>

      {profile.summary && <p className="mt-6 font-serif text-xl italic">{profile.summary}</p>}

      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Section weights</h2>
        <p className="mt-1 text-sm text-ink-muted">
          The grey tick is what you told us. The black bar is what your paper uses today, after learning from your reading.
        </p>
        <ul className="mt-4 space-y-3">
          {topics.map((t) => {
            const delta = t.weight - t.baseWeight;
            const s = signalOf.get(t.topic);
            return (
              <li key={t.topic} className="grid grid-cols-[7.5rem_1fr_6rem] items-center gap-3 text-sm sm:grid-cols-[9rem_1fr_9rem]">
                <span className="font-serif font-semibold">
                  {topicLabel(t.topic)}
                  {t.source === "learned" && t.baseWeight === 0 && (
                    <span className="ml-1 rounded-full bg-accent px-1.5 text-[10px] font-normal uppercase text-paper">new</span>
                  )}
                </span>
                <span className="relative h-3 bg-rule">
                  <span className="absolute inset-y-0 left-0 bg-ink transition-all" style={{ width: `${t.weight * 100}%` }} />
                  {t.baseWeight > 0 && (
                    <span className="absolute -inset-y-1 w-0.5 bg-ink-muted" style={{ left: `${t.baseWeight * 100}%` }} />
                  )}
                </span>
                <span className="text-right tabular-nums">
                  {Math.round(t.weight * 100)}
                  {Math.abs(delta) >= 0.01 && (
                    <span className={`ml-2 text-xs ${delta > 0 ? "text-ink" : "text-accent"}`}>
                      {delta > 0 ? "▲" : "▼"} {Math.abs(Math.round(delta * 100))}
                    </span>
                  )}
                  {s && s.events > 0 && <span className="block text-[11px] text-ink-muted">{s.events} stories read</span>}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10 grid gap-8 border-t border-rule pt-8 md:grid-cols-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Your last 30 days</h2>
          <dl className="mt-3 grid grid-cols-5 gap-2 text-center">
            {(["click", "like", "dislike", "skip", "dwell"] as const).map((k) => (
              <div key={k} className="border-t-2 border-ink pt-2">
                <dd className="font-serif text-2xl font-bold tabular-nums">{counts[k]}</dd>
                <dt className="text-[11px] uppercase tracking-wider text-ink-muted">{k === "dwell" ? "reads" : `${k}s`}</dt>
              </div>
            ))}
          </dl>
          {(profile.preferences.keywords?.length ?? 0) > 0 && (
            <p className="mt-6 text-sm">
              <span className="text-ink-muted">Watching for: </span>
              {profile.preferences.keywords!.join(", ")}
            </p>
          )}
          {(profile.preferences.avoid?.length ?? 0) > 0 && (
            <p className="mt-1 text-sm">
              <span className="text-ink-muted">Keeping out: </span>
              {profile.preferences.avoid!.join(", ")}
            </p>
          )}
          <div className="mt-6">
            <PrintButton label="Reprint today's paper with what I've learned" variant="secondary" />
          </div>
        </div>

        <div className="text-sm text-ink-muted">
          <h2 className="text-xs font-semibold uppercase tracking-widest">How your paper learns</h2>
          <p className="mt-3">Before each edition, every story you interacted with in the last 30 days adds a signal to its section:</p>
          <ul className="mt-2 space-y-0.5 font-mono text-xs">
            <li>open original  +{EVENT_VALUES.click}</li>
            <li>like ▲         +{EVENT_VALUES.like}</li>
            <li>dislike ▼      {EVENT_VALUES.dislike}</li>
            <li>skip           {EVENT_VALUES.skip}</li>
            <li>reading time   +{EVENT_VALUES.dwellPerMinute}/min (max +0.5)</li>
          </ul>
          <p className="mt-3">
            Older signals fade, halving every {HALF_LIFE_DAYS} days. The total moves a section at most 35 points away from
            what you told us, so one busy morning can&apos;t rewrite your paper.
          </p>
        </div>
      </section>
    </main>
  );
}
