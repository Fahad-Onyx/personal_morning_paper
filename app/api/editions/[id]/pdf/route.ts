import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loadEditionView } from "@/lib/edition/view";
import { PdfUnavailableError, renderEditionPdf } from "@/lib/pdf/render";
import { getCurrentUser } from "@/lib/session";

export const maxDuration = 60;

/**
 * GET /api/editions/:id/pdf          download the edition as a PDF
 * GET /api/editions/:id/pdf?inline=1 open it in the browser's PDF viewer
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const edition = await db.editions.getEdition(id);
  if (!edition || edition.userId !== user.id) return NextResponse.json({ error: "Edition not found" }, { status: 404 });

  const view = await loadEditionView(edition);
  if (!view) return NextResponse.json({ error: "Edition has no stories" }, { status: 404 });

  try {
    const pdf = await renderEditionPdf(view);
    const inline = new URL(req.url).searchParams.get("inline") === "1";
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `${inline ? "inline" : "attachment"}; filename="morning-paper-${edition.editionDate}.pdf"`,
        "cache-control": "private, no-store",
      },
    });
  } catch (err) {
    if (err instanceof PdfUnavailableError) return NextResponse.json({ error: err.message }, { status: 503 });
    console.error("[pdf] render failed:", err);
    return NextResponse.json({ error: "Couldn't render the PDF." }, { status: 500 });
  }
}
