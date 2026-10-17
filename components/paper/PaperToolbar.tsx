import Link from "next/link";
import type { EditionView } from "@/lib/edition/view";
import { PrintButton } from "./PrintButton";

/** Actions above the paper: reprint, edit interests, and navigation. */
export function PaperToolbar({ view, isToday }: { view: EditionView; isToday: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/" className="text-ink-muted hover:text-ink">
          ← Home
        </Link>
        {!isToday && (
          <Link href="/paper" className="text-ink-muted hover:text-ink">
            Today&apos;s paper
          </Link>
        )}
        <Link href="/onboarding" className="text-ink-muted hover:text-ink">
          Edit interests
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {isToday && <PrintButton label="Reprint with latest news" variant="link" ingest="1" />}
        <a
          href={`/api/editions/${view.edition.id}/pdf?inline=1`}
          target="_blank"
          rel="noopener"
          className="text-ink-muted underline underline-offset-4 hover:text-ink"
        >
          View PDF
        </a>
        <a href={`/api/editions/${view.edition.id}/pdf`} className="rounded-sm bg-ink px-3 py-1.5 font-medium text-paper">
          Download PDF ↓
        </a>
        <span className="text-xs text-ink-muted">Edition {view.edition.editionDate}</span>
      </div>
    </div>
  );
}
