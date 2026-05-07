"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Pause, Loader2 } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import type { Song } from "@/data/songs.types";
import { clsx } from "clsx";
import { Music2, Trash2 } from "lucide-react";

interface SongCardProps {
  song: Song;
  getCover: (song: Song) => string;
  onDeleteSong?: (song: Song) => void;
}

export function SongCard({ song, getCover, onDeleteSong }: SongCardProps) {
  const currentSong = usePlayerStore((s) => {
    const playlist = s.playlist;
    const idx = s.currentIndex;
    return idx >= 0 ? playlist[idx] : null;
  });
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const playSong = usePlayerStore((s) => s.playSong);
  const toggle = usePlayerStore((s) => s.toggle);
  const playlist = usePlayerStore((s) => s.playlist);

  const isCurrentSong = currentSong?.id === song.id;
  const isCurrentlyLoading = isCurrentSong && isLoading;
  const coverUrl = getCover(song);

  const handlePlay = () => {
    if (isCurrentSong) {
      toggle();
    } else {
      playSong(song, playlist.length > 0 ? playlist : [song]);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSong?.(song);
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col"
    >
      {/* Cover */}
      <div className="relative overflow-hidden rounded-lg bg-bg-hover aspect-square">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={song.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-bg-elevated">
            <Music2 className="w-10 h-10 text-text-muted" />
          </div>
        )}

        {/* Play overlay */}
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 8 }}
          whileHover={{ opacity: 1, y: 0 }}
          className={clsx(
            "absolute inset-0 flex items-center justify-center transition-opacity",
            isCurrentSong ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          onClick={handlePlay}
          aria-label={isCurrentSong && isPlaying ? "Pause" : "Play"}
        >
          <div className="w-12 h-12 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center shadow-lg">
            {isCurrentlyLoading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : isCurrentSong && isPlaying ? (
              <Pause className="w-5 h-5 text-white" fill="currentColor" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
            )}
          </div>
        </motion.button>

        {/* Delete button (local songs only) */}
        {song.source === "local" && onDeleteSong && (
          <button
            type="button"
            onClick={handleDelete}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
            aria-label="Delete song"
          >
            <Trash2 className="w-3.5 h-3.5 text-white" />
          </button>
        )}

        {/* Now playing indicator */}
        {isCurrentSong && !isCurrentlyLoading && !isPlaying && (
          <div className="absolute bottom-2 right-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3">
        <p className="text-sm font-medium text-text-primary truncate">
          {song.title}
        </p>
        <p className="text-xs text-text-secondary truncate mt-0.5">
          {song.artist}
        </p>
      </div>
    </motion.div>
  );
}