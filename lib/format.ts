/** Small display helpers shared by the web reader and the PDF template. */

export function timeAgo(iso: string | null | undefined, nowMs = Date.now()): string {
  if (!iso) return "";
  const mins = Math.round((nowMs - Date.parse(iso)) / 60_000);
  if (Number.isNaN(mins)) return "";
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

/** "Saturday, 17 October 2026" from a YYYY-MM-DD edition date. */
export function longDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Splits a summary into paragraphs on blank lines. */
export function paragraphs(text: string | null | undefined): string[] {
  return (text ?? "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
}
