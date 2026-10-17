import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-xs uppercase tracking-widest text-accent">Page 404</p>
      <h1 className="mt-3 font-serif text-4xl font-bold">This edition was never printed.</h1>
      <p className="mt-4 text-ink-muted">The page or edition you&apos;re looking for doesn&apos;t exist.</p>
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/paper" className="rounded-sm bg-ink px-5 py-3 font-medium text-paper">
          Today&apos;s paper
        </Link>
        <Link href="/archive" className="rounded-sm border border-ink px-5 py-3 font-medium">
          Archive
        </Link>
      </div>
    </main>
  );
}
