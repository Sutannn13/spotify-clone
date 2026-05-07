"use client";

import { useEffect, useCallback } from "react";
import { usePlayerStore } from "@/store/playerStore";
import { toggleLikeSong } from "@/lib/storage";

/**
 * Keyboard shortcuts for the music player.
 * Only active when no input/textarea is focused.
 */
export function useKeyboardShortcuts() {
  const toggle = usePlayerStore((s) => s.toggle);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const setFullscreen = usePlayerStore((s) => s.setFullscreen);
  const getCurrentSong = usePlayerStore((s) => s.getCurrentSong);
  const isFullscreen = usePlayerStore((s) => s.isFullscreen);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip if typing in input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          toggle();
          break;
        case "ArrowRight":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prev();
          break;
        case "m":
        case "M":
          e.preventDefault();
          toggleMute();
          break;
        case "l":
        case "L": {
          e.preventDefault();
          const currentSong = getCurrentSong();
          if (currentSong) {
            toggleLikeSong(currentSong.id);
          }
          break;
        }
        case "/":
          e.preventDefault();
          // Focus search input if on page
          const searchInput = document.querySelector<HTMLInputElement>(
            'input[type="text"], input[placeholder*="Search"]'
          );
          searchInput?.focus();
          break;
        case "Escape":
          e.preventDefault();
          if (isFullscreen) {
            setFullscreen(false);
          }
          break;
      }
    },
    [toggle, next, prev, toggleMute, setFullscreen, getCurrentSong, isFullscreen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
