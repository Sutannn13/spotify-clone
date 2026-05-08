"use client";

import { motion } from "framer-motion";
import { Play, Pause, Loader2, Trash2, ChevronUp, ChevronDown, ListMusic } from "lucide-react";
import { PremiumCover } from "@/components/ui/PremiumCover";
import { usePlayerStore } from "@/store/playerStore";
import { usePlaybackActions } from "@/hooks/usePlaybackActions";
import type { Song } from "@/data/songs.types";
import { clsx } from "clsx";
import { useState } from "react";

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
  const queue = usePlayerStore((s) => s.queue);
  const moveQueueItem = usePlayerStore((s) => s.moveQueueItem);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const clearQueue = usePlayerStore((s) => s.clearQueue);
  const { playOrPause } = usePlaybackActions();

  const [localQueue, setLocalQueue] = useState<Song[]>([]);
  const displayQueue = queue.length > 0 ? queue : localQueue;

  const handlePlay = (song: Song) => {
    playOrPause(song, displayQueue);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    if (queue.length > 0) {
      moveQueueItem(index, index - 1);
    } else {
      setLocalQueue(prev => {
        const newQueue = [...prev];
        const [item] = newQueue.splice(index, 1);
        newQueue.splice(index - 1, 0, item);
        return newQueue;
      });
    }
  };

  const handleMoveDown = (index: number) => {
    if (index >= displayQueue.length - 1) return;
    if (queue.length > 0) {
      moveQueueItem(index, index + 1);
    } else {
      setLocalQueue(prev => {
        const newQueue = [...prev];
        const [item] = newQueue.splice(index, 1);
        newQueue.splice(index + 1, 0, item);
        return newQueue;
      });
    }
  };

  const handleRemove = (songId: string) => {
    if (queue.length > 0) {
      removeFromQueue(songId);
    } else {
      setLocalQueue(prev => prev.filter(s => s.id !== songId));
    }
  };

  if (displayQueue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-text-muted py-16">
        <ListMusic className="w-10 h-10 opacity-30" />
        <p className="text-sm">Your queue is empty</p>
        <p className="text-xs">Play a song to start building your queue</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-4 pb-2 shrink-0 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Up Next — {displayQueue.length} song{displayQueue.length !== 1 ? "s" : ""}
        </p>
        {displayQueue.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (queue.length > 0) clearQueue();
              else setLocalQueue([]);
            }}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-3">
        {displayQueue.map((song, i) => {
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
                  "group flex items-center gap-2 px-3 py-3 rounded-xl transition-colors",
                  isCurrent ? "bg-bg-active" : "hover:bg-bg-hover"
                )}
              >
                {/* Drag handle / Number */}
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
                    type="button"
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
                <div
                  className="shrink-0 cursor-pointer"
                  onClick={() => handlePlay(song)}
                >
                  <PremiumCover
                    src={coverUrl}
                    alt={song.title}
                    size="sm"
                    rounded="lg"
                    sizes="44px"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handlePlay(song)}>
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
                <span className="text-xs text-text-muted tabular-nums shrink-0 hidden sm:block">
                  {formatDuration(song.duration)}
                </span>

                {/* Queue controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(i)}
                    disabled={i === 0}
                    className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(i)}
                    disabled={i === displayQueue.length - 1}
                    className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(song.id)}
                    className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-red-400 transition-colors"
                    aria-label="Remove from queue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
