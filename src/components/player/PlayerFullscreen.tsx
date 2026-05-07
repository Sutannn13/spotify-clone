"use client";

import { motion } from "framer-motion";
import { usePlayerStore } from "@/store/playerStore";
import { PlayerControls } from "./PlayerControls";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";
import { LyricsPanel } from "@/components/music/LyricsPanel";
import { PremiumCover } from "@/components/ui/PremiumCover";
import { AlignLeft, ChevronDown } from "lucide-react";
import { useState } from "react";

export function PlayerFullscreen() {
  const currentSong = usePlayerStore((s) => {
    const playlist = s.playlist;
    const idx = s.currentIndex;
    return idx >= 0 ? playlist[idx] : null;
  });
  const setFullscreen = usePlayerStore((s) => s.setFullscreen);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const [showLyrics, setShowLyrics] = useState(false);

  if (!currentSong) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col bg-bg-base"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-4 shrink-0">
        <button
          onClick={() => setFullscreen(false)}
          className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Close player"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
          Now Playing
        </p>
        <button
          onClick={() => setShowLyrics(!showLyrics)}
          className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Toggle lyrics"
        >
          <AlignLeft className={showLyrics ? "w-5 h-5 text-accent" : "w-5 h-5"} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {showLyrics ? (
          <div className="flex-1 overflow-hidden">
            <LyricsPanel />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8 overflow-hidden">
            {/* Cover art */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <PremiumCover
                src={currentSong.coverUrl}
                alt={currentSong.title}
                size="xl"
                rounded="2xl"
                tilt
                playing={isPlaying}
                showDisc
                priority
                sizes="(max-width: 640px) 90vw, 400px"
                className="w-full max-w-sm"
              />
            </motion.div>

            {/* Song info */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="w-full text-center"
            >
              <h2 className="text-xl font-semibold text-text-primary tracking-tight leading-tight truncate">
                {currentSong.title}
              </h2>
              <p className="text-sm text-text-secondary mt-1 truncate">
                {currentSong.artist}
              </p>
            </motion.div>
          </div>
        )}

        {/* Controls footer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="shrink-0 px-6 pb-10 flex flex-col gap-6"
        >
          <ProgressBar />
          <div className="flex items-center justify-center">
            <PlayerControls size="large" />
          </div>
          <div className="flex justify-center">
            <VolumeControl />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
