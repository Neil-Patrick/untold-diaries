import { getTrackById, isValidTrackId } from "@/lib/spotify";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const trackId = searchParams.get("id");

  if (!trackId)
    return NextResponse.json({ error: "Missing track ID" }, { status: 400 });

  if (!isValidTrackId(trackId))
    return NextResponse.json({ error: "Invalid track ID" }, { status: 400 });

  const track = await getTrackById(trackId);

  if (!track)
    return NextResponse.json(
      { error: "Failed to fetch track" },
      { status: 502 }
    );

  // Let the browser reuse the result too, so revisits don't re-request it.
  return NextResponse.json(track, {
    headers: { "Cache-Control": "public, max-age=86400" },
  });
}
