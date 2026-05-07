"use client";

import { usePlayerStore } from "@/store/playerStore";
import { parseLrc, findCurrentLine } from "@/lib/lrc-parser";
import { useEffect, useRef } from "react";
import { clsx } from "clsx";
import { AlignLeft } from "lucide-react";

export function LyricsPanel() {
  const currentSong = usePlayerStore((s) => {
    const playlist = s.playlist;
    const idx = s.currentIndex;
    return idx >= 0 ? playlist[idx] : null;
  });
  const currentTime = usePlayerStore((s) => s.currentTime);
  const seek = usePlayerStore((s) => s.seek);
  const listRef = useRef<HTMLDivElement>(null);
  const activeLineIndex = useRef(-1);

  useEffect(() => {
    if (!currentSong || currentSong.lyricsType !== "lrc") return;
    const lines = parseLrc(currentSong.lyrics);
    const idx = findCurrentLine(lines, currentTime);

    if (idx !== activeLineIndex.current) {
      activeLineIndex.current = idx;
      const el = listRef.current?.querySelector<HTMLParagraphElement>(
        `[data-lyric-index="${idx}"]`
      );
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentTime, currentSong]);

  if (!currentSong) return null;

  const { lyrics, lyricsType } = currentSong;

  if (!lyrics.trim()) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-text-muted">
        <AlignLeft className="w-8 h-8 opacity-40" />
        <p className="text-sm">No lyrics available</p>
      </div>
    );
  }

  if (lyricsType === "lrc") {
    const lines = parseLrc(lyrics);
    const activeIdx = findCurrentLine(lines, currentTime);
    const handleClick = (time: number) => seek(time);

    return (
      <div
        ref={listRef}
        className="h-full overflow-y-auto px-8 py-12 flex flex-col gap-3 no-scrollbar"
      >
        {lines.map((line, i) => (
          <p
            key={i}
            data-lyric-index={i}
            onClick={() => handleClick(line.time)}
            className={clsx(
              "text-base leading-relaxed cursor-pointer transition-all duration-300 text-center py-1 rounded-lg",
              i === activeIdx
                ? "text-text-primary font-semibold scale-105"
                : i === activeIdx - 1 || i === activeIdx + 1
                  ? "text-text-secondary/50"
                  : "text-text-muted/40"
            )}
          >
            {line.text || " "}
          </p>
        ))}
      </div>
    );
  }

  // Plain lyrics
  return (
    <div className="h-full overflow-y-auto px-8 py-12 no-scrollbar">
      <div className="flex flex-col gap-4 text-center max-w-lg mx-auto">
        {lyrics
          .split("\n")
          .filter((line) => line.trim())
          .map((line, i) => (
            <p
              key={i}
              className="text-base leading-relaxed text-text-secondary/80"
            >
              {line}
            </p>
          ))}
      </div>
    </div>
  );
}