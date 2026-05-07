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
   * - Song is NOT the current song → play it immediately (shuffle does NOT apply)
   * - Song IS current and playing → pause (no time reset)
   * - Song IS current and paused → resume (no time reset)
   */
  const playOrPause = useCallback((song: Song, list?: Song[]) => {
    const state = store.getState();
    const listToUse = list ?? state.playlist;
    const currentIdx = state.currentIndex;
    const isCurrent =
      currentIdx >= 0 &&
      currentIdx < state.playlist.length &&
      state.playlist[currentIdx]?.id === song.id &&
      state.playlist === listToUse;

    if (!isCurrent) {
      // New song — always play from index
      const index = listToUse.findIndex((s) => s.id === song.id);

      if (index === -1 && state.playlist.length > 0) {
        // Not in given list but playlist exists — prepend
        store.setState({
          playlist: [song, ...state.playlist],
          currentIndex: 0,
          isPlaying: true,
          currentTime: 0,
          isLoading: true,
          playbackError: null,
        });
      } else if (index === -1) {
        store.setState({
          playlist: [song],
          currentIndex: 0,
          isPlaying: true,
          currentTime: 0,
          isLoading: true,
          playbackError: null,
        });
      } else {
        store.setState({
          playlist: listToUse,
          currentIndex: index,
          isPlaying: true,
          currentTime: 0,
          isLoading: true,
          playbackError: null,
        });
      }
      trackRecentPlay(song.id);
      return;
    }

    // Current song — toggle play/pause, no time reset, no loading
    store.getState().toggle();
  }, []);

  const playNext = useCallback(() => {
    store.getState().next();
  }, []);

  const playPrev = useCallback(() => {
    store.getState().prev();
  }, []);

  const pause = useCallback(() => {
    store.getState().pause();
  }, []);

  const resume = useCallback(() => {
    store.getState().play();
  }, []);

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
