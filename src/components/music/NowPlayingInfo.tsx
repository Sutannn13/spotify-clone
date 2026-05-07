"use client";

import { usePlayerStore } from "@/store/playerStore";
import { PremiumCover } from "@/components/ui/PremiumCover";

export function NowPlayingInfo() {
  const currentSong = usePlayerStore((s) => {
    const playlist = s.playlist;
    const idx = s.currentIndex;
    return idx >= 0 ? playlist[idx] : null;
  });

  if (!currentSong) return null;

  return (
    <div className="flex items-center gap-3">
      <PremiumCover
        src={currentSong.coverUrl}
        alt={currentSong.title}
        size="xs"
        rounded="sm"
        sizes="40px"
      />
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