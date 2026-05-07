"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { SongList } from "@/components/music/SongList";
import { EmptyLibrary } from "@/components/music/EmptyLibrary";
import { useSongLibrary } from "@/hooks/SongLibraryProvider";
import { getCoverBlob, createObjectUrl } from "@/lib/indexed-db";
import { useState, useEffect, useCallback } from "react";
import type { Song } from "@/data/songs.types";
import { useLayout } from "@/components/layout/MainLayout";

export default function LibraryPage() {
  const { allSongs, localSongs, isLoading } = useSongLibrary();
  const { openDeleteSong } = useLayout();
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

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (allSongs.length === 0) {
    return (
      <MainLayout>
        <EmptyLibrary />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Your Library
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {localSongs.length} uploaded · {allSongs.length - localSongs.length} built-in
            </p>
          </div>
        </div>

        <div className="border-b border-border pb-4 mb-6">
          <SongList
            songs={allSongs}
            getCover={getCover}
            onDeleteSong={openDeleteSong}
          />
        </div>

        <div className="h-8" />
      </div>
    </MainLayout>
  );
}