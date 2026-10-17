/** Shown while a server page loads (e.g. assembling an edition from the DB). */
export default function Loading() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <div className="h-1 w-40 overflow-hidden bg-rule">
        <div className="h-full w-1/3 animate-[press_1.1s_ease-in-out_infinite] bg-ink" />
      </div>
      <p className="mt-4 font-serif text-lg italic text-ink-muted">Setting the type…</p>
    </main>
  );
}
