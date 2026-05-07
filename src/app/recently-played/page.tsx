"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SongList } from "@/components/music/SongList";
import { useSongLibrary } from "@/hooks/SongLibraryProvider";
import { getCoverBlob, createObjectUrl } from "@/lib/indexed-db";
import { getRecentPlays } from "@/lib/storage";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";
import type { Song } from "@/data/songs.types";

export default function RecentlyPlayedPage() {
  const { allSongs, isLoading } = useSongLibrary();
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [coverMap, setCoverMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const load = () => {
      const plays = getRecentPlays();
      setRecentIds(plays.map((p) => p.songId));
    };
    load();

    // Poll for changes
    const interval = setInterval(load, 3000);
    const handleFocus = () => load();
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const recentSongs = useMemo(
    () =>
      recentIds
        .map((id) => allSongs.find((s) => s.id === id))
        .filter(Boolean) as Song[],
    [recentIds, allSongs]
  );

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

  return (
    <MainLayout>
      <div className="min-h-screen px-4 md:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-900 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/20">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Recently Played
            </h1>
            <p className="text-sm text-text-secondary mt-0.5">
              {recentSongs.length} song{recentSongs.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Content */}
        {recentSongs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <div className="w-20 h-20 rounded-full bg-bg-elevated flex items-center justify-center border border-border">
              <Clock className="w-8 h-8 text-text-muted" />
            </div>
            <div className="text-center max-w-xs">
              <p className="text-sm font-medium text-text-primary">
                No recently played songs
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Start listening to build your play history
              </p>
            </div>
          </motion.div>
        ) : (
          <SongList songs={recentSongs} getCover={getCover} />
        )}

        <div className="h-8" />
      </div>
    </MainLayout>
  );
}
