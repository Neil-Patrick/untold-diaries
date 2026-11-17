/* eslint-disable @typescript-eslint/no-explicit-any */
const TOKEN_URL = "https://accounts.spotify.com/api/token";

let cachedToken: string | null = null;
let tokenExpiry = 0;

export async function getSpotifyToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(
      `Spotify token request returned ${res.status}: ${JSON.stringify(data).slice(0, 300)}`
    );
  }
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;
  return cachedToken;
}

export async function searchTracks(query: string) {
  const token = await getSpotifyToken();

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      query
    )}&type=track&limit=5`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Spotify search returned ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  if (!data.tracks) return [];

  // Format each track to match frontend expectations
  return data.tracks.items.map((track: any) => ({
    id: track.id,
    name: track.name,
    artists: track.artists.map((artist: any) => ({ name: artist.name })),
    preview_url: track.preview_url,
    image: track.album.images[1]?.url || track.album.images[0]?.url || "", // Use medium or fallback
  }));
}

export interface TrackInfo {
  id: string;
  name: string;
  image: string;
}

// Spotify track IDs are 22 base-62 characters.
const TRACK_ID_PATTERN = /^[A-Za-z0-9]{22}$/;

// Successful lookups are remembered for a day; failures for 5 minutes so a
// temporarily unavailable track is retried without hammering Spotify.
const SUCCESS_TTL_MS = 24 * 60 * 60 * 1000;
const FAILURE_TTL_MS = 5 * 60 * 1000;

const trackCache = new Map<string, { info: TrackInfo | null; expires: number }>();
// Concurrent requests for the same track share a single lookup.
const inFlight = new Map<string, Promise<TrackInfo | null>>();

// Short share links from the Spotify mobile app, e.g. https://spotify.link/AbC123
const SHORT_LINK_HOSTS = new Set(["spotify.link", "spotify.app.link"]);
const TRACK_ID_IN_TEXT = /open\.spotify\.com\/(?:intl-[a-z-]+\/)?track\/([A-Za-z0-9]{22})/i;
const shortLinkCache = new Map<string, string | null>();

export function isShortLink(input: string) {
  try {
    const url = new URL(input.trim());
    return url.protocol === "https:" && SHORT_LINK_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

// Follows a spotify.link short link to find the track ID it points to.
export async function resolveShortLink(input: string): Promise<string | null> {
  if (!isShortLink(input)) return null;
  const url = new URL(input.trim());
  const key = `${url.hostname}${url.pathname}`;
  if (shortLinkCache.has(key)) return shortLinkCache.get(key)!;

  let trackId: string | null = null;
  try {
    const res = await fetch(`https://${url.hostname}${url.pathname}`, {
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; link-resolver)" },
    });
    // Usually the redirect lands on open.spotify.com/track/<id>; otherwise
    // the landing page still mentions the track URL in its markup.
    trackId =
      res.url.match(TRACK_ID_IN_TEXT)?.[1] ??
      (await res.text()).match(TRACK_ID_IN_TEXT)?.[1] ??
      null;
  } catch (err) {
    console.error("Failed to resolve Spotify short link:", err);
    return null; // don't cache network failures
  }

  shortLinkCache.set(key, trackId);
  return trackId;
}

export function isValidTrackId(trackId: string) {
  return TRACK_ID_PATTERN.test(trackId);
}

async function fetchTrackFromOEmbed(trackId: string): Promise<TrackInfo | null> {
  // oEmbed is Spotify's public, key-less endpoint (the same source as the
  // embed player), so it does not count against the app's Web API rate limit.
  const trackUrl = `https://open.spotify.com/track/${trackId}`;
  const res = await fetch(
    `https://open.spotify.com/oembed?url=${encodeURIComponent(trackUrl)}`
  );

  if (!res.ok) {
    console.error(`Spotify oEmbed returned ${res.status} for track ${trackId}`);
    return null;
  }

  const data = await res.json();
  return {
    id: trackId,
    name: data.title || "",
    image: data.thumbnail_url || "",
  };
}

export async function getTrackById(trackId: string): Promise<TrackInfo | null> {
  const cached = trackCache.get(trackId);
  if (cached && Date.now() < cached.expires) return cached.info;

  const pending = inFlight.get(trackId);
  if (pending) return pending;

  const lookup = fetchTrackFromOEmbed(trackId)
    .catch((err) => {
      console.error(`Spotify oEmbed lookup failed for track ${trackId}:`, err);
      return null;
    })
    .then((info) => {
      trackCache.set(trackId, {
        info,
        expires: Date.now() + (info ? SUCCESS_TTL_MS : FAILURE_TTL_MS),
      });
      return info;
    })
    .finally(() => inFlight.delete(trackId));

  inFlight.set(trackId, lookup);
  return lookup;
}
