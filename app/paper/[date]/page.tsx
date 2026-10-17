import { notFound, redirect } from "next/navigation";
import { EditionPaper } from "@/components/paper/EditionPaper";
import { PaperToolbar } from "@/components/paper/PaperToolbar";
import { db } from "@/lib/db";
import { localDate } from "@/lib/edition/types";
import { loadEditionView } from "@/lib/edition/view";
import { getCurrentReader } from "@/lib/session";

export const dynamic = "force-dynamic";

/** A specific edition by date (YYYY-MM-DD), e.g. from the archive. */
export default async function EditionByDatePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();
  if (date === localDate()) redirect("/paper");

  const reader = await getCurrentReader();
  if (!reader) redirect("/onboarding");

  const edition = await db.editions.getEditionByDate(reader.user.id, date);
  const view = edition ? await loadEditionView(edition) : null;
  if (!view) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
      <EditionPaper view={view} toolbar={<PaperToolbar view={view} isToday={false} />} />
    </main>
  );
}
