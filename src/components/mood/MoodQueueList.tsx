"use client";

import { type Song } from "@/data/songs.types";
import { useSongLibrary } from "@/hooks/SongLibraryProvider";
import { usePlaybackActions } from "@/hooks/usePlaybackActions";
import { usePlayerStore } from "@/store/playerStore";
import { Play } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";

function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface MoodQueueListProps {
  songs: Song[];
  /** Called when user clicks a song — provides the full mood queue as playlist. */
  onPlay: (song: Song, queue: Song[]) => void;
}

export function MoodQueueList({ songs, onPlay }: MoodQueueListProps) {
  const { getCoverUrl } = useSongLibrary();
  const { playOrPause } = usePlaybackActions();
  const currentSong = usePlayerStore((s) => {
    const idx = s.currentIndex;
    const pl = s.playlist;
    return idx >= 0 && idx < pl.length ? pl[idx] : null;
  });
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  const handlePlay = (song: Song) => {
    playOrPause(song, songs);
    onPlay(song, songs);
  };

  return (
    <div className="space-y-1">
      {songs.map((song, index) => {
        const isActive = currentSong?.id === song.id;
        const coverUrl = getCoverUrl(song);

        return (
          <motion.div
            key={song.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.03, 0.6), duration: 0.2 }}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group cursor-pointer",
              isActive ? "bg-bg-elevated" : "hover:bg-bg-elevated/50"
            )}
            onClick={() => handlePlay(song)}
          >
            {/* Number / Play indicator */}
            <div className="w-8 flex items-center justify-center shrink-0">
              {isActive && isPlaying ? (
                <div className="flex items-center gap-0.5 eq-bar-active" aria-label="Now playing">
                  <span className="animate-eq-1" />
                  <span className="animate-eq-2" />
                  <span className="animate-eq-3" />
                </div>
              ) : (
                <span className="text-xs text-text-muted group-hover:hidden">
                  {index + 1}
                </span>
              )}
              {!isActive && (
                <button
                  type="button"
                  aria-label={`Play ${song.title}`}
                  className="hidden group-hover:flex w-6 h-6 items-center justify-center rounded-full bg-accent text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlay(song);
                  }}
                >
                  <Play className="w-3 h-3" fill="currentColor" />
                </button>
              )}
            </div>

            {/* Cover */}
            <div className="w-10 h-10 rounded-md overflow-hidden bg-bg-base shrink-0">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="w-4 h-4 text-text-muted" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className={clsx(
                "text-sm font-medium truncate",
                isActive ? "text-accent" : "text-text-primary"
              )}>
                {song.title}
              </p>
              <p className="text-xs text-text-secondary truncate">
                {song.artist} {song.genre && `· ${song.genre}`}
              </p>
            </div>

            {/* Duration */}
            <span className="text-xs text-text-muted shrink-0">
              {formatDuration(song.duration)}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}