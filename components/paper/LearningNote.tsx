import Link from "next/link";
import type { EditionLayout } from "@/lib/edition/types";
import { topicLabel } from "@/lib/topics";

/**
 * "What changed since last time": the topic weights the learning loop moved
 * just before this edition was built. Proves the paper is adapting.
 */
export function LearningNote({ layout }: { layout: EditionLayout }) {
  const changes = layout.learning ?? [];
  if (changes.length === 0) return null;

  return (
    <aside className="mt-6 rounded-sm border border-ink/80 bg-ink/[0.03] p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-accent">Your paper learned from your reading</h2>
        <Link href="/profile" className="text-xs text-ink-muted underline underline-offset-4 hover:text-ink">
          See your profile
        </Link>
      </div>
      <ul className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
        {changes.map((c) => {
          const up = c.after > c.before;
          return (
            <li key={c.topic} className="flex items-baseline gap-2">
              <span className={`font-bold ${up ? "text-ink" : "text-accent"}`} aria-hidden>
                {up ? "▲" : "▼"}
              </span>
              <span className="font-serif font-semibold">{topicLabel(c.topic)}</span>
              <span className="tabular-nums text-ink-muted">
                {Math.round(c.before * 100)} → {Math.round(c.after * 100)}
              </span>
              <span className="text-xs text-ink-muted">
                {c.before === 0 ? "new section for you" : `from ${c.events} ${c.events === 1 ? "story" : "stories"}`}
              </span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
