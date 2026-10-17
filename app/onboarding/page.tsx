import Link from "next/link";
import { OnboardingFlow, type OnboardingAnswers } from "@/components/onboarding/OnboardingFlow";
import { llmLabel } from "@/lib/llm";
import { getCurrentReader } from "@/lib/session";
import { TOPICS } from "@/lib/topics";
import { parseJson } from "@/lib/db/util";

export const dynamic = "force-dynamic";
export const metadata = { title: "Start your paper · Personal Morning Paper" };

export default async function OnboardingPage() {
  const reader = await getCurrentReader();
  // Returning readers edit their previous answers instead of starting blank.
  const initial = reader
    ? parseJson<Partial<OnboardingAnswers>>(reader.profile.rawInput, { name: reader.user.name })
    : undefined;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <header className="mb-10 flex items-baseline justify-between border-b-4 border-double border-ink pb-3">
        <Link href="/" className="font-serif text-2xl font-bold">
          The Morning Paper
        </Link>
        <span className="text-xs uppercase tracking-widest text-ink-muted">
          {reader ? "Edit your interests" : "New subscriber"}
        </span>
      </header>
      <OnboardingFlow
        topics={TOPICS.map(({ id, label, emoji, blurb }) => ({ id, label, emoji, blurb }))}
        initial={initial}
        aiLabel={llmLabel()}
      />
    </main>
  );
}
