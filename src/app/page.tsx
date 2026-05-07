"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { HeroSection } from "@/components/music/HeroSection";
import { SongCard } from "@/components/music/SongCard";
import { SongList } from "@/components/music/SongList";
import { EmptyLibrary } from "@/components/music/EmptyLibrary";
import { useSongLibrary } from "@/hooks/SongLibraryProvider";
import { getCoverBlob, createObjectUrl } from "@/lib/indexed-db";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import type { Song } from "@/data/songs.types";

export default function HomePage() {
  const { allSongs, isLoading } = useSongLibrary();
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

  const featuredSong = allSongs[0];
  const gridSongs = allSongs.slice(1);

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Hero */}
        <HeroSection featuredSong={featuredSong} getCover={getCover} />

        {/* Song grid */}
        {gridSongs.length > 0 && (
          <section className="px-4 md:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                More to Explore
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {gridSongs.map((song, i) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                >
                  <SongCard song={song} getCover={getCover} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Full song list */}
        <section className="px-4 md:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary tracking-tight">
              Your Library
            </h2>
          </div>
          <SongList songs={allSongs} getCover={getCover} />
        </section>

        <div className="h-8" />
      </div>
    </MainLayout>
  );
}
