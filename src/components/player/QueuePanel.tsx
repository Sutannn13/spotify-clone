"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Pause, Loader2, Clock, Music2 } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import type { Song } from "@/data/songs.types";
import { clsx } from "clsx";

interface QueuePanelProps {
  songs: Song[];
  coverResolver: (song: Song) => string;
}

function formatDuration(s: number): string {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function QueuePanel({ songs, coverResolver }: QueuePanelProps) {
  const currentSong = usePlayerStore((s) => {
    const playlist = s.playlist;
    const idx = s.currentIndex;
    return idx >= 0 ? playlist[idx] : null;
  });
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const playSong = usePlayerStore((s) => s.playSong);
  const toggle = usePlayerStore((s) => s.toggle);

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      toggle();
    } else {
      playSong(song, songs);
    }
  };

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-text-muted py-16">
        <Music2 className="w-10 h-10 opacity-30" />
        <p className="text-sm">Your queue is empty</p>
        <p className="text-xs">Play a song to start building your queue</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-4 pb-2 shrink-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Up Next — {songs.length} song{songs.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-3">
        {songs.map((song, i) => {
          const isCurrent = currentSong?.id === song.id;
          const isCurrentLoading = isCurrent && isLoading;
          const isCurrentPlaying = isCurrent && isPlaying;
          const coverUrl = coverResolver(song);

          return (
            <motion.div
              key={`${song.id}-${i}`}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div
                className={clsx(
                  "group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors",
                  isCurrent ? "bg-bg-active" : "hover:bg-bg-hover"
                )}
                onClick={() => handlePlay(song)}
              >
                {/* Number / Playing */}
                <div className="w-6 flex items-center justify-center shrink-0">
                  <span
                    className={clsx(
                      "text-sm tabular-nums transition-opacity",
                      isCurrent ? "hidden" : "group-hover:hidden text-text-muted"
                    )}
                  >
                    {i + 1}
                  </span>
                  <button
                    className={clsx(
                      "hidden transition-opacity",
                      isCurrent ? "block" : "group-hover:block"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay(song);
                    }}
                    aria-label={isCurrentPlaying ? "Pause" : "Play"}
                  >
                    {isCurrentLoading ? (
                      <Loader2 className="w-4 h-4 text-accent animate-spin" />
                    ) : isCurrentPlaying ? (
                      <Pause className="w-4 h-4 text-accent" fill="currentColor" />
                    ) : (
                      <Play className="w-4 h-4 text-text-secondary" fill="currentColor" />
                    )}
                  </button>
                </div>

                {/* Cover */}
                <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-bg-hover">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={song.title}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music2 className="w-4 h-4 text-text-muted" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={clsx(
                      "text-sm font-medium truncate leading-tight",
                      isCurrent ? "text-accent" : "text-text-primary"
                    )}
                  >
                    {song.title}
                  </p>
                  <p className="text-xs text-text-secondary truncate leading-tight mt-0.5">
                    {song.artist}
                  </p>
                </div>

                {/* Duration */}
                <span className="text-xs text-text-muted tabular-nums shrink-0">
                  {formatDuration(song.duration)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}