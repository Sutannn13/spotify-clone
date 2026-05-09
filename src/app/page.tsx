"use client";

import { HeroSection } from "@/components/music/HeroSection";
import { SongCard } from "@/components/music/SongCard";
import { SongList } from "@/components/music/SongList";
import { EmptyLibrary } from "@/components/music/EmptyLibrary";
import { useSongLibrary } from "@/hooks/SongLibraryProvider";
import { motion } from "framer-motion";
import type { Song } from "@/data/songs.types";
import { useMemo } from "react";
import { Sparkles } from "lucide-react";

/** IDs of recently added static songs, newest first */
const NEWLY_ADDED_IDS = [
  "static-ariana-grande-bye",
  "static-rex-orange-county-happiness",
  "static-yad-english",
  "static-meduza-lose-control",
  "static-moth-to-a-flame",
  "static-tante-culik-aku-dong",
];

export default function HomePage() {
  const { allSongs, isLoading, getCoverUrl } = useSongLibrary();

  const getCover = useMemo(
    () => (song: Song) => getCoverUrl(song),
    [getCoverUrl]
  );

  const newlyAdded = useMemo(
    () =>
      NEWLY_ADDED_IDS
        .map((id) => allSongs.find((s) => s.id === id))
        .filter(Boolean) as Song[],
    [allSongs]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (allSongs.length === 0) {
    return <EmptyLibrary />;
  }

  const featuredSong = allSongs[0];
  const gridSongs = allSongs.slice(1);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <HeroSection featuredSong={featuredSong} getCover={getCover} />

      {/* Newly Added section */}
      {newlyAdded.length > 0 && (
        <section className="px-4 md:px-8 py-6">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-4 h-4 text-accent" />
            <h2 className="text-lg font-semibold text-text-primary tracking-tight">
              Newly Added
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {newlyAdded.map((song, i) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
              >
                <SongCard song={song} getCover={getCover} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

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
  );
}