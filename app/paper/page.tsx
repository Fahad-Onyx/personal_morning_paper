import Link from "next/link";
import { redirect } from "next/navigation";
import { EditionPaper } from "@/components/paper/EditionPaper";
import { PaperToolbar } from "@/components/paper/PaperToolbar";
import { PrintButton } from "@/components/paper/PrintButton";
import { db } from "@/lib/db";
import { localDate } from "@/lib/edition/types";
import { loadEditionView } from "@/lib/edition/view";
import { longDate } from "@/lib/format";
import { getCurrentReader } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Today's paper · Personal Morning Paper" };

/** Today's edition for the signed-in reader, or a "print it" screen if it isn't built yet. */
export default async function TodayPage() {
  const reader = await getCurrentReader();
  if (!reader) redirect("/onboarding");

  const today = localDate();
  const edition = await db.editions.getEditionByDate(reader.user.id, today);
  const view = edition ? await loadEditionView(edition) : null;

  if (!view) {
    const stats = await db.articles.countSince(new Date(Date.now() - 2 * 86_400_000).toISOString());
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-8">
        <p className="text-xs uppercase tracking-widest text-ink-muted">{longDate(today)}</p>
        <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">
          The {reader.user.name} Morning Paper
        </h1>
        <div className="mx-auto my-8 h-1 w-24 border-y-4 border-double border-ink" />
        <p className="font-serif text-xl text-ink-muted">Today&apos;s edition hasn&apos;t gone to press yet.</p>
        <p className="mt-2 text-sm text-ink-muted">
          {stats > 0
            ? `${stats} fresh stories are waiting in the newsroom.`
            : "The newsroom is empty. Fetch the news first."}
        </p>
        <div className="mt-8 flex flex-wrap items-start justify-center gap-4">
          {stats > 0 && <PrintButton label="Print today's paper" />}
          <PrintButton ingest="1" label="Fetch the news & print" variant={stats > 0 ? "secondary" : "primary"} />
          <PrintButton ingest="sample" label="Use sample stories (offline)" variant="secondary" />
        </div>
        <p className="mt-10 text-sm">
          <Link href="/onboarding" className="text-ink-muted underline underline-offset-4 hover:text-ink">
            Edit my interests
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
      <EditionPaper view={view} toolbar={<PaperToolbar view={view} isToday />} />
    </main>
  );
}
