export interface Submission {
  id: number;
  name?: string;
  message?: string;
  track?: string | null;
}

export interface SubmissionWithTrack extends Submission {
  trackName?: string;
  trackImage?: string;
}

// Adds the song title and cover art to each submission. A failed lookup just
// leaves those fields empty so the card shows its placeholder.
export async function withTrackInfo(
  items: Submission[]
): Promise<SubmissionWithTrack[]> {
  return Promise.all(
    items.map(async (item) => {
      if (!item.track) return item;
      try {
        const res = await fetch(`/api/spotify/get?id=${item.track}`);
        if (!res.ok) return item;
        const data = await res.json();
        return { ...item, trackName: data.name, trackImage: data.image };
      } catch {
        return item;
      }
    })
  );
}
