"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SongList } from "@/components/music/SongList";
import { useSongLibrary } from "@/hooks/SongLibraryProvider";
import { usePlayerStore } from "@/store/playerStore";
import { getCoverBlob, createObjectUrl } from "@/lib/indexed-db";
import { Search, X, Music2 } from "lucide-react";
import { clsx } from "clsx";
import type { Song } from "@/data/songs.types";

type FilterType = "all" | "songs" | "artists" | "albums" | "local" | "static";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "songs", label: "Songs" },
  { key: "artists", label: "Artists" },
  { key: "albums", label: "Albums" },
  { key: "local", label: "Local Uploads" },
  { key: "static", label: "Built-in" },
];

export default function SearchPage() {
  const { allSongs, isLoading } = useSongLibrary();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [coverMap, setCoverMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const load = async () => {
      const map = new Map<string, string>();
      for (const song of allSongs) {
        if (song.source === "static") {
          map.set(song.id, song.coverUrl);
        } else {
          const blob = await getCoverBlob(song.id);
          map.set(song.id, blob ? createObjectUrl(blob) : "");
        }
      }
      setCoverMap(map);
    };
    if (allSongs.length > 0) load();
  }, [allSongs]);

  const getCover = useCallback(
    (song: Song) => coverMap.get(song.id) ?? "",
    [coverMap]
  );

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    let filtered = allSongs.filter((song) => {
      const searchable = [
        song.title,
        song.artist,
        song.album,
        song.genre ?? "",
        song.mood ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(q);
    });

    // Apply source filter
    switch (activeFilter) {
      case "local":
        filtered = filtered.filter((s) => s.source === "local");
        break;
      case "static":
        filtered = filtered.filter((s) => s.source === "static");
        break;
      case "artists": {
        // Group by artist, show unique artists
        const seen = new Set<string>();
        filtered = filtered.filter((s) => {
          const key = s.artist.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        break;
      }
      case "albums": {
        const seen = new Set<string>();
        filtered = filtered.filter((s) => {
          const key = `${s.album}-${s.artist}`.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        break;
      }
      case "songs":
      case "all":
      default:
        break;
    }

    return filtered;
  }, [query, allSongs, activeFilter]);

  return (
    <MainLayout>
      <div className="min-h-screen px-4 md:px-8 py-6 md:py-8">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-4">
            Search
          </h1>

          {/* Search Input */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search songs, artists, albums..."
              className="w-full pl-11 pr-10 py-3 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-focus transition-colors"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        {query.trim() && (
          <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setActiveFilter(f.key)}
                className={clsx(
                  "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all min-h-[32px]",
                  activeFilter === f.key
                    ? "bg-text-primary text-bg-base"
                    : "bg-bg-elevated text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-border"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {!query.trim() ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center">
              <Search className="w-7 h-7 text-text-muted" />
            </div>
            <div className="text-center">
              <p className="text-sm text-text-secondary">
                Find songs, artists, and albums
              </p>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center">
              <Music2 className="w-7 h-7 text-text-muted" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-text-primary">
                No results found
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Try a different search term or filter
              </p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs text-text-muted mb-4">
              {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
            <SongList songs={results} getCover={getCover} />
          </div>
        )}

        <div className="h-8" />
      </div>
    </MainLayout>
  );
}
