"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { HeroSection } from "@/components/music/HeroSection";
import { SongCard } from "@/components/music/SongCard";
import { SongList } from "@/components/music/SongList";
import { songs } from "@/data/songs";
import { motion } from "framer-motion";

export default function HomePage() {
  const featuredSong = songs[0];
  const gridSongs = songs.slice(1);

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Hero */}
        <HeroSection featuredSong={featuredSong} />

        {/* Song grid */}
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
                <SongCard song={song} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Full song list */}
        <section className="px-4 md:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary tracking-tight">
              Your Library
            </h2>
          </div>
          <SongList songs={songs} />
        </section>

        {/* Bottom spacing */}
        <div className="h-8" />
      </div>
    </MainLayout>
  );
}
