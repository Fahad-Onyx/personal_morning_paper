"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Builds today's edition through POST /api/editions/build, optionally
 * fetching news first. Shows progress and turns API errors into a message
 * instead of a broken page.
 */
export function PrintButton({
  ingest,
  label,
  variant = "primary",
}: {
  ingest?: "1" | "sample";
  label: string;
  variant?: "primary" | "secondary" | "link";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function print() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/editions/build${ingest ? `?ingest=${ingest}` : ""}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Printing failed");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const styles = {
    primary: "rounded-sm bg-ink px-5 py-3 font-medium text-paper",
    secondary: "rounded-sm border border-ink px-5 py-3 font-medium",
    link: "text-sm underline underline-offset-4 text-ink-muted hover:text-ink",
  }[variant];

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button type="button" onClick={print} disabled={busy} className={`${styles} disabled:opacity-50`}>
        {busy ? (ingest === "1" ? "Fetching the news…" : "Setting the type…") : label}
      </button>
      {error && <span className="max-w-xs text-sm text-accent">{error}</span>}
    </span>
  );
}
