"use client";

import Link from "next/link";

/** Catches unexpected server or render errors so the reader never sees a blank page. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-xs uppercase tracking-widest text-accent">Stop the press</p>
      <h1 className="mt-3 font-serif text-4xl font-bold">Something went wrong in the newsroom.</h1>
      <p className="mt-4 text-ink-muted">
        {error.message.includes("database") || error.message.includes("SQLITE")
          ? "The database couldn't be opened. Check DATABASE_PATH in .env.local and run npm run db:init."
          : "This page failed to load. Your paper and reading history are safe."}
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <button type="button" onClick={reset} className="rounded-sm bg-ink px-5 py-3 font-medium text-paper">
          Try again
        </button>
        <Link href="/" className="rounded-sm border border-ink px-5 py-3 font-medium">
          Home
        </Link>
      </div>
      {error.digest && <p className="mt-6 text-xs text-ink-muted">Reference: {error.digest}</p>}
    </main>
  );
}
