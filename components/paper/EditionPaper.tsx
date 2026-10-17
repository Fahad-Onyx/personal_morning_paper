import type { EditionView } from "@/lib/edition/view";
import { longDate } from "@/lib/format";
import { topicLabel } from "@/lib/topics";
import { DwellTracker } from "./DwellTracker";
import { LearningNote } from "./LearningNote";
import { StoryCard } from "./StoryCard";

/**
 * The full newspaper page for one edition: masthead, lead story, then each
 * section in the reader's order. Grid density follows their reading style:
 * brief readers get three tight columns, deep readers get wide ones.
 */
const GRID: Record<string, string> = {
  brief: "md:grid-cols-2 lg:grid-cols-3",
  standard: "md:grid-cols-2",
  long: "md:grid-cols-2",
};

export function EditionPaper({ view, toolbar }: { view: EditionView; toolbar?: React.ReactNode }) {
  const { edition, layout, lead, sections } = view;

  return (
    <div>
      <DwellTracker editionId={edition.id} />

      <header className="text-center">
        <div className="flex flex-wrap justify-between gap-2 border-b border-rule pb-2 text-[11px] uppercase tracking-widest text-ink-muted">
          <span>{longDate(edition.editionDate)}</span>
          <span>No. {view.issueNumber}</span>
          <span className="hidden sm:inline">
            {layout.storyCount} stories · about {view.readMinutes} min
          </span>
        </div>
        <h1 className="py-5 font-serif text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          The {layout.mastheadName} Morning Paper
        </h1>
        <div className="border-y-4 border-double border-ink py-1 text-[11px] uppercase tracking-[0.25em]">
          {sections.length > 0 ? (
            <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1" aria-label="Sections">
              {sections.map((s) => (
                <a key={s.id} href={`#section-${s.id}`} className="hover:text-accent">
                  {s.label}
                </a>
              ))}
            </nav>
          ) : (
            "Printed for one reader"
          )}
        </div>
      </header>

      {toolbar && <div className="mt-4">{toolbar}</div>}
      <LearningNote layout={layout} />

      <section className="border-b-2 border-ink py-8">
        <StoryCard story={lead} editionId={edition.id} variant="lead" sectionLabel={layout.sectionLabels?.[lead.item.section] ?? topicLabel(lead.item.section)} />
      </section>

      {sections.map((section) => (
        <section key={section.id} id={`section-${section.id}`} className="scroll-mt-4 border-b border-rule py-8">
          <h2 className="mb-6 flex items-baseline gap-3 border-t-4 border-ink pt-2 font-serif text-2xl font-bold">
            {section.label}
            <span className="font-sans text-xs font-normal uppercase tracking-widest text-ink-muted">
              {section.stories.length} {section.stories.length === 1 ? "story" : "stories"}
            </span>
          </h2>
          <div className={`grid gap-x-8 gap-y-8 ${GRID[layout.storyLength] ?? GRID.standard}`}>
            {section.stories.map((story, i) => (
              <div
                key={story.article.id}
                // The section's top story spans two columns when it runs long.
                className={story.item.length === "long" && i === 0 ? "md:col-span-2" : ""}
              >
                <StoryCard story={story} editionId={edition.id} />
              </div>
            ))}
          </div>
        </section>
      ))}

      <footer className="py-6 text-center text-xs text-ink-muted">
        Chosen from {layout.candidates} candidate stories · summaries:{" "}
        {layout.summariesBy === "llm" ? "AI editor" : layout.summariesBy === "mixed" ? "AI editor + extracts" : "extracts from the original articles"}{" "}
        · built {new Date(layout.builtAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
      </footer>
    </div>
  );
}
