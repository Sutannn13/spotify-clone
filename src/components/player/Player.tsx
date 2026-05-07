"use client";

import Image from "next/image";
import { usePlayerStore } from "@/store/playerStore";
import { PlayerControls } from "./PlayerControls";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";
import { clsx } from "clsx";

export function Player() {
  const currentSong = usePlayerStore((s) => {
    const playlist = s.playlist;
    const idx = s.currentIndex;
    return idx >= 0 ? playlist[idx] : null;
  });

  if (!currentSong) return null;

  return (
    <div className="glass border-t border-border px-4 py-3">
      <div className="flex items-center gap-4">
        {/* Now playing info */}
        <div className="flex items-center gap-3 w-64 min-w-0 shrink-0">
          <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0 bg-bg-hover">
            <Image
              src={currentSong.coverUrl}
              alt={currentSong.title}
              fill
              className="object-cover"
              sizes="48px"
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

        {/* Center — controls + progress */}
        <div className="flex-1 flex flex-col items-center gap-2 max-w-3xl mx-auto">
          <PlayerControls />
          <ProgressBar />
        </div>

        {/* Right — volume */}
        <div className="w-40 flex justify-end">
          <VolumeControl />
        </div>
      </div>
    </div>
  );
}
