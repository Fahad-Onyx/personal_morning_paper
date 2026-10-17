import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { EditionLayout } from "@/lib/edition/types";
import { localDate } from "@/lib/edition/types";
import { longDate } from "@/lib/format";
import { getCurrentReader } from "@/lib/session";
import { topicLabel } from "@/lib/topics";

export const dynamic = "force-dynamic";
export const metadata = { title: "Archive · Personal Morning Paper" };

/** Every past edition for the reader, newest first, with its front-page headline. */
export default async function ArchivePage() {
  const reader = await getCurrentReader();
  if (!reader) redirect("/onboarding");

  const editions = await db.editions.listEditionSummaries(reader.user.id);
  const today = localDate();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <header className="border-b-4 border-double border-ink pb-4 text-center">
        <p className="text-xs uppercase tracking-widest text-ink-muted">
          <Link href="/paper" className="hover:text-ink">
            ← Today&apos;s paper
          </Link>
        </p>
        <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">The Archive</h1>
        <p className="mt-2 font-serif italic text-ink-muted">
          Every edition of The {reader.user.name} Morning Paper ({editions.length})
        </p>
      </header>

      {editions.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-serif text-xl">No editions yet.</p>
          <Link href="/paper" className="mt-4 inline-block rounded-sm bg-ink px-5 py-3 font-medium text-paper">
            Print your first paper
          </Link>
        </div>
      ) : (
        <ol className="divide-y divide-rule">
          {editions.map(({ edition, storyCount, leadTitle, leadSource, sections }, i) => {
            const layout = edition.layout as unknown as Partial<EditionLayout>;
            const href = edition.editionDate === today ? "/paper" : `/paper/${edition.editionDate}`;
            return (
              <li key={edition.id} className="grid gap-4 py-6 sm:grid-cols-[9rem_1fr_auto]">
                <div>
                  <p className="font-serif text-lg font-semibold">{longDate(edition.editionDate).split(",")[0]}</p>
                  <p className="text-sm text-ink-muted">{longDate(edition.editionDate).split(",")[1]}</p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-ink-muted">No. {editions.length - i}</p>
                </div>
                <div>
                  <Link href={href} className="font-serif text-xl font-bold leading-snug hover:underline">
                    {leadTitle ?? "Untitled edition"}
                  </Link>
                  <p className="mt-1 text-xs uppercase tracking-wider text-ink-muted">
                    {leadSource} · {storyCount} stories
                  </p>
                  <p className="mt-2 flex flex-wrap gap-1.5">
                    {sections.map((s) => (
                      <span key={s} className="rounded-full border border-rule px-2 py-0.5 text-xs text-ink-muted">
                        {layout.sectionLabels?.[s] ?? topicLabel(s)}
                      </span>
                    ))}
                  </p>
                </div>
                <div className="flex gap-3 text-sm sm:flex-col sm:items-end">
                  <Link href={href} className="font-medium underline underline-offset-4">
                    Read
                  </Link>
                  <a href={`/api/editions/${edition.id}/pdf`} className="text-ink-muted underline underline-offset-4 hover:text-ink">
                    PDF ↓
                  </a>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
