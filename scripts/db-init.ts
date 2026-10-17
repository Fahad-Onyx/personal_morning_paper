/**
 * Creates the SQLite file (if missing) and applies pending migrations.
 * Usage: npm run db:init
 */
import { getStats } from "@/lib/db";
import { env } from "@/lib/env";

async function main() {
  const stats = await getStats(); // opening the connection runs migrations
  console.log(`Database ready at ${env().DATABASE_PATH}`);
  console.table(stats);
}

main().catch((err) => {
  console.error("db:init failed:", err);
  process.exit(1);
});
