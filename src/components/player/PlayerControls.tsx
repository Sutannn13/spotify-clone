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

  const isLarge = size === "large";

  const repeatLabel =
    repeatMode === "off" ? "Repeat off"
    : repeatMode === "once" ? "Repeat current song once"
    : "Repeat current song continuously";

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
        aria-label="Toggle shuffle"
        aria-pressed={isShuffled}
      >
        <Shuffle className={clsx(isLarge ? "w-5 h-5" : "w-4 h-4")} />
      </button>

      {/* Prev — manual navigation resets repeat */}
      <button
        type="button"
        onClick={() => prev({ manual: true })}
        disabled={playlist.length === 0}
        className={clsx(
          "w-9 h-9 flex items-center justify-center rounded-full transition-colors",
          playlist.length === 0
            ? "text-text-muted cursor-not-allowed"
            : "text-text-secondary hover:text-text-primary"
        )}
        aria-label="Previous song"
      >
        <SkipBack className={clsx(isLarge ? "w-5 h-5" : "w-4 h-4")} />
      </button>

      {/* Play / Pause */}
      <button
        type="button"
        onClick={toggle}
        disabled={playlist.length === 0}
        className={clsx(
          "flex items-center justify-center rounded-full transition-all",
          isLarge ? "w-16 h-16" : "w-10 h-10",
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
              isLarge ? "w-6 h-6" : "w-4 h-4"
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
                  isLarge ? "w-6 h-6" : "w-4 h-4"
                )}
              />
            ) : (
              <Play
                className={clsx(
                  "text-bg-base",
                  isLarge ? "w-6 h-6" : "w-4 h-4"
                )}
                style={{ marginLeft: "2px" }}
                fill="currentColor"
              />
            )}
          </motion.div>
        )}
      </button>

      {/* Next — manual navigation resets repeat */}
      <button
        type="button"
        onClick={() => next({ manual: true })}
        disabled={playlist.length === 0}
        className={clsx(
          "w-9 h-9 flex items-center justify-center rounded-full transition-colors",
          playlist.length === 0
            ? "text-text-muted cursor-not-allowed"
            : "text-text-secondary hover:text-text-primary"
        )}
        aria-label="Next song"
      >
        <SkipForward className={clsx(isLarge ? "w-5 h-5" : "w-4 h-4")} />
      </button>

      {/* Repeat — per-song: off / once / forever */}
      <button
        type="button"
        onClick={cycleRepeat}
        disabled={playlist.length === 0}
        className={clsx(
          "w-9 h-9 flex items-center justify-center rounded-full transition-all relative",
          playlist.length === 0
            ? "text-text-muted cursor-not-allowed"
            : repeatMode !== "off"
              ? "text-accent"
              : "text-text-secondary hover:text-text-primary"
        )}
        aria-label={repeatLabel}
        aria-pressed={repeatMode !== "off"}
      >
        {repeatMode === "once" ? (
          <Repeat1 className={clsx(isLarge ? "w-5 h-5" : "w-4 h-4")} />
        ) : (
          <Repeat className={clsx(isLarge ? "w-5 h-5" : "w-4 h-4")} />
        )}
        {repeatMode === "once" && (
          <span className="absolute text-[9px] font-semibold leading-none bottom-0.5 right-0.5">
            1
          </span>
        )}
      </button>

      {/* Sleep timer */}
      <SleepTimerControl />
    </div>
  );
}
