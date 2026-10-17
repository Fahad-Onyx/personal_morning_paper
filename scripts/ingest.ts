/**
 * Fetches articles for every followed topic and stores new ones.
 *   npm run ingest                  live RSS feeds with full-text extraction
 *   npm run ingest -- --no-extract  feeds only (faster)
 *   npm run ingest -- --sample      bundled offline sample stories
 */
import { ingestSamples, runIngestion } from "@/lib/ingestion/ingest";

async function main() {
  const args = process.argv.slice(2);
  const report = args.includes("--sample") ? await ingestSamples() : await runIngestion({ extract: !args.includes("--no-extract") });

  console.table(
    report.feeds.map((f) => ({
      topic: f.topic,
      feed: f.name,
      status: f.ok ? "ok" : `FAILED: ${f.error}`,
      found: f.found,
      new: f.inserted,
      dupes: f.duplicates,
    })),
  );
  console.log(
    `${report.mode} ingest: ${report.inserted} new, ${report.duplicates} duplicates, ` +
      `${report.failedFeeds} failed feeds, ${(report.durationMs / 1000).toFixed(1)}s`,
  );
  if (report.mode === "live" && report.failedFeeds === report.feeds.length) {
    console.log("Every feed failed. Offline? Try: npm run ingest -- --sample");
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
