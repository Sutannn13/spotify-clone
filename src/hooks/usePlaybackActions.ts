"use client";

import { useCallback } from "react";
import { usePlayerStore } from "@/store/playerStore";
import type { Song } from "@/data/songs.types";
import { trackRecentPlay } from "@/lib/storage";

/**
 * Canonical playback actions for all UI components.
 * All play/pause/toggle entry points MUST use these functions.
 * No component should call usePlayerStore().play / playSong / pause / toggle directly.
 */
export function usePlaybackActions() {
  const store = usePlayerStore;

  /**
   * Universal play-or-pause for any song click.
   *
   * Behavior:
   * - Song is NOT the current → play it immediately (shuffle does NOT apply)
   * - Song IS current and playing → pause (no time reset)
   * - Song IS current and paused → resume (no time reset)
   *
   * Uses store.playSong which has smart ID-based playlist comparison,
   * so navigation between pages does NOT restart playback for the same song.
   */
  const playOrPause = useCallback((song: Song, list?: Song[]) => {
    const state = store.getState();
    const currentIdx = state.currentIndex;
    const currentSong = currentIdx >= 0 && currentIdx < state.playlist.length
      ? state.playlist[currentIdx]
      : null;

    const isCurrent =
      currentSong?.id === song.id &&
      state.playlist[currentIdx]?.id === song.id;

    if (!isCurrent) {
      // New or different song — play it, reset repeat
      store.getState().playSong(song, list);
      trackRecentPlay(song.id);
      return;
    }

    // Same song — toggle play/pause (no src reload, no time reset)
    store.getState().toggle();
  }, []);

  /**
   * User pressed next — always resets repeat, plays next immediately.
   */
  const playNext = useCallback(() => {
    store.getState().next({ manual: true });
  }, []);

  /**
   * User pressed previous — always resets repeat, plays previous immediately.
   * If currentTime > 3s, restarts the current song first.
   */
  const playPrev = useCallback(() => {
    store.getState().prev({ manual: true });
  }, []);

  /** User wants to pause directly. */
  const pause = useCallback(() => {
    store.getState().pause();
  }, []);

  /** User wants to resume directly. */
  const resume = useCallback(() => {
    store.getState().play();
  }, []);

  /** Toggle play/pause. */
  const toggle = useCallback(() => {
    store.getState().toggle();
  }, []);

  return {
    playOrPause,
    playNext,
    playPrev,
    pause,
    resume,
    toggle,
  };
}
