import type { Browser } from "playwright";
import type { EditionView } from "@/lib/edition/view";
import { renderEditionHtml } from "./template";

/**
 * HTML → PDF with headless Chromium (Playwright). The browser is launched
 * once and reused across requests, because launching takes ~1s while
 * rendering a page takes ~200ms.
 */
const globalForPdf = globalThis as unknown as { __pmpBrowser?: Promise<Browser> };

async function browser(): Promise<Browser> {
  if (!globalForPdf.__pmpBrowser) {
    globalForPdf.__pmpBrowser = import("playwright").then(({ chromium }) => chromium.launch());
    // If the launch fails (e.g. Chromium isn't installed), let the next request retry.
    globalForPdf.__pmpBrowser.catch(() => (globalForPdf.__pmpBrowser = undefined));
  }
  const b = await globalForPdf.__pmpBrowser;
  if (!b.isConnected()) {
    globalForPdf.__pmpBrowser = undefined;
    return browser();
  }
  return b;
}

export class PdfUnavailableError extends Error {}

export async function renderEditionPdf(view: EditionView): Promise<Buffer> {
  let b: Browser;
  try {
    b = await browser();
  } catch (err) {
    throw new PdfUnavailableError(
      `Headless Chromium is not available (${(err as Error).message.split("\n")[0]}). Run: npx playwright install chromium`,
    );
  }

  const page = await b.newPage();
  try {
    await page.setContent(renderEditionHtml(view), { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `<div style="width:100%;font:7px Arial,sans-serif;color:#777;text-align:center">
        The ${view.layout.mastheadName.replace(/[<>&]/g, "")} Morning Paper · ${view.edition.editionDate} · page
        <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
    });
    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}
