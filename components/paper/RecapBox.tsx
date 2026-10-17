"use client";

import { useState } from "react";
import type { Recap } from "@/lib/edition/recap";

/**
 * "3 things you learned today". Starts from the front page; after reading,
 * "Update from what I read" rewrites it from the stories the reader actually
 * engaged with. "Copy" puts it on the clipboard to share.
 */
export function RecapBox({ editionId, initial }: { editionId: string; initial: Recap | null }) {
  const [recap, setRecap] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function refresh() {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch(`/api/editions/${editionId}/recap`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't update");
      setRecap(data.recap);
      if (data.recap.basis !== "your-reading") setNote("Open, like or read a few stories first, then update.");
    } catch (err) {
      setNote((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!recap) return;
    const text = `3 things I learned today:\n${recap.items.map((it, i) => `${i + 1}. ${it.fact}`).join("\n")}`;
    try {
      await navigator.clipboard.writeText(text);
      setNote("Copied to clipboard.");
    } catch {
      setNote("Couldn't copy. Select the text instead.");
    }
  }

  if (!recap || recap.items.length === 0) return null;

  return (
    <section aria-labelledby="recap-title" className="my-8 border-y-4 border-double border-ink py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="recap-title" className="font-serif text-2xl font-bold italic">
          3 things you learned today
        </h2>
        <span className="text-xs uppercase tracking-widest text-ink-muted">
          {recap.basis === "your-reading" ? "From what you read" : "From today's front page"}
        </span>
      </div>
      <ol className="mt-4 grid gap-6 md:grid-cols-3">
        {recap.items.map((it, i) => (
          <li key={it.articleId} className="flex gap-3">
            <span className="font-serif text-5xl font-bold leading-none text-accent" aria-hidden>
              {i + 1}
            </span>
            <div>
              <p className="font-serif text-[17px] leading-snug">{it.fact}</p>
              <a href={`#story-${it.articleId}`} className="mt-1 block text-xs text-ink-muted hover:text-ink">
                From: {it.title}
              </a>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <button type="button" onClick={refresh} disabled={busy} className="underline underline-offset-4 disabled:opacity-50">
          {busy ? "Rewriting…" : "Update from what I read"}
        </button>
        <button type="button" onClick={copy} className="text-ink-muted underline underline-offset-4 hover:text-ink">
          Copy
        </button>
        {note && <span className="text-ink-muted">{note}</span>}
        <span className="ml-auto text-xs text-ink-muted">
          {recap.via === "llm" ? "Written by the AI editor" : "Key facts from the original articles"}
        </span>
      </div>
    </section>
  );
}
