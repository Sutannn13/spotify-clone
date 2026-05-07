"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SongList } from "@/components/music/SongList";
import { useSongLibrary } from "@/hooks/SongLibraryProvider";
import { getCoverBlob, createObjectUrl } from "@/lib/indexed-db";
import { getLikedSongIds } from "@/lib/storage";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import type { Song } from "@/data/songs.types";

export default function LikedSongsPage() {
  const { allSongs, isLoading } = useSongLibrary();
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [coverMap, setCoverMap] = useState<Map<string, string>>(new Map());

  // Listen for liked song changes
  useEffect(() => {
    const load = () => setLikedIds(getLikedSongIds());
    load();

    const handleFocus = () => load();
    window.addEventListener("focus", handleFocus);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "aura-liked-songs") load();
    };
    window.addEventListener("storage", handleStorage);
    const handleLikeChange = () => load();
    window.addEventListener("aura-likes-changed", handleLikeChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("aura-likes-changed", handleLikeChange);
    };
  }, []);

  const likedSongs = useMemo(
    () =>
      likedIds
        .map((id) => allSongs.find((s) => s.id === id))
        .filter(Boolean) as Song[],
    [likedIds, allSongs]
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
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-accent-muted flex items-center justify-center shrink-0 shadow-lg shadow-accent/20">
            <Heart className="w-6 h-6 text-white" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Liked Songs
            </h1>
            <p className="text-sm text-text-secondary mt-0.5">
              {likedSongs.length} song{likedSongs.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Content */}
        {likedSongs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <div className="w-20 h-20 rounded-full bg-bg-elevated flex items-center justify-center border border-border">
              <Heart className="w-8 h-8 text-text-muted" />
            </div>
            <div className="text-center max-w-xs">
              <p className="text-sm font-medium text-text-primary">
                No liked songs yet
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Tap the heart icon on any song to save it here
              </p>
            </div>
          </motion.div>
        ) : (
          <SongList songs={likedSongs} getCover={getCover} />
        )}

        <div className="h-8" />
      </div>
    </MainLayout>
  );
}
