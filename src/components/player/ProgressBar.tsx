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
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
  const seekToRatio = useCallback((ratio: number) => {
    if (duration === 0) return;
    seek(clamp(ratio, 0, 1) * duration);
  }, [duration, seek]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!barRef.current || duration === 0) return;
      const rect = barRef.current.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      seekToRatio(ratio);
    },
    [duration, seekToRatio]
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

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (duration === 0) return;
    const stepSmall = Math.max(1, duration * 0.01);
    const stepLarge = Math.max(5, duration * 0.05);

    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        seek(clamp(currentTime + stepSmall, 0, duration));
        break;
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        seek(clamp(currentTime - stepSmall, 0, duration));
        break;
      case "PageUp":
        e.preventDefault();
        seek(clamp(currentTime + stepLarge, 0, duration));
        break;
      case "PageDown":
        e.preventDefault();
        seek(clamp(currentTime - stepLarge, 0, duration));
        break;
      case "Home":
        e.preventDefault();
        seek(0);
        break;
      case "End":
        e.preventDefault();
        seek(duration);
        break;
    }
  }, [currentTime, duration, seek]);

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
        onKeyDown={handleKeyDown}
        role="slider"
        tabIndex={0}
        aria-label="Seek playback position"
        aria-valuemin={0}
        aria-valuemax={Math.floor(duration)}
        aria-valuenow={Math.floor(currentTime)}
        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
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
