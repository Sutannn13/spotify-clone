"use client";

import { useEffect, useState } from "react";
import { Play, Pause, Loader2 } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { usePlaybackActions } from "@/hooks/usePlaybackActions";
import { LikeButton } from "./LikeButton";
import { SongActionsMenu } from "./SongActionsMenu";
import { PremiumCover } from "@/components/ui/PremiumCover";
import type { Song } from "@/data/songs.types";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { isLikedSong, toggleLike } from "@/lib/storage";

interface SongListProps {
  songs: Song[];
  getCover: (song: Song) => string;
  onDeleteSong?: (song: Song) => void;
  onEditSong?: (song: Song) => void;
}

function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SongList({ songs, getCover, onDeleteSong, onEditSong }: SongListProps) {
  const currentSong = usePlayerStore((s) => {
    const pl = s.playlist;
    const idx = s.currentIndex;
    return idx >= 0 && idx < pl.length ? pl[idx] : null;
  });
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const [, forceLikesSync] = useState(0);

  const { playOrPause } = usePlaybackActions();

  useEffect(() => {
    const handleLikesChanged = () => {
      forceLikesSync((v) => v + 1);
    };

    window.addEventListener("aura-likes-changed", handleLikesChanged);
    return () => {
      window.removeEventListener("aura-likes-changed", handleLikesChanged);
    };
  }, []);

  const handlePlay = (song: Song) => {
    playOrPause(song, songs);
  };

  const handleToggleLike = async (song: Song) => {
    await toggleLike(song.id, song.source);
  };

  return (
    <div className="w-full">
      {/* Table header */}
      <div className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] md:grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-2 sm:gap-3 px-4 py-2 text-xs text-text-muted border-b border-border mb-2">
        <span className="w-8 text-center">#</span>
        <span>Title</span>
        <span className="hidden md:block">Album</span>
        <span className="hidden sm:block">Duration</span>
        <span className="w-7" />
        <span className="w-10" />
      </div>

      {/* Songs */}
      <div className="flex flex-col">
        {songs.map((song, i) => {
          const isCurrent = currentSong?.id === song.id;
          const isCurrentLoading = isCurrent && isLoading;
          const isCurrentPlaying = isCurrent && isPlaying;
          const coverUrl = getCover(song);
          const liked = isLikedSong(song.id);

          return (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.6), duration: 0.2 }}
            >
              <div
                className={clsx(
                  "group grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] md:grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-2 sm:gap-3 px-4 py-3 rounded-lg items-center transition-colors duration-150 cursor-pointer min-h-[56px]",
                  isCurrent ? "bg-bg-active" : "hover:bg-bg-hover"
                )}
                onClick={() => handlePlay(song)}
              >
                {/* Number / Playing indicator */}
                <div className="w-8 flex items-center justify-center shrink-0">
                  {isCurrentPlaying ? (
                    <div className="eq-bar-active" aria-label="Now playing">
                      <span className="animate-eq-1" style={{ height: "8px" }} />
                      <span className="animate-eq-2" style={{ height: "6px" }} />
                      <span className="animate-eq-3" style={{ height: "10px" }} />
                    </div>
                  ) : (
                    <>
                      <span
                        className={clsx(
                          "text-sm tabular-nums transition-opacity",
                          isCurrent ? "hidden" : "group-hover:hidden text-text-muted"
                        )}
                      >
                        {i + 1}
                      </span>
                      <span
                        className={clsx(
                          "hidden transition-opacity",
                          isCurrent ? "block" : "group-hover:block"
                        )}
                        aria-hidden="true"
                      >
                        {isCurrentLoading ? (
                          <Loader2 className="w-4 h-4 text-accent animate-spin" />
                        ) : isCurrent && !isPlaying ? (
                          <Pause className="w-4 h-4 text-accent" fill="currentColor" />
                        ) : (
                          <Play className="w-4 h-4 text-text-primary" fill="currentColor" />
                        )}
                      </span>
                    </>
                  )}
                </div>

                {/* Title + Artist */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0">
                    <PremiumCover
                      src={coverUrl}
                      alt={`${song.title} cover`}
                      size="xs"
                      rounded="sm"
                      sizes="40px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={clsx(
                        "text-sm font-medium truncate",
                        isCurrent ? "text-accent" : "text-text-primary"
                      )}
                    >
                      {song.title}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {song.artist}
                    </p>
                  </div>
                </div>

                {/* Album (desktop) */}
                <span className="hidden md:block text-sm text-text-secondary truncate">
                  {song.album || "Unknown Album"}
                </span>

                {/* Duration */}
                <span className="hidden sm:block text-sm text-text-muted tabular-nums">
                  {formatDuration(song.duration)}
                </span>

                {/* Like button */}
                <LikeButton songId={song.id} />

                {/* Actions */}
                <div className="w-10 flex items-center justify-center">
                  <SongActionsMenu
                    song={song}
                    isCurrent={isCurrent}
                    isPlaying={isPlaying}
                    isLiked={liked}
                    onPlayPause={handlePlay}
                    onAddToQueue={addToQueue}
                    onToggleLike={handleToggleLike}
                    onEdit={onEditSong}
                    onDelete={onDeleteSong}
                    triggerClassName="opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
