"use client";

import { useCallback } from "react";
import { usePlayerStore } from "@/store/playerStore";
import type { Song } from "@/data/songs.types";
import { trackRecentPlay } from "@/lib/storage";

/**
 * Universal playback actions used across all components.
 * Provides a single source of truth for play/pause/toggle behavior.
 */
export function usePlaybackActions() {
  const store = usePlayerStore;

  const playSong = useCallback((song: Song, playlist?: Song[]) => {
    const state = store.getState();
    const list = playlist ?? state.playlist;
    let index = list.findIndex((s) => s.id === song.id);

    if (index === -1 && list.length > 0) {
      // Song not in playlist - prepend it
      const newList = [song, ...list];
      store.setState({
        playlist: newList,
        currentIndex: 0,
        isPlaying: true,
        currentTime: 0,
        isLoading: true,
        playbackError: null,
      });
      trackRecentPlay(song.id);
      return;
    }

    if (index === -1) {
      // No playlist, single song
      store.setState({
        playlist: [song],
        currentIndex: 0,
        isPlaying: true,
        currentTime: 0,
        isLoading: true,
        playbackError: null,
      });
      trackRecentPlay(song.id);
      return;
    }

    // If same song is already current, just resume
    if (state.currentIndex === index && state.playlist === list) {
      store.setState({ isPlaying: true, playbackError: null });
      return;
    }

    store.setState({
      playlist: list,
      currentIndex: index,
      isPlaying: true,
      currentTime: 0,
      isLoading: true,
      playbackError: null,
    });
    trackRecentPlay(song.id);
  }, [store]);

  const toggleCurrentSong = useCallback((song: Song, playlist?: Song[]) => {
    const state = store.getState();
    const list = playlist ?? state.playlist;
    const currentIdx = state.currentIndex;
    const isCurrent = state.playlist === list && currentIdx >= 0 && state.playlist[currentIdx]?.id === song.id;

    if (isCurrent) {
      // Same song: toggle play/pause
      store.getState().toggle();
    } else {
      // Different song: play it
      playSong(song, playlist ?? list);
    }
  }, [store, playSong]);

  const play = useCallback(() => {
    store.getState().play();
  }, [store]);

  const pause = useCallback(() => {
    store.getState().pause();
  }, [store]);

  const togglePlayPause = useCallback(() => {
    store.getState().toggle();
  }, [store]);

  const playNext = useCallback((options?: { autoplay?: boolean }) => {
    const state = store.getState();
    if (options?.autoplay === false && !state.isPlaying) {
      // Don't auto-play if requested
      return;
    }
    store.getState().next();
  }, [store]);

  const playPrevious = useCallback(() => {
    store.getState().prev();
  }, [store]);

  return {
    playSong,
    toggleCurrentSong,
    play,
    pause,
    togglePlayPause,
    playNext,
    playPrevious,
  };
}
