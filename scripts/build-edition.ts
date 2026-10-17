/**
 * Builds today's edition for every onboarded reader (what a daily cron would run).
 *   npm run edition:build
 *   npm run edition:build -- --ingest          fetch live feeds first
 *   npm run edition:build -- --ingest-sample   load offline sample stories first
 */
import { db } from "@/lib/db";
import { buildEdition, EditionError } from "@/lib/edition/build";
import { ingestSamples, runIngestion } from "@/lib/ingestion/ingest";
import { topicLabel } from "@/lib/topics";

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--ingest")) console.log(`ingested ${(await runIngestion()).inserted} new articles`);
  if (args.includes("--ingest-sample")) console.log(`ingested ${(await ingestSamples()).inserted} sample articles`);

  const users = await db.users.listUsers();
  if (users.length === 0) console.log("No readers yet. Onboard at http://localhost:3000/onboarding");

  for (const user of users) {
    try {
      const edition = await buildEdition(user);
      const items = await db.editions.listEditionItems(edition.id);
      console.log(`\n${user.name} · ${edition.editionDate} · ${items.length} stories`);
      for (const it of items) {
        const a = await db.articles.getArticle(it.articleId);
        console.log(
          `${it.isLead ? "LEAD" : "    "} ${topicLabel(it.section).padEnd(12)} ${it.length.padEnd(8)} ${it.score.toFixed(2)}  ${a?.title.slice(0, 70)}`,
        );
      }
    } catch (err) {
      if (err instanceof EditionError) console.log(`${user.name}: ${err.message}`);
      else throw err;
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
