"use client";

import { usePlayerStore } from "@/store/playerStore";
import { Volume2, Volume1, VolumeX } from "lucide-react";
import { clsx } from "clsx";

export function VolumeControl({ className }: { className?: string }) {
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);

  const displayVolume = isMuted ? 0 : volume;

  const VolumeIcon =
    displayVolume === 0
      ? VolumeX
      : displayVolume < 0.5
        ? Volume1
        : Volume2;

  return (
    <div className={clsx("flex items-center gap-2 group", className)}>
      <button
        onClick={toggleMute}
        className="w-8 h-8 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary transition-colors shrink-0"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        <VolumeIcon className="w-4 h-4" />
      </button>

      <div className="relative w-24 h-1.5 bg-border/40 rounded-full cursor-pointer group-hover:h-2 transition-all">
        <div
          className="absolute left-0 top-0 h-full bg-text-primary rounded-full transition-all"
          style={{ width: `${displayVolume * 100}%` }}
        />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={displayVolume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          aria-label="Volume"
        />
      </div>
    </div>
  );
}