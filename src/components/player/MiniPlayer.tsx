"use client";

import { usePlayerStore } from "@/store/playerStore";
import { Play, Pause, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getCoverBlob, createObjectUrl } from "@/lib/indexed-db";
import { PremiumCover } from "@/components/ui/PremiumCover";
import { LikeButton } from "@/components/music/LikeButton";

export function MiniPlayer() {
  const currentSong = usePlayerStore((s) => {
    const playlist = s.playlist;
    const idx = s.currentIndex;
    return idx >= 0 && idx < playlist.length ? playlist[idx] : null;
  });
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const toggle = usePlayerStore((s) => s.toggle);
  const setFullscreen = usePlayerStore((s) => s.setFullscreen);
  const duration = usePlayerStore((s) => s.duration);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const playbackError = usePlayerStore((s) => s.playbackError);
  const [coverUrl, setCoverUrl] = useState("");

  const openFullscreen = useCallback(() => {
    setFullscreen(true);
  }, [setFullscreen]);

  useEffect(() => {
    if (!currentSong) { setCoverUrl(""); return; }
    if (currentSong.source === "static") {
      setCoverUrl(currentSong.coverUrl);
    } else {
      getCoverBlob(currentSong.id).then((blob) => {
        setCoverUrl(blob ? createObjectUrl(blob) : "");
      });
    }
  }, [currentSong]);

  if (!currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openFullscreen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openFullscreen();
        }
      }}
      className="w-full glass border-t border-border px-3 py-2.5 flex items-center gap-3 text-left active:bg-bg-hover transition-colors cursor-pointer relative"
      aria-label={`Now playing: ${currentSong.title} by ${currentSong.artist}. Tap to open full player.`}
    >
      {/* Progress bar */}
      <div className="mini-player-progress-bar">
        <div className="player-progress" style={{ width: `${progress}%` }} />
      </div>

      {/* Cover */}
      <div className="shrink-0">
        <PremiumCover
          src={coverUrl}
          alt={`${currentSong.title} cover`}
          size="sm"
          rounded="md"
          playing={isPlaying}
          sizes="44px"
        />
      </div>

      {/* Title / Artist */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate leading-tight">
          {currentSong.title}
        </p>
        {playbackError ? (
          <p className="text-xs text-red-400 truncate leading-tight mt-0.5">
            {playbackError}
          </p>
        ) : (
          <p className="text-xs text-text-secondary truncate leading-tight mt-0.5">
            {currentSong.artist}
          </p>
        )}
      </div>

      {/* Like button */}
      <LikeButton songId={currentSong.id} />

      {/* Play/Pause */}
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
            toggle();
          }
        }}
        className="w-11 h-11 flex items-center justify-center rounded-full text-text-primary shrink-0 active:scale-95 transition-transform cursor-pointer"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
        )}
      </div>
    </div>
  );
}