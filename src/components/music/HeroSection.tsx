"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Clock, Music2 } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { usePlaybackActions } from "@/hooks/usePlaybackActions";
import { clsx } from "clsx";
import type { Song } from "@/data/songs.types";

interface HeroSectionProps {
  featuredSong: Song;
  getCover: (song: Song) => string;
}

export function HeroSection({ featuredSong, getCover }: HeroSectionProps) {
  const currentSong = usePlayerStore((s) => {
    const pl = s.playlist;
    const idx = s.currentIndex;
    return idx >= 0 && idx < pl.length ? pl[idx] : null;
  });
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const playlist = usePlayerStore((s) => s.playlist);

  const { playOrPause } = usePlaybackActions();

  const isCurrentSong = currentSong?.id === featuredSong.id;
  const isCurrentLoading = isCurrentSong && isLoading;
  const isCurrentPlaying = isCurrentSong && isPlaying && !isLoading;

  const coverUrl = getCover(featuredSong);

  const formatDuration = (s: number) => {
    if (!s) return "";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m} min ${sec} sec`;
  };

  return (
    <section className="relative px-4 md:px-8 pt-6 sm:pt-8 pb-8 sm:pb-12">
      {/* Subtle accent gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-[0.06] bg-[radial-gradient(circle,#e11d48,transparent_70%)]" />
      </div>

      <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
        {/* Cover */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-36 h-36 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-xl overflow-hidden shadow-2xl shadow-black/40 shrink-0"
        >
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={`${featuredSong.title} album cover`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 144px, (max-width: 768px) 160px, 208px"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-bg-elevated">
              <Music2 className="w-12 h-12 text-text-muted" />
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex flex-col gap-2 sm:gap-3 text-center sm:text-left w-full sm:w-auto min-w-0"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
            Featured
          </span>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-text-primary tracking-tight leading-tight sm:leading-none truncate">
            {featuredSong.title}
          </h1>

          <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 text-sm text-text-secondary flex-wrap">
            <span className="font-medium text-text-primary">
              {featuredSong.artist}
            </span>
            <span className="text-text-muted">·</span>
            <span className="truncate">{featuredSong.album || "Unknown Album"}</span>
            {featuredSong.duration > 0 && (
              <>
                <span className="text-text-muted hidden sm:inline">·</span>
                <span className="hidden sm:flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(featuredSong.duration)}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 mt-1 sm:mt-2">
            <button
              type="button"
              onClick={() => playOrPause(featuredSong, playlist.length > 0 ? playlist : [featuredSong])}
              className={clsx(
                "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all min-w-[120px] justify-center min-h-[44px]",
                isCurrentSong
                  ? "bg-accent text-white"
                  : "bg-text-primary text-bg-base hover:scale-105 active:scale-95"
              )}
              aria-label={
                isCurrentLoading
                  ? "Loading"
                  : isCurrentPlaying
                    ? "Pause"
                    : "Play Now"
              }
            >
              {isCurrentLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isCurrentPlaying ? (
                <span className="flex items-end gap-0.5">
                  <span className="w-0.5 h-3 bg-white rounded-full animate-eq-1" />
                  <span className="w-0.5 h-3 bg-white rounded-full animate-eq-2" />
                  <span className="w-0.5 h-3 bg-white rounded-full animate-eq-3" />
                </span>
              ) : (
                <>
                  <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                  {isCurrentSong && !isPlaying ? "Resume" : "Play Now"}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
