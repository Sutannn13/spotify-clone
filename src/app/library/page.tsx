"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { SongList } from "@/components/music/SongList";
import { EmptyLibrary } from "@/components/music/EmptyLibrary";
import { useSongLibrary } from "@/hooks/SongLibraryProvider";
import { getCoverBlob, createObjectUrl } from "@/lib/indexed-db";
import { useState, useEffect, useCallback, useMemo } from "react";
import type { Song } from "@/data/songs.types";
import { useLayout } from "@/components/layout/MainLayout";
import { clsx } from "clsx";
import { isLikedSong } from "@/lib/storage";

type FilterKey =
  | "all"
  | "static"
  | "local"
  | "liked"
  | "has-lyrics"
  | "no-lyrics"
  | "chill"
  | "late-night"
  | "energetic"
  | "pop"
  | "electronic";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "static", label: "Built-in" },
  { key: "local", label: "Local Uploads" },
  { key: "liked", label: "Liked" },
  { key: "has-lyrics", label: "Has Lyrics" },
  { key: "no-lyrics", label: "No Lyrics" },
  { key: "chill", label: "Chill" },
  { key: "late-night", label: "Late Night" },
  { key: "energetic", label: "Energetic" },
  { key: "pop", label: "Pop" },
  { key: "electronic", label: "Electronic" },
];

function matchesFilter(song: Song, filter: FilterKey): boolean {
  switch (filter) {
    case "all": return true;
    case "static": return song.source === "static";
    case "local": return song.source === "local";
    case "liked": return isLikedSong(song.id);
    case "has-lyrics": return song.lyricsType !== "none" && song.lyrics.trim() !== "";
    case "no-lyrics": return song.lyricsType === "none" || song.lyrics.trim() === "";
    case "chill": return /chill/i.test(song.mood ?? "");
    case "late-night": return /late.?night/i.test(song.mood ?? "");
    case "energetic": return /energetic|workout/i.test(song.mood ?? "");
    case "pop": return /pop/i.test(song.genre ?? "");
    case "electronic": return /electronic/i.test(song.genre ?? "");
    default: return true;
  }
}

export default function LibraryPage() {
  const { allSongs, localSongs, isLoading } = useSongLibrary();
  const { openDeleteSong } = useLayout();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
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

  const filtered = useMemo(
    () => allSongs.filter((s) => matchesFilter(s, activeFilter)),
    [allSongs, activeFilter]
  );

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Your Library
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {localSongs.length} uploaded · {allSongs.length - localSongs.length} built-in
          </p>
        </div>

        {/* Filter chips — horizontal scroll on mobile */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActiveFilter(f.key)}
              className={clsx(
                "shrink-0 px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all min-h-[36px]",
                activeFilter === f.key
                  ? "bg-text-primary text-bg-base"
                  : "bg-bg-elevated text-text-secondary hover:text-text-primary border border-border"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Result count */}
        <p className="text-xs text-text-muted mb-4">
          {filtered.length} song{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Song list or empty state */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <p className="text-sm font-medium text-text-primary">No songs match this filter</p>
            <p className="text-xs text-text-secondary">
              Try a different filter or add more songs
            </p>
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className="mt-2 px-4 py-2 rounded-full text-xs font-medium border border-border text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              Show all songs
            </button>
          </div>
        ) : (
          <div className="border-b border-border pb-4">
            <SongList
              songs={filtered}
              getCover={getCover}
              onDeleteSong={openDeleteSong}
            />
          </div>
        )}

        <div className="h-8" />
      </div>
    </MainLayout>
  );
}
