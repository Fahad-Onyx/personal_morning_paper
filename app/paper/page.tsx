import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentReader } from "@/lib/session";
import { topicLabel } from "@/lib/topics";

export const dynamic = "force-dynamic";

// Placeholder until the edition builder and reader land: shows the saved profile.
export default async function PaperPage() {
  const reader = await getCurrentReader();
  if (!reader) redirect("/onboarding");

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <h1 className="font-serif text-4xl font-bold">{reader.user.name}&apos;s profile is saved</h1>
      <p className="mt-3 font-serif text-xl italic">{reader.profile.summary}</p>
      <ul className="mt-6 space-y-1">
        {reader.profile.topics.map((t) => (
          <li key={t.topic}>
            {topicLabel(t.topic)}: {t.weight}
          </li>
        ))}
      </ul>
      <p className="mt-8 text-ink-muted">Editions are printed from the next phase on.</p>
      <Link href="/onboarding" className="mt-4 inline-block underline">Edit interests</Link>
    </main>
  );
}
