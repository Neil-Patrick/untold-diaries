import { NextRequest, NextResponse } from "next/server";
import { randomSubmissions } from "@/lib/submissions";

// Always run on request so each visit gets a fresh random selection.
export const dynamic = "force-dynamic";

// GET /api/submissions/random?limit=30 — random stories for the carousel.
export async function GET(req: NextRequest) {
  const limit = Math.min(
    50,
    Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") ?? "12", 10) || 12)
  );

  try {
    return NextResponse.json(await randomSubmissions(limit));
  } catch (err) {
    console.error("Failed to load random submissions:", err);
    return NextResponse.json({ error: "Failed to load stories" }, { status: 500 });
  }
}
