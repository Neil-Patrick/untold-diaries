"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Background from "@/components/background/Background";
import Card from "@/components/Card";
import { Submission, SubmissionWithTrack, withTrackInfo } from "@/lib/tracks";

const PAGE_SIZE = 12;

export default function Browse() {
  const [query, setQuery] = useState("");
  // When set, we're paging through search results instead of all submissions.
  const [searchResults, setSearchResults] = useState<Submission[] | null>(null);
  const [page, setPage] = useState(1);
  // What's typed in the page box; kept separate so typing doesn't navigate.
  const [pageInput, setPageInput] = useState("1");
  const [totalPages, setTotalPages] = useState(1);
  const [items, setItems] = useState<SubmissionWithTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep the page box in sync when the arrows or a new search change the page.
  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let pageItems: Submission[];

        if (searchResults) {
          // Search returns every match, so page through it here.
          setTotalPages(Math.max(1, Math.ceil(searchResults.length / PAGE_SIZE)));
          pageItems = searchResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
        } else {
          const res = await fetch(
            `/api/submissions?page=${page}&page_size=${PAGE_SIZE}`
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          setTotalPages(data.total_pages);
          pageItems = data.items;
        }

        const enhanced = await withTrackInfo(pageItems);
        if (!cancelled) setItems(enhanced);
      } catch (err) {
        console.error("Failed to load stories:", err);
        if (!cancelled) {
          setItems([]);
          setError("Couldn't load stories. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [page, searchResults]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setPage(1);

    if (!q) {
      setSearchResults(null);
      return;
    }

    try {
      const res = await fetch(`/api/submissions/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSearchResults(null);
    setPage(1);
  };

  const goToPage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Jump to the typed page, clamped to the valid range; blank or invalid
  // input just snaps back to the current page.
  const submitPageInput = () => {
    const typed = parseInt(pageInput, 10);
    if (Number.isNaN(typed)) {
      setPageInput(String(page));
      return;
    }
    const target = Math.min(Math.max(typed, 1), totalPages);
    setPageInput(String(target));
    if (target !== page) goToPage(target);
  };

  return (
    <>
      <Background />
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <form
          onSubmit={handleSearch}
          className="mx-auto flex w-full max-w-2xl gap-2 pb-10 font-tertiary"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by recipient..."
            className="min-w-0 flex-1 rounded-4xl border border-[#7f64a0] px-4 py-2 text-[#c296f8] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="shrink-0 rounded-4xl border border-[#7f64a0] bg-[#3E166E] px-4 py-2 text-white transition hover:border-[#7f64a0] hover:bg-[#0A0D17]"
          >
            Find
          </button>
        </form>

        {searchResults && (
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-300 font-tertiary">
            <span>
              {searchResults.length} {searchResults.length === 1 ? "story" : "stories"} found
            </span>
            <button
              type="button"
              onClick={clearSearch}
              className="text-[#c296f8] underline underline-offset-4 hover:text-white"
            >
              Show all stories
            </button>
          </div>
        )}

        {error ? (
          <p className="py-20 text-center text-red-400 font-tertiary">{error}</p>
        ) : !loading && items.length === 0 ? (
          <p className="py-20 text-center text-gray-400 font-tertiary">No stories found.</p>
        ) : (
          <ul
            className={`grid grid-cols-[repeat(auto-fill,minmax(min(322px,100%),1fr))] justify-items-center gap-x-6 gap-y-10 transition-opacity ${
              loading ? "opacity-50" : "opacity-100"
            }`}
          >
            {items.map((item) => (
              <li key={item.id}>
                <Card
                  id={item.id}
                  name={item.name}
                  message={item.message}
                  trackName={item.trackName}
                  trackImage={item.trackImage}
                />
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="mt-12 flex items-center justify-center gap-4 font-tertiary text-white"
          >
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || loading}
              aria-label="Previous page"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#7f64a0] bg-[#3E166E] transition hover:bg-[#0A0D17] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#3E166E]"
            >
              <ChevronLeft size={22} />
            </button>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitPageInput();
              }}
              className="flex items-center gap-2 text-sm text-gray-300"
            >
              <label htmlFor="page-input">Page</label>
              <input
                id="page-input"
                type="text"
                inputMode="numeric"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ""))}
                onBlur={submitPageInput}
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setPageInput(String(page));
                    e.currentTarget.blur();
                  }
                }}
                disabled={loading}
                aria-label={`Page number, 1 to ${totalPages}`}
                style={{ width: `${String(totalPages).length + 2.5}ch` }}
                className="rounded-lg border border-[#7f64a0] bg-[#ffffff11] py-1 text-center text-white focus:outline-none focus:ring-2 focus:ring-[#c296f8] disabled:opacity-60"
              />
              <span>of {totalPages}</span>
            </form>
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages || loading}
              aria-label="Next page"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#7f64a0] bg-[#3E166E] transition hover:bg-[#0A0D17] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#3E166E]"
            >
              <ChevronRight size={22} />
            </button>
          </nav>
        )}
      </main>
    </>
  );
}
