"use client";

import Image from "next/image";
import { usePlayerStore } from "@/store/playerStore";

export function NowPlayingInfo() {
  const currentSong = usePlayerStore((s) => {
    const playlist = s.playlist;
    const idx = s.currentIndex;
    return idx >= 0 ? playlist[idx] : null;
  });

  if (!currentSong) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10 rounded overflow-hidden shrink-0 bg-bg-hover">
        <Image
          src={currentSong.coverUrl}
          alt={currentSong.title}
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-primary truncate leading-tight">
          {currentSong.title}
        </p>
        <p className="text-xs text-text-secondary truncate leading-tight mt-0.5">
          {currentSong.artist}
        </p>
      </div>
    </div>
  );
}