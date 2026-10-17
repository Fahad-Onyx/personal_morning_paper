import { Readability } from "@mozilla/readability";
import { JSDOM, VirtualConsole } from "jsdom";
import { cleanText } from "./normalize";

/**
 * Downloads an article page and pulls out the readable body text with
 * Mozilla Readability (the engine behind Firefox Reader View). Returns null
 * on any failure; the caller then keeps the RSS snippet instead.
 */

const TIMEOUT_MS = 8_000;
const MAX_HTML_BYTES = 2_000_000;
const MAX_TEXT_CHARS = 12_000; // plenty for summaries; keeps the DB small

export interface Extracted {
  text: string;
  excerpt: string | null;
  imageUrl: string | null;
  author: string | null;
}

export async function extractArticle(url: string): Promise<Extracted | null> {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": USER_AGENT, accept: "text/html" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: "follow",
    });
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("html")) return null;
    const html = (await res.text()).slice(0, MAX_HTML_BYTES);

    // Silence jsdom's CSS parse warnings; real pages are messy.
    const dom = new JSDOM(html, { url, virtualConsole: new VirtualConsole() });
    const doc = dom.window.document;
    const ogImage =
      doc.querySelector('meta[property="og:image"]')?.getAttribute("content") ??
      doc.querySelector('meta[name="twitter:image"]')?.getAttribute("content") ??
      null;

    const parsed = new Readability(doc).parse();
    dom.window.close();
    const text = cleanText(parsed?.textContent);
    if (!parsed || text.length < 200) return null;

    return {
      text: text.slice(0, MAX_TEXT_CHARS),
      excerpt: parsed.excerpt ? cleanText(parsed.excerpt) : null,
      imageUrl: ogImage,
      author: parsed.byline ?? null,
    };
  } catch {
    return null;
  }
}

export const USER_AGENT =
  "Mozilla/5.0 (compatible; PersonalMorningPaper/0.1; +https://github.com/Fahad-Onyx/personal_morning_paper)";
