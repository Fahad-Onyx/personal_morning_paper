/** Newspaper-style nameplate: dateline above, title, double rule below. */
export function Masthead({ date }: { date: Date }) {
  const dateline = date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="text-center">
      <div className="flex justify-between border-b border-rule pb-2 text-xs uppercase tracking-widest text-ink-muted">
        <span>{dateline}</span>
        <span className="hidden sm:inline">Edition for one</span>
      </div>
      <h1 className="py-6 font-serif text-5xl font-bold tracking-tight sm:text-7xl">
        The Morning Paper
      </h1>
      <div className="border-y-4 border-double border-ink py-1 text-xs uppercase tracking-[0.3em]">
        Your news, picked for you and laid out like a paper
      </div>
    </header>
  );
}
