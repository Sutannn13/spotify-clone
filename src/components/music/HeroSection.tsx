"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Clock, Music } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { clsx } from "clsx";
import { songs as allSongs } from "@/data/songs";

interface HeroSectionProps {
  featuredSong?: (typeof allSongs)[number];
}

export function HeroSection({ featuredSong }: HeroSectionProps) {
  const playSong = usePlayerStore((s) => s.playSong);
  const currentSong = usePlayerStore((s) => {
    const playlist = s.playlist;
    const idx = s.currentIndex;
    return idx >= 0 ? playlist[idx] : null;
  });
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isLoading = usePlayerStore((s) => s.isLoading);

  const isCurrentSong = currentSong?.id === featuredSong?.id;
  const isCurrentLoading = isCurrentSong && isLoading;

  const handlePlay = () => {
    if (featuredSong) {
      playSong(featuredSong, allSongs);
    }
  };

  if (!featuredSong) return null;

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m} min ${sec} sec`;
  };

  return (
    <section className="relative px-4 md:px-8 pt-8 pb-12">
      {/* Gradient accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-[0.06]"
          style={{
            background: `radial-gradient(circle, #e11d48 0%, transparent 70%)`,
          }}
        />
      </div>

      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Cover */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-40 h-40 md:w-52 md:h-52 rounded-xl overflow-hidden shadow-2xl shadow-black/40 shrink-0"
        >
          <Image
            src={featuredSong.coverUrl}
            alt={featuredSong.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 160px, 208px"
            priority
          />
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
              Featured
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight leading-none">
            {featuredSong.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <span className="font-medium text-text-primary">
              {featuredSong.artist}
            </span>
            <span className="text-text-muted">·</span>
            <span>{featuredSong.album}</span>
            {featuredSong.duration && (
              <>
                <span className="text-text-muted">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(featuredSong.duration)}
                </span>
              </>
            )}
          </div>

          <p className="text-sm text-text-secondary leading-relaxed max-w-lg mt-1">
            A mesmerizing composition that captures the essence of contemporary
            sound. Perfect for late-night listening sessions.
          </p>

          {/* Play button */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handlePlay}
              className={clsx(
                "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all",
                isCurrentSong
                  ? "bg-accent text-white"
                  : "bg-text-primary text-bg-base hover:scale-105 active:scale-95"
              )}
            >
              {isCurrentLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isCurrentSong && isPlaying ? (
                <>
                  <div className="w-4 h-4 flex items-end gap-0.5">
                    <span className="w-0.5 h-3 bg-white rounded-full animate-pulse" style={{ animationDuration: "0.4s" }} />
                    <span className="w-0.5 h-3 bg-white rounded-full animate-pulse" style={{ animationDuration: "0.4s", animationDelay: "0.15s" }} />
                    <span className="w-0.5 h-3 bg-white rounded-full animate-pulse" style={{ animationDuration: "0.4s", animationDelay: "0.3s" }} />
                  </div>
                  Playing
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                  Play Now
                </>
              )}
            </button>

            <button
              onClick={handlePlay}
              className="px-5 py-2.5 rounded-full text-sm font-medium text-text-secondary border border-border hover:border-border-focus hover:text-text-primary transition-colors"
            >
              Add to Queue
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}