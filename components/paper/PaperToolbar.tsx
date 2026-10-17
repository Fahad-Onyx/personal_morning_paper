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
        <span className="text-xs text-ink-muted">Edition {view.edition.editionDate}</span>
      </div>
    </div>
  );
}
