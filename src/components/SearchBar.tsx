/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import AsyncSelect from "react-select/async"; // Import AsyncSelect instead of Select
import debounce from "lodash.debounce";

type Artist = {
  name: string;
};

type Track = {
  id: string;
  name: string;
  artists: Artist[];
  image: string;
};

type OptionType = {
  value: string;
  label: string;
  track: Track;
};

interface SearchBarProps {
  setSelected: (option: OptionType | null) => void;
}

// Matches https://open.spotify.com/track/<id> (with optional /intl-xx/ and
// ?si=... share parameters) and spotify:track:<id> URIs.
const TRACK_LINK_PATTERN =
  /(?:spotify:track:|open\.spotify\.com\/(?:intl-[a-z-]+\/)?track\/)([A-Za-z0-9]{22})/i;

// Short links copied from the Spotify mobile app, e.g. https://spotify.link/AbC123
const SHORT_LINK_PATTERN = /^(?:https?:\/\/)?(spotify\.link|spotify\.app\.link)\/([A-Za-z0-9_-]+)/i;

function extractTrackId(input: string): string | null {
  return input.trim().match(TRACK_LINK_PATTERN)?.[1] ?? null;
}

// Returns the API route that can look up a pasted link, or null if the input
// isn't a Spotify song link (so it should be treated as a search instead).
function getLinkLookupUrl(input: string): string | null {
  const trackId = extractTrackId(input);
  if (trackId) return `/api/spotify/get?id=${trackId}`;

  const short = input.trim().match(SHORT_LINK_PATTERN);
  if (short) {
    const url = `https://${short[1].toLowerCase()}/${short[2]}`;
    return `/api/spotify/resolve?url=${encodeURIComponent(url)}`;
  }
  return null;
}

export default function SearchBar({ setSelected }: SearchBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [searchFailed, setSearchFailed] = useState(false);
  const [linkFailed, setLinkFailed] = useState(false);

  // Created once so the debounce actually groups keystrokes together, and
  // uses react-select's callback form so the debounced result reaches it.
  const fetchResults = useMemo(
    () =>
      debounce((q: string, callback: (options: OptionType[]) => void) => {
        if (!q.trim()) {
          callback([]);
          return;
        }

        // A pasted Spotify song link is looked up through the key-less
        // oEmbed route, so it works even when Spotify search is unavailable.
        const lookupUrl = getLinkLookupUrl(q);
        if (lookupUrl) {
          fetch(lookupUrl)
            .then(async (res) => {
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              const data = await res.json();
              const track: Track = {
                id: data.id,
                name: data.name || "Spotify track",
                artists: [],
                image: data.image || "",
              };
              setLinkFailed(false);
              callback([{ value: track.id, label: track.name, track }]);
            })
            .catch(() => {
              setLinkFailed(true);
              callback([]);
            });
          return;
        }

        fetch(`/api/spotify/search?q=${encodeURIComponent(q)}`)
          .then(async (res) => {
            const data = await res.json().catch(() => null);
            if (!res.ok || !Array.isArray(data)) {
              setSearchFailed(true);
              callback([]);
              return;
            }
            setSearchFailed(false);
            callback(
              (data as Track[]).map((track) => ({
                value: track.id,
                label: `${track.name} - ${track.artists.map((a) => a.name).join(", ")}`,
                track,
              }))
            );
          })
          .catch(() => {
            setSearchFailed(true);
            callback([]);
          });
      }, 300),
    []
  );

  useEffect(() => () => fetchResults.cancel(), [fetchResults]);

  const handleChange = (option: OptionType | null) => {
    setSelected(option);
  };

  const customSingleValue = ({ data }: any) => (
    <div className="flex items-center">
      {data.track.image && (
        <img src={data.track.image} className="w-6 h-6 rounded mr-2" alt="" />
      )}
      {data.label}
    </div>
  );


  const customOption = (props: any) => {
    const { data, innerRef, innerProps } = props;
    const { track } = data;

    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="flex items-center p-3 cursor-pointer"
      >
        {track.image && (
          <img src={track.image} className="w-10 h-10 rounded mr-3" alt="" />
        )}
        <div>
          <div className="font-medium">{track.name}</div>
          {track.artists.length > 0 && (
            <div className="text-sm text-gray-500">
              {track.artists.map((a: Artist) => a.name).join(", ")}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!mounted) return null;

  return (
    <div className="pt-5 pb-6">
      <AsyncSelect
        cacheOptions
        loadOptions={fetchResults}
        onChange={handleChange}
        components={{ SingleValue: customSingleValue, Option: customOption }}
        className="w-full"
        placeholder="Search a song or paste a Spotify link..."
        noOptionsMessage={({ inputValue }) =>
          !inputValue
            ? "Type a song name or paste a Spotify song link"
            : getLinkLookupUrl(inputValue)
            ? linkFailed
              ? "Couldn't find that song. Check the link and try again."
              : "No tracks found"
            : searchFailed
            ? "Search is unavailable. Paste a Spotify song link instead (Share → Copy Song Link)."
            : "No tracks found"
        }
        styles={{
    control: (baseStyles, state) => ({
      ...baseStyles,
      borderColor: state.isFocused ? '[#ffffff50]' : '[#ffffff50]',
      backgroundColor: '[#ffffff100]',
    }),
    input: (base) => ({
    ...base,
    color: '#fff',
    }),
    menu: (base) => ({
    ...base,
    backgroundColor: 'rgba(16, 14, 26, 0.96)',
    zIndex: 50,
    backdropFilter: 'blur(10px)', 
    border: '1px solid rgba(255,255,255,0.1)', 
    color: '#fff', 
    }),
  }}
      />
    </div>

  );
}
