import { NextRequest, NextResponse } from "next/server";
import { searchSubmissions } from "@/lib/submissions";

// GET /api/submissions/search?q=name — stories addressed to a matching name.
export async function GET(req: NextRequest) {
  const query = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 100);
  if (!query)
    return NextResponse.json({ error: "Missing search query" }, { status: 400 });

  try {
    return NextResponse.json(await searchSubmissions(query));
  } catch (err) {
    console.error("Search failed:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
