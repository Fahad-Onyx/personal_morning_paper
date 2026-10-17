"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Runs ingestion from the home page and reports what happened. */
export function IngestButton({ sample, label }: { sample?: boolean; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/ingest${sample ? "?sample=1" : ""}`, { method: "POST" });
      const r = await res.json();
      if (!res.ok) throw new Error(r.error ?? "Ingestion failed");
      setMsg(
        r.failedFeeds === r.feeds.length && r.feeds.length > 0
          ? "Every feed failed. Are you offline? Try the sample stories."
          : `${r.inserted} new stories${r.failedFeeds ? `, ${r.failedFeeds} feeds down` : ""}.`,
      );
      router.refresh();
    } catch (err) {
      setMsg((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="flex flex-col gap-1">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="rounded-sm border border-ink px-3 py-1.5 text-sm font-medium disabled:opacity-50"
      >
        {busy ? "Working…" : label}
      </button>
      {msg && <span className="text-xs text-ink-muted">{msg}</span>}
    </span>
  );
}
