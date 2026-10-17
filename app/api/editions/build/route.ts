import { NextResponse } from "next/server";
import { buildEdition, EditionError } from "@/lib/edition/build";
import { ingestSamples, runIngestion } from "@/lib/ingestion/ingest";
import { getCurrentUser } from "@/lib/session";

export const maxDuration = 300;

/**
 * POST /api/editions/build
 * Builds (or rebuilds) today's edition for the signed-in reader.
 *   ?ingest=1   fetch live feeds first
 *   ?ingest=sample   load the offline sample stories first
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const ingest = new URL(req.url).searchParams.get("ingest");
  try {
    if (ingest === "1") await runIngestion();
    if (ingest === "sample") await ingestSamples();
    const edition = await buildEdition(user);
    return NextResponse.json({ edition });
  } catch (err) {
    if (err instanceof EditionError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 409 });
    }
    console.error("[edition] build failed:", err);
    return NextResponse.json({ error: "Couldn't print the paper. Please try again." }, { status: 500 });
  }
}
