import type { Recap } from "@/lib/edition/recap";
import type { EditionView, StoryView } from "@/lib/edition/view";
import { longDate, paragraphs, timeAgo } from "@/lib/format";
import { topicLabel } from "@/lib/topics";

/**
 * The print edition as one self-contained HTML document, which Playwright
 * turns into a PDF. It uses the same EditionView as the web reader, so the
 * PDF and the webpage always carry the same stories in the same order.
 * Stories the reader skipped are left out of print.
 *
 * Print layout: broadsheet-style masthead, a lead story across the page,
 * then sections flowing in CSS columns (3 for brief readers, 2 otherwise).
 */

const esc = (s: string | null | undefined) =>
  (s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

function story(s: StoryView, opts: { lead?: boolean } = {}): string {
  const { article, item } = s;
  const meta = [article.source, timeAgo(article.publishedAt ?? article.fetchedAt), article.author && `by ${article.author}`]
    .filter(Boolean)
    .map((m) => esc(m as string))
    .join(" · ");
  return `
  <article class="story ${opts.lead ? "lead" : item.length}">
    ${opts.lead ? `<p class="kicker">Lead story · ${esc(topicLabel(item.section))}</p>` : ""}
    <h3><a href="${esc(article.url)}">${esc(article.title)}</a></h3>
    <p class="meta">${meta}</p>
    <div class="body">${paragraphs(item.summary).map((p) => `<p>${esc(p)}</p>`).join("")}</div>
    ${item.whyThisStory ? `<p class="why"><b>Why this story:</b> ${esc(item.whyThisStory)}</p>` : ""}
    <p class="link">Read more: <a href="${esc(article.url)}">${esc(host(article.url))}</a></p>
  </article>`;
}

function recapBox(recap: Recap | null): string {
  if (!recap || recap.items.length === 0) return "";
  return `
  <div class="recap">
    <h2>3 things you learned today</h2>
    <ol>${recap.items.map((it, i) => `<li><span class="n">${i + 1}</span><span>${esc(it.fact)}</span></li>`).join("")}</ol>
  </div>`;
}

export function renderEditionHtml(view: EditionView): string {
  const { edition, layout, lead, sections } = view;
  const columns = layout.storyLength === "brief" ? 3 : 2;
  const visibleSections = sections
    .map((s) => ({ ...s, stories: s.stories.filter((st) => !st.skipped) }))
    .filter((s) => s.stories.length > 0);

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>The ${esc(layout.mastheadName)} Morning Paper · ${esc(edition.editionDate)}</title>
<style>
  @page { size: A4; margin: 14mm 12mm 16mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #141310; background: #fff; font: 9.6pt/1.42 Georgia, "Times New Roman", "DejaVu Serif", serif; }
  a { color: inherit; text-decoration: none; }
  .sans { font-family: "Helvetica Neue", Arial, "DejaVu Sans", sans-serif; }
  .dateline { display: flex; justify-content: space-between; font: 7.5pt/1 "Helvetica Neue", Arial, sans-serif;
              letter-spacing: .14em; text-transform: uppercase; border-bottom: .6pt solid #000; padding-bottom: 4pt; }
  h1 { font-size: 40pt; line-height: 1; text-align: center; margin: 10pt 0 8pt; letter-spacing: -.01em; }
  .rule { border-top: 3pt double #000; border-bottom: 3pt double #000; height: 6pt; margin-bottom: 4pt; }
  .sections { text-align: center; font: 7.5pt/1.4 "Helvetica Neue", Arial, sans-serif; letter-spacing: .18em;
              text-transform: uppercase; margin-bottom: 10pt; }
  .story h3 { margin: 0; font-size: 12.5pt; line-height: 1.15; }
  .story.brief h3 { font-size: 11pt; }
  .story.long h3 { font-size: 15pt; }
  .meta, .link, .kicker { font: 6.8pt/1.3 "Helvetica Neue", Arial, sans-serif; letter-spacing: .08em;
                          text-transform: uppercase; color: #5a554b; margin: 2pt 0 4pt; }
  .kicker { color: #9b2c1f; font-weight: bold; letter-spacing: .14em; }
  .body p { margin: 0 0 4pt; text-align: justify; hyphens: auto; }
  .why { font-style: italic; color: #4a463e; font-size: 8.2pt; border-left: 1.5pt solid #9b2c1f; padding-left: 5pt; margin: 4pt 0 2pt; }
  .link { text-transform: none; letter-spacing: 0; }
  .lead { border-bottom: 1.5pt solid #000; padding-bottom: 10pt; margin-bottom: 10pt; }
  .lead h3 { font-size: 26pt; line-height: 1.05; margin-top: 2pt; }
  .lead .body { columns: 2; column-gap: 14pt; font-size: 10.5pt; }
  .lead .body p:first-child::first-letter { float: left; font-size: 34pt; line-height: .8; padding: 2pt 4pt 0 0; font-weight: bold; }
  section { margin-top: 8pt; }
  section h2 { font-size: 13pt; margin: 0 0 6pt; padding-top: 3pt; border-top: 2.5pt solid #000;
               display: flex; justify-content: space-between; align-items: baseline; break-after: avoid; }
  section h2 span { font: 6.8pt "Helvetica Neue", Arial, sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #5a554b; font-weight: normal; }
  .cols { columns: ${columns}; column-gap: 14pt; column-rule: .5pt solid #cfc8b8; }
  .cols .story { break-inside: avoid; padding-bottom: 7pt; margin-bottom: 7pt; border-bottom: .5pt solid #cfc8b8; }
  .recap { border-top: 3pt double #000; border-bottom: 3pt double #000; padding: 6pt 0 8pt; margin: 0 0 10pt; break-inside: avoid; }
  .recap h2 { font-size: 14pt; font-style: italic; margin: 0 0 6pt; }
  .recap ol { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12pt; }
  .recap li { display: flex; gap: 6pt; font-size: 9.6pt; line-height: 1.3; }
  .recap .n { font-size: 26pt; font-weight: bold; color: #9b2c1f; line-height: .9; }
  footer { margin-top: 12pt; padding-top: 4pt; border-top: .6pt solid #000; text-align: center; color: #5a554b;
           font: 7pt "Helvetica Neue", Arial, sans-serif; }
</style></head>
<body>
  <div class="dateline"><span>${esc(longDate(edition.editionDate))}</span><span>No. ${view.issueNumber}</span>
    <span>${layout.storyCount} stories · about ${view.readMinutes} min</span></div>
  <h1>The ${esc(layout.mastheadName)} Morning Paper</h1>
  <div class="rule"></div>
  <div class="sections">${visibleSections.map((s) => esc(s.label)).join(" &nbsp;·&nbsp; ")}</div>

  ${lead.skipped ? "" : story(lead, { lead: true })}
  ${recapBox(edition.recap as Recap | null)}

  ${visibleSections
    .map(
      (s) => `
  <section>
    <h2>${esc(s.label)} <span>${s.stories.length} ${s.stories.length === 1 ? "story" : "stories"}</span></h2>
    <div class="cols">${s.stories.map((st) => story(st)).join("")}</div>
  </section>`,
    )
    .join("")}

  <footer>Printed for ${esc(layout.mastheadName)} by Personal Morning Paper · chosen from ${layout.candidates} stories ·
    links lead to the original articles</footer>
</body></html>`;
}
