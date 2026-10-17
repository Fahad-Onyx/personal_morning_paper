import { NextResponse } from "next/server";
import { ingestSamples, runIngestion } from "@/lib/ingestion/ingest";

// Live ingestion can take a while (many feeds plus page downloads).
export const maxDuration = 300;

/**
 * POST /api/ingest            fetch live RSS feeds for followed topics
 * POST /api/ingest?sample=1   load the bundled offline sample stories
 */
export async function POST(req: Request) {
  const sample = new URL(req.url).searchParams.get("sample") === "1";
  try {
    const report = sample ? await ingestSamples() : await runIngestion();
    return NextResponse.json(report);
  } catch (err) {
    console.error("[ingest] failed:", err);
    return NextResponse.json({ error: "Ingestion failed" }, { status: 500 });
  }
}
