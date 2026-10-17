"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { InterestProfile } from "@/lib/db/types";

/**
 * Five-step onboarding: name → topic cards → own words → reading style →
 * reveal. State stays local until the last step, then one POST builds and
 * saves the profile. Topic cards cycle off → interested → love it.
 */

export interface TopicCard {
  id: string;
  label: string;
  emoji: string;
  blurb: string;
}

type Level = 0 | 1 | 2;
type StoryLength = "brief" | "standard" | "long";

export interface OnboardingAnswers {
  name: string;
  topics: { id: string; level: 1 | 2 }[];
  freeText: string;
  storyLength: StoryLength;
  readingMinutes: number;
}

const STEPS = ["Your name", "Topics", "In your words", "Reading style", "Your paper"] as const;

const PROMPTS = [
  "I follow Pakistani cricket and the PSL",
  "AI research, but not crypto",
  "Startups in South Asia and how they raise money",
  "Space missions and anything about Mars",
  "Climate policy and clean energy",
];

const LENGTHS: { id: StoryLength; title: string; body: string; lines: number }[] = [
  { id: "brief", title: "Quick briefs", body: "Two or three lines per story. Skim it with your chai.", lines: 2 },
  { id: "standard", title: "Balanced", body: "A short paragraph each, with a fuller lead story.", lines: 4 },
  { id: "long", title: "Deep reads", body: "Longer summaries with context for every story.", lines: 7 },
];

export function OnboardingFlow({
  topics,
  initial,
  aiLabel,
}: {
  topics: TopicCard[];
  /** Previous answers, so "edit my interests" starts where the reader left off. */
  initial?: Partial<OnboardingAnswers>;
  aiLabel: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initial?.name ?? "");
  const [levels, setLevels] = useState<Record<string, Level>>(
    Object.fromEntries((initial?.topics ?? []).map((t) => [t.id, t.level])),
  );
  const [freeText, setFreeText] = useState(initial?.freeText ?? "");
  const [storyLength, setStoryLength] = useState<StoryLength>(initial?.storyLength ?? "standard");
  const [readingMinutes, setReadingMinutes] = useState(initial?.readingMinutes ?? 15);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ profile: InterestProfile; via: string } | null>(null);

  const picked = useMemo(
    () => Object.entries(levels).filter(([, l]) => l > 0).map(([id, level]) => ({ id, level: level as 1 | 2 })),
    [levels],
  );

  const canContinue = [
    name.trim().length > 0,
    picked.length > 0 || freeText.trim().length > 0,
    true,
    true,
    true,
  ][step];

  const cycle = (id: string) =>
    setLevels((prev) => ({ ...prev, [id]: (((prev[id] ?? 0) + 1) % 3) as Level }));

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), topics: picked, freeText: freeText.trim(), storyLength, readingMinutes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setResult(data);
      setStep(4);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function next() {
    if (!canContinue || saving) return;
    if (step === 3) void submit();
    else setStep((s) => Math.min(s + 1, 4));
  }

  // Enter continues (except inside the textarea, where it's a newline).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !(e.target instanceof HTMLTextAreaElement) && step < 4) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const topicLabel = (id: string) => topics.find((t) => t.id === id)?.label ?? id;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress: a row of column rules that fill in as you go. */}
      <ol className="mb-8 grid grid-cols-5 gap-2" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label} className="text-[10px] uppercase tracking-widest sm:text-xs">
            <div className={`mb-2 h-1 transition-colors ${i <= step ? "bg-ink" : "bg-rule"}`} />
            <span className={i === step ? "text-ink" : "text-ink-muted"}>{label}</span>
          </li>
        ))}
      </ol>

      <div key={step} className="animate-[fadeUp_.35s_ease-out]">
        {step === 0 && (
          <section>
            <Kicker>Step one</Kicker>
            <Title>Whose name goes on the masthead?</Title>
            <p className="mt-3 text-ink-muted">Every edition is printed for one reader. Tell us who that is.</p>
            <input
              autoFocus
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your first name"
              className="mt-8 w-full border-b-2 border-ink bg-transparent pb-2 font-serif text-3xl outline-none placeholder:text-rule sm:text-4xl"
            />
            {name.trim() && (
              <p className="mt-6 text-center font-serif text-2xl italic text-ink-muted sm:text-3xl">
                “The {name.trim()} Morning Paper”
              </p>
            )}
          </section>
        )}

        {step === 1 && (
          <section>
            <Kicker>Step two</Kicker>
            <Title>What should we cover?</Title>
            <p className="mt-3 text-ink-muted">
              Tap once if you&apos;re <b>interested</b>, twice if you <b>love it</b>, three times to clear.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {topics.map((t) => {
                const level = levels[t.id] ?? 0;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => cycle(t.id)}
                    aria-pressed={level > 0}
                    className={`group relative flex flex-col items-start rounded-sm border p-3 text-left transition-all active:scale-[0.97] ${
                      level === 2
                        ? "border-accent bg-accent text-paper shadow-md"
                        : level === 1
                          ? "border-ink bg-ink text-paper"
                          : "border-rule hover:border-ink"
                    }`}
                  >
                    <span className="text-2xl" aria-hidden>
                      {t.emoji}
                    </span>
                    <span className="mt-2 font-serif text-lg font-semibold leading-tight">{t.label}</span>
                    <span className={`text-xs ${level ? "opacity-80" : "text-ink-muted"}`}>{t.blurb}</span>
                    {level > 0 && (
                      <span className="absolute right-2 top-2 text-[10px] font-bold uppercase tracking-wider">
                        {level === 2 ? "★ Love" : "✓"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-sm text-ink-muted">
              {picked.length === 0
                ? "Pick a few. You can skip this and just write in the next step."
                : `${picked.length} picked · ${picked.filter((p) => p.level === 2).length} loved`}
            </p>
          </section>
        )}

        {step === 2 && (
          <section>
            <Kicker>Step three</Kicker>
            <Title>Tell us what you care about, in your own words.</Title>
            <p className="mt-3 text-ink-muted">
              Teams, people, companies, places, or things you never want to see. Our editor ({aiLabel}) reads it.
            </p>
            <textarea
              autoFocus
              value={freeText}
              maxLength={1000}
              onChange={(e) => setFreeText(e.target.value)}
              rows={5}
              placeholder="I'm a CS student in Lahore. I want AI and startup news, Pakistan cricket, and no celebrity gossip…"
              className="mt-6 w-full resize-none rounded-sm border border-rule bg-transparent p-4 font-serif text-lg leading-relaxed outline-none focus:border-ink"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFreeText((t) => (t ? `${t.replace(/[.\s]*$/, "")}. ${p}` : p))}
                  className="rounded-full border border-rule px-3 py-1 text-xs text-ink-muted hover:border-ink hover:text-ink"
                >
                  + {p}
                </button>
              ))}
            </div>
            <p className="mt-2 text-right text-xs text-ink-muted">{freeText.length}/1000 · optional</p>
          </section>
        )}

        {step === 3 && (
          <section>
            <Kicker>Step four</Kicker>
            <Title>How do you like to read?</Title>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {LENGTHS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setStoryLength(l.id)}
                  aria-pressed={storyLength === l.id}
                  className={`rounded-sm border p-4 text-left transition-colors ${
                    storyLength === l.id ? "border-ink ring-2 ring-ink" : "border-rule hover:border-ink"
                  }`}
                >
                  {/* Little column preview: more lines = longer stories. */}
                  <div className="mb-3 space-y-1" aria-hidden>
                    <div className="h-2 w-3/4 bg-ink" />
                    {Array.from({ length: l.lines }).map((_, i) => (
                      <div key={i} className="h-1 bg-rule" style={{ width: `${90 - ((i * 13) % 30)}%` }} />
                    ))}
                  </div>
                  <span className="font-serif text-lg font-semibold">{l.title}</span>
                  <p className="mt-1 text-sm text-ink-muted">{l.body}</p>
                </button>
              ))}
            </div>

            <label className="mt-8 block">
              <span className="flex items-baseline justify-between">
                <span className="font-serif text-lg font-semibold">Time for your paper each morning</span>
                <span className="font-serif text-2xl tabular-nums">{readingMinutes} min</span>
              </span>
              <input
                type="range"
                min={5}
                max={45}
                step={5}
                value={readingMinutes}
                onChange={(e) => setReadingMinutes(Number(e.target.value))}
                className="mt-3 w-full accent-[var(--accent)]"
              />
              <span className="flex justify-between text-xs text-ink-muted">
                <span>A quick look</span>
                <span>The full Sunday paper</span>
              </span>
            </label>
            {error && <p className="mt-4 text-sm text-accent">{error}</p>}
          </section>
        )}

        {step === 4 && result && (
          <section>
            <Kicker>Hot off the press</Kicker>
            <Title>Here&apos;s your reading profile, {name.trim()}.</Title>
            <blockquote className="mt-4 border-l-4 border-accent pl-4 font-serif text-xl italic">
              {result.profile.summary}
            </blockquote>

            <h3 className="mt-8 text-xs font-semibold uppercase tracking-widest text-ink-muted">Section weights</h3>
            <ul className="mt-3 space-y-2">
              {result.profile.topics.map((t) => (
                <li key={t.topic} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3 text-sm">
                  <span className="font-serif font-semibold">{topicLabel(t.topic)}</span>
                  <span className="h-2 bg-rule">
                    <span className="block h-full bg-ink" style={{ width: `${t.weight * 100}%` }} />
                  </span>
                  <span className="text-right tabular-nums text-ink-muted">{Math.round(t.weight * 100)}</span>
                </li>
              ))}
            </ul>

            <Chips label="We'll look out for" items={result.profile.preferences.keywords ?? []} />
            <Chips label="We'll keep out" items={result.profile.preferences.avoid ?? []} muted />

            <p className="mt-6 text-xs text-ink-muted">
              Built with {result.via === "llm" ? aiLabel : "offline keyword matching"}. These weights change as you read.
            </p>
          </section>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-rule pt-6">
        {step > 0 && step < 4 ? (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="text-sm text-ink-muted hover:text-ink">
            ← Back
          </button>
        ) : step === 4 ? (
          <button type="button" onClick={() => setStep(1)} className="text-sm text-ink-muted hover:text-ink">
            ← Edit my answers
          </button>
        ) : (
          <span />
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={next}
            disabled={!canContinue || saving}
            className="rounded-sm bg-ink px-6 py-3 font-medium text-paper transition-opacity disabled:opacity-40"
          >
            {saving ? "Setting the type…" : step === 3 ? "Build my profile" : step === 2 && !freeText ? "Skip" : "Continue"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => router.push("/paper")}
            className="rounded-sm bg-accent px-6 py-3 font-medium text-paper"
          >
            Print my first paper →
          </button>
        )}
      </div>
    </div>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-widest text-accent">{children}</p>;
}

function Title({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">{children}</h2>;
}

function Chips({ label, items, muted }: { label: string; items: string[]; muted?: boolean }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-6">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-muted">{label}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((k) => (
          <span
            key={k}
            className={`rounded-full border px-3 py-1 text-sm ${muted ? "border-rule text-ink-muted line-through" : "border-ink"}`}
          >
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}
