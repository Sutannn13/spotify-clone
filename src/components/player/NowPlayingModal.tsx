"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayerStore } from "@/store/playerStore";
import { PlayerControls } from "./PlayerControls";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";
import { LikeButton } from "@/components/music/LikeButton";
import { LyricsPanel } from "@/components/music/LyricsPanel";
import { QueuePanel } from "./QueuePanel";
import { SongDetailsPanel } from "./SongDetailsPanel";
import { PremiumCover } from "@/components/ui/PremiumCover";
import {
  X,
  ChevronLeft,
  ChevronRight,
  AlignLeft,
  ListMusic,
  Disc,
  Music2,
} from "lucide-react";
import { clsx } from "clsx";
import type { Song } from "@/data/songs.types";

const SLIDES = [
  { id: "cover", label: "Cover", Icon: Disc },
  { id: "lyrics", label: "Lyrics", Icon: AlignLeft },
  { id: "queue", label: "Queue", Icon: ListMusic },
  { id: "details", label: "Details", Icon: Music2 },
] as const;

type SlideId = (typeof SLIDES)[number]["id"];

interface NowPlayingModalProps {
  songs: Song[];
  coverResolver: (song: Song) => string;
}

export function NowPlayingModal({ songs, coverResolver }: NowPlayingModalProps) {
  const currentSong = usePlayerStore((s) => {
    const playlist = s.playlist;
    const idx = s.currentIndex;
    return idx >= 0 && idx < playlist.length ? playlist[idx] : null;
  });
  const setFullscreen = usePlayerStore((s) => s.setFullscreen);
  const isFullscreen = usePlayerStore((s) => s.isFullscreen);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playbackError = usePlayerStore((s) => s.playbackError);

  const [activeSlide, setActiveSlide] = useState<SlideId>("cover");
  const [slideDirection, setSlideDirection] = useState(0);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const slideIndex = SLIDES.findIndex((s) => s.id === activeSlide);

  const goToSlide = (id: SlideId) => {
    const newIndex = SLIDES.findIndex((s) => s.id === id);
    setSlideDirection(newIndex > slideIndex ? 1 : -1);
    setActiveSlide(id);
  };

  if (!isFullscreen || !currentSong) return null;

  const coverUrl = coverResolver(currentSong);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl"
        onClick={() => setFullscreen(false)}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y > 80) {
            setFullscreen(false);
          }
        }}
        className="fixed inset-0 z-50 flex flex-col bg-bg-base md:rounded-2xl md:inset-4 md:my-auto md:mx-auto md:max-w-2xl lg:max-w-3xl overflow-hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-border/50">
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
            aria-label="Close full player"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Slide dots / tabs */}
          <div className="flex items-center gap-1.5">
            {SLIDES.map((slide) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(slide.id)}
                className={clsx(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                  activeSlide === slide.id
                    ? "bg-bg-hover text-text-primary"
                    : "text-text-muted hover:text-text-secondary"
                )}
              >
                <span
                  className={clsx(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    activeSlide === slide.id ? "bg-accent" : "bg-text-muted"
                  )}
                />
                <span className="hidden sm:inline">{slide.label}</span>
                <slide.Icon
                  className={clsx(
                    "w-3 h-3",
                    activeSlide === slide.id ? "text-accent" : "text-text-muted"
                  )}
                />
              </button>
            ))}
          </div>

          <div className="w-9" />
        </div>

        {/* Slide content with subtle fade + x transition */}
        <div className="flex-1 overflow-hidden relative flex flex-col" ref={constraintsRef}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, x: slideDirection * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: slideDirection * -40 }}
              transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {activeSlide === "cover" && (
                <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 py-6 sm:py-8 gap-5 sm:gap-6 overflow-hidden">
                  {/* Premium album cover with vinyl disc */}
                  <PremiumCover
                    src={coverUrl}
                    alt={`${currentSong.title} cover`}
                    size="xl"
                    rounded="2xl"
                    playing={isPlaying}
                    showDisc
                    tilt
                    priority
                    sizes="(max-width: 640px) 85vw, 320px"
                  />

                  <div className="w-full text-center space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <h2 className="text-xl font-semibold text-text-primary tracking-tight truncate">
                        {currentSong.title}
                      </h2>
                      <LikeButton songId={currentSong.id} size="md" />
                    </div>
                    <p className="text-sm text-text-secondary truncate">
                      {currentSong.artist}
                    </p>
                    {currentSong.album && (
                      <p className="text-xs text-text-muted truncate">
                        {currentSong.album}
                      </p>
                    )}
                    {playbackError && (
                      <p className="text-xs text-red-400 mt-1">{playbackError}</p>
                    )}
                  </div>
                </div>
              )}

              {activeSlide === "lyrics" && <LyricsPanel />}

              {activeSlide === "queue" && (
                <QueuePanel songs={songs} coverResolver={coverResolver} />
              )}

              {activeSlide === "details" && (
                <SongDetailsPanel song={currentSong} coverResolver={coverResolver} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Arrow navigation (desktop) */}
          {slideIndex > 0 && (
            <button
              type="button"
              onClick={() => goToSlide(SLIDES[slideIndex - 1].id)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 hidden lg:flex items-center justify-center rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-all z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {slideIndex < SLIDES.length - 1 && (
            <button
              type="button"
              onClick={() => goToSlide(SLIDES[slideIndex + 1].id)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 hidden lg:flex items-center justify-center rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-all z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Controls footer */}
        <div className="shrink-0 px-4 sm:px-6 pb-6 sm:pb-8 pt-4 flex flex-col gap-4 border-t border-border/50">
          <ProgressBar />
          <div className="flex items-center justify-center">
            <PlayerControls size="large" />
          </div>
          <div className="flex justify-center">
            <VolumeControl />
          </div>
        </div>
      </motion.div>
    </>
  );
}
