"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { usePlayerStore } from "@/store/playerStore";
import { Play, Pause, Loader2 } from "lucide-react";
import { clsx } from "clsx";

export function MiniPlayer() {
  const currentSong = usePlayerStore((s) => {
    const playlist = s.playlist;
    const idx = s.currentIndex;
    return idx >= 0 ? playlist[idx] : null;
  });
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const toggle = usePlayerStore((s) => s.toggle);
  const setFullscreen = usePlayerStore((s) => s.setFullscreen);
  const duration = usePlayerStore((s) => s.duration);
  const currentTime = usePlayerStore((s) => s.currentTime);

  if (!currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <button
      onClick={() => setFullscreen(true)}
      className="w-full glass border-t border-border px-4 py-3 flex items-center gap-3 text-left active:bg-bg-hover transition-colors"
    >
      {/* Cover */}
      <div className="relative w-11 h-11 rounded-md overflow-hidden shrink-0 bg-bg-hover">
        <Image
          src={currentSong.coverUrl}
          alt={currentSong.title}
          fill
          className="object-cover"
          sizes="44px"
        />
      </div>

      {/* Title / Artist */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate leading-tight">
          {currentSong.title}
        </p>
        <p className="text-xs text-text-secondary truncate leading-tight mt-0.5">
          {currentSong.artist}
        </p>
      </div>

      {/* Play/Pause */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        className="w-11 h-11 flex items-center justify-center rounded-full text-text-primary shrink-0"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
        )}
      </button>

      {/* Progress bar at top of bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-border/40">
        <div
          className="h-full bg-text-primary rounded-r-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </button>
  );
}
