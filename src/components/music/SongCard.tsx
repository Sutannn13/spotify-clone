"use client";

import { motion } from "framer-motion";
import { Play, Pause, Loader2 } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { usePlaybackActions } from "@/hooks/usePlaybackActions";
import { LikeButton } from "./LikeButton";
import { SongActionsMenu } from "./SongActionsMenu";
import { PremiumCover } from "@/components/ui/PremiumCover";
import type { Song } from "@/data/songs.types";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { isLikedSong, toggleLike } from "@/lib/storage";

interface SongCardProps {
  song: Song;
  getCover: (song: Song) => string;
  onDeleteSong?: (song: Song) => void;
  onEditSong?: (song: Song) => void;
}

export function SongCard({ song, getCover, onDeleteSong, onEditSong }: SongCardProps) {
  const currentSong = usePlayerStore((s) => {
    const pl = s.playlist;
    const idx = s.currentIndex;
    return idx >= 0 && idx < pl.length ? pl[idx] : null;
  });
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const playlist = usePlayerStore((s) => s.playlist);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const [, forceLikesSync] = useState(0);

  const { playOrPause } = usePlaybackActions();

  const isCurrentSong = currentSong?.id === song.id;
  const isCurrentlyLoading = isCurrentSong && isLoading;
  const isCurrentlyPlaying = isCurrentSong && isPlaying;
  const coverUrl = getCover(song);
  const liked = isLikedSong(song.id);

  useEffect(() => {
    const handleLikesChanged = () => {
      forceLikesSync((v) => v + 1);
    };
    window.addEventListener("aura-likes-changed", handleLikesChanged);
    return () => {
      window.removeEventListener("aura-likes-changed", handleLikesChanged);
    };
  }, []);

  const handlePlay = (targetSong: Song) => {
    const list = playlist.length > 0 ? playlist : [targetSong];
    playOrPause(targetSong, list);
  };

  const handleToggleLike = async (targetSong: Song) => {
    await toggleLike(targetSong.id, targetSong.source);
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col"
    >
      {/* Cover with 3D tilt */}
      <div className="relative overflow-visible aspect-square">
        <PremiumCover
          src={coverUrl}
          alt={`${song.title} cover`}
          size="xl"
          rounded="lg"
          tilt
          playing={isCurrentlyPlaying}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
          className="w-full h-full"
        />

        {/* Play overlay */}
        <div
          className={clsx(
            "absolute inset-0 flex items-center justify-center transition-opacity cursor-pointer z-20 rounded-lg",
            isCurrentSong ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          onClick={() => handlePlay(song)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handlePlay(song);
          }}
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
        </div>

        <div className="absolute top-2 right-2 z-30">
          <SongActionsMenu
            song={song}
            isCurrent={isCurrentSong}
            isPlaying={isPlaying}
            isLiked={liked}
            onPlayPause={handlePlay}
            onAddToQueue={addToQueue}
            onToggleLike={handleToggleLike}
            onEdit={onEditSong}
            onDelete={onDeleteSong}
            triggerClassName="bg-black/60 hover:bg-black/75 text-white/85 hover:text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          />
        </div>

        {/* Now playing equalizer indicator */}
        {isCurrentSong && isCurrentlyPlaying && (
          <div className="absolute bottom-2 right-2 z-20 eq-bar-active" aria-label="Now playing">
            <span className="animate-eq-1" style={{ height: "8px" }} />
            <span className="animate-eq-2" style={{ height: "6px" }} />
            <span className="animate-eq-3" style={{ height: "10px" }} />
          </div>
        )}

        {/* Paused indicator dot */}
        {isCurrentSong && !isCurrentlyLoading && !isPlaying && (
          <div className="absolute bottom-2 right-2 z-20">
            <div className="w-2 h-2 rounded-full bg-accent" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            {song.title}
          </p>
          <p className="text-xs text-text-secondary truncate mt-0.5">
            {song.artist}
          </p>
        </div>
        <LikeButton songId={song.id} />
      </div>
    </motion.div>
  );
}
