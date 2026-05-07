"use client";

import { usePlayerStore } from "@/store/playerStore";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  Loader2,
} from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { SleepTimerControl } from "./SleepTimerControl";

export function PlayerControls({ size = "default" }: { size?: "default" | "large" }) {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const isShuffled = usePlayerStore((s) => s.isShuffled);
  const toggle = usePlayerStore((s) => s.toggle);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const playlist = usePlayerStore((s) => s.playlist);

  const iconSize = size === "large" ? 28 : 18;
  const btnSize = size === "large" ? 16 : 10;

  return (
    <div className="flex items-center gap-1">
      {/* Shuffle */}
      <button
        type="button"
        onClick={toggleShuffle}
        className={clsx(
          "w-9 h-9 flex items-center justify-center rounded-full transition-all",
          isShuffled
            ? "text-accent"
            : "text-text-secondary hover:text-text-primary"
        )}
        aria-label="Shuffle"
        aria-pressed={isShuffled ? "true" : "false"}
      >
        <Shuffle className={clsx(iconSize < 20 && "w-4 h-4")} style={{ width: iconSize * 0.8, height: iconSize * 0.8 }} />
      </button>

      {/* Prev */}
      <button
        type="button"
        onClick={prev}
        disabled={playlist.length === 0}
        className={clsx(
          "w-9 h-9 flex items-center justify-center rounded-full transition-colors",
          playlist.length === 0
            ? "text-text-muted cursor-not-allowed"
            : "text-text-secondary hover:text-text-primary"
        )}
        aria-label="Previous"
      >
        <SkipBack
          className={clsx(iconSize < 20 && "w-4 h-4")}
          style={{ width: iconSize * 0.8, height: iconSize * 0.8 }}
        />
      </button>

      {/* Play / Pause */}
      <button
        type="button"
        onClick={toggle}
        disabled={playlist.length === 0}
        className={clsx(
          "w-12 h-12 flex items-center justify-center rounded-full transition-all",
          size === "large" ? "w-16 h-16" : "w-10 h-10",
          playlist.length === 0
            ? "bg-text-muted/20 cursor-not-allowed"
            : "bg-text-primary hover:scale-105 active:scale-95"
        )}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isLoading ? (
          <Loader2
            className={clsx(
              "text-bg-base animate-spin",
              size === "large" ? "w-6 h-6" : "w-4 h-4"
            )}
          />
        ) : (
          <motion.div
            key={isPlaying ? "pause" : "play"}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {isPlaying ? (
              <Pause
                className={clsx(
                  "text-bg-base",
                  size === "large" ? "w-6 h-6" : "w-4 h-4"
                )}
              />
            ) : (
              <Play
                className={clsx(
                  "text-bg-base ml-0.5",
                  size === "large" ? "w-6 h-6" : "w-4 h-4"
                )}
                fill="currentColor"
              />
            )}
          </motion.div>
        )}
      </button>

      {/* Next */}
      <button
        type="button"
        onClick={next}
        disabled={playlist.length === 0}
        className={clsx(
          "w-9 h-9 flex items-center justify-center rounded-full transition-colors",
          playlist.length === 0
            ? "text-text-muted cursor-not-allowed"
            : "text-text-secondary hover:text-text-primary"
        )}
        aria-label="Next"
      >
        <SkipForward
          className={clsx(iconSize < 20 && "w-4 h-4")}
          style={{ width: iconSize * 0.8, height: iconSize * 0.8 }}
        />
      </button>

      {/* Repeat */}
      <button
        type="button"
        onClick={cycleRepeat}
        className={clsx(
          "w-9 h-9 flex items-center justify-center rounded-full transition-all relative",
          repeatMode !== "none"
            ? "text-accent"
            : "text-text-secondary hover:text-text-primary"
        )}
        aria-label={`Repeat: ${repeatMode}`}
        aria-pressed={repeatMode !== "none" ? "true" : "false"}
      >
        {repeatMode === "one" ? (
          <Repeat1
            className={clsx(iconSize < 20 && "w-4 h-4")}
            style={{ width: iconSize * 0.8, height: iconSize * 0.8 }}
          />
        ) : (
          <Repeat
            className={clsx(iconSize < 20 && "w-4 h-4")}
            style={{ width: iconSize * 0.8, height: iconSize * 0.8 }}
          />
        )}
        {repeatMode === "one" && (
          <span className="absolute text-[9px] font-semibold leading-none">
            1
          </span>
        )}
      </button>

      {/* Sleep timer */}
      <SleepTimerControl />
    </div>
  );
}