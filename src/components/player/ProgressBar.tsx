"use client";

import { useCallback, useRef, useState } from "react";
import { usePlayerStore } from "@/store/playerStore";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

export function ProgressBar() {
  const { seek } = useAudioPlayer();
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const formatTime = (t: number) => {
    if (!isFinite(t) || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!barRef.current || duration === 0) return;
      const rect = barRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      seek(ratio * duration);
    },
    [duration, seek]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!barRef.current || duration === 0) return;
      const rect = barRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setHoverTime(ratio * duration);
    },
    [duration]
  );

  const handleMouseLeave = useCallback(() => setHoverTime(null), []);

  return (
    <div className="flex items-center gap-3 w-full group">
      <span className="text-xs text-text-muted tabular-nums w-9 text-right shrink-0">
        {formatTime(isDragging && hoverTime !== null ? hoverTime : currentTime)}
      </span>

      <div
        ref={barRef}
        className="relative flex-1 h-1.5 cursor-pointer rounded-full bg-border/60 group-hover:h-2 transition-all"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background */}
        <div className="absolute inset-0 rounded-full bg-border/40" />

        {/* Progress fill */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-text-primary transition-all"
          style={{ width: `${progress}%` }}
        />

        {/* Hover indicator */}
        {hoverTime !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-text-primary shadow-sm"
            style={{ left: `calc(${((hoverTime / duration) * 100).toFixed(1)}% - 6px)` }}
          />
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-accent animate-pulse"
            style={{ width: `${progress}%` }}
          />
        )}
      </div>

      <span className="text-xs text-text-muted tabular-nums w-9 shrink-0">
        {formatTime(duration)}
      </span>
    </div>
  );
}