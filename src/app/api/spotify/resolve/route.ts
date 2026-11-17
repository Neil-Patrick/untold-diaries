import { getTrackById, isShortLink, resolveShortLink } from "@/lib/spotify";
import { NextResponse } from "next/server";

// Turns a spotify.link short link into the song's details.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const link = searchParams.get("url");

  if (!link || !isShortLink(link))
    return NextResponse.json({ error: "Not a Spotify short link" }, { status: 400 });

  const trackId = await resolveShortLink(link);
  if (!trackId)
    return NextResponse.json(
      { error: "That link doesn't point to a Spotify song" },
      { status: 404 }
    );

  const track = await getTrackById(trackId);
  if (!track)
    return NextResponse.json({ error: "Failed to fetch track" }, { status: 502 });

  return NextResponse.json(track, {
    headers: { "Cache-Control": "public, max-age=86400" },
  });
}
