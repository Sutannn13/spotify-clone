"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePlayerStore } from "@/store/playerStore";
import type { Song } from "@/data/songs.types";
import { getAudioBlob } from "@/lib/indexed-db";

/**
 * Singleton audio element — created once on the client and reused for all playback.
 * This prevents double-playback from React Strict Mode remounting.
 */
let globalAudio: HTMLAudioElement | null = null;
let listenersAttached = false;
let pendingPlayOnCanPlay = false;
let loadingTimeoutHandle: ReturnType<typeof setTimeout> | null = null;

/** Cache blob object URLs by song id so we don't recreate them. */
const blobUrlCache = new Map<string, string>();

function clearLoadingTimeout() {
  if (loadingTimeoutHandle) {
    clearTimeout(loadingTimeoutHandle);
    loadingTimeoutHandle = null;
  }
}

function getAudio(): HTMLAudioElement {
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.preload = "metadata";
  }
  return globalAudio;
}

function attachListeners(audio: HTMLAudioElement) {
  if (listenersAttached) return;

  const store = usePlayerStore;

  const onTimeUpdate = () => {
    store.getState().setCurrentTime(audio.currentTime);
    store.getState().checkSleepTimer();
  };

  const onLoadedMetadata = () => {
    clearLoadingTimeout();
    store.getState().setDuration(audio.duration);
    store.getState().setLoading(false);
  };

  const onCanPlay = () => {
    clearLoadingTimeout();
    store.getState().setLoading(false);
    if (pendingPlayOnCanPlay) {
      pendingPlayOnCanPlay = false;
      audio.play().catch(() => {
        const s = store.getState();
        s.pause();
        s.setPlaybackError("Could not start playback");
      });
    }
  };

  const onPlaying = () => {
    clearLoadingTimeout();
    store.getState().setLoading(false);
    store.getState().setPlaybackError(null);
  };

  const onWaiting = () => {
    if (store.getState().isPlaying) {
      store.getState().setLoading(true);
    }
  };

  const onPause = () => {
    clearLoadingTimeout();
    store.getState().setLoading(false);
  };

  /**
   * This is the ONLY place where same-song repeat is handled.
   * The store can't restart an ended audio element — only this handler can.
   *
   * Priority:
   * 1. Sleep-timer end-of-song → pause
   * 2. repeatMode "once" → seek 0 + play once, then consume repeat
   * 3. repeatMode "forever" → seek 0 + play loop
   * 4. Otherwise → autoplay next (store.next handles shuffle/sequential)
   */
  const onEnded = () => {
    clearLoadingTimeout();
    const state = store.getState();

    // 1. Sleep timer end-of-song
    if (state.sleepTimer === "end-of-song") {
      state.pause();
      store.setState({ sleepTimer: "off", sleepTimerEndsAt: null });
      return;
    }

    const currentSong = state.currentIndex >= 0 && state.currentIndex < state.playlist.length
      ? state.playlist[state.currentIndex]
      : null;

    // 2. Repeat once — replay this song, then consume the repeat
    if (
      state.repeatMode === "once" &&
      state.repeatSongId === currentSong?.id
    ) {
      audio.currentTime = 0;
      state.setCurrentTime(0);
      state.setLoading(false);
      state.setPlaybackError(null);
      if (!state.isPlaying) {
        state.play();
      }
      audio.play()
        .then(() => {
          const latest = store.getState();
          if (
            latest.repeatMode === "once" &&
            latest.repeatSongId === currentSong?.id
          ) {
            store.setState({ repeatMode: "off", repeatSongId: null });
          }
        })
        .catch(() => {
          const s = store.getState();
          s.pause();
          s.setPlaybackError("Repeat playback failed");
        });
      return;
    }

    // 3. Repeat forever — replay this song endlessly
    if (
      state.repeatMode === "forever" &&
      state.repeatSongId === currentSong?.id
    ) {
      audio.currentTime = 0;
      state.setCurrentTime(0);
      state.setLoading(false);
      state.setPlaybackError(null);
      if (!state.isPlaying) {
        state.play();
      }
      audio.play().catch(() => {
        const s = store.getState();
        s.pause();
        s.setPlaybackError("Repeat playback failed");
      });
      return;
    }

    // 4. Normal autoplay — let the store handle next/prev/shuffle/sequential
    state.next();
  };

  const onError = () => {
    clearLoadingTimeout();
    const state = store.getState();
    state.setLoading(false);
    state.pause();
    const err = audio.error;
    let message = "Playback error";
    if (err) {
      switch (err.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          message = "Playback aborted";
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          message = "Network error during playback";
          break;
        case MediaError.MEDIA_ERR_DECODE:
          message = "Audio file could not be decoded";
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          message = "Audio format not supported";
          break;
      }
    }
    state.setPlaybackError(message);
  };

  audio.addEventListener("timeupdate", onTimeUpdate);
  audio.addEventListener("loadedmetadata", onLoadedMetadata);
  audio.addEventListener("canplay", onCanPlay);
  audio.addEventListener("playing", onPlaying);
  audio.addEventListener("waiting", onWaiting);
  audio.addEventListener("pause", onPause);
  audio.addEventListener("ended", onEnded);
  audio.addEventListener("error", onError);

  listenersAttached = true;
}

export function useAudioPlayer() {
  const currentSongIdRef = useRef<string>("");

  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const playlist = usePlayerStore((s) => s.playlist);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const currentTime = usePlayerStore((s) => s.currentTime);

  // Attach browser audio events once
  useEffect(() => {
    const audio = getAudio();
    attachListeners(audio);
  }, []);

  /** Resolve audio URL for a song, with blob URL caching for local songs. */
  const resolveUrl = useCallback(async (song: Song): Promise<string> => {
    if (song.source === "static" || song.source === "supabase") return song.audioUrl;
    if (blobUrlCache.has(song.id)) {
      return blobUrlCache.get(song.id)!;
    }
    const blob = await getAudioBlob(song.id);
    if (blob) {
      const url = URL.createObjectURL(blob);
      blobUrlCache.set(song.id, url);
      return url;
    }
    return "";
  }, []);

  // Load new song when currentIndex changes
  useEffect(() => {
    if (currentIndex < 0 || currentIndex >= playlist.length) return;

    const song: Song = playlist[currentIndex];
    const store = usePlayerStore.getState();

    // Clear previous loading timeout
    clearLoadingTimeout();

    // Same song already loaded — just ensure it plays/resumes
    if (currentSongIdRef.current === song.id) {
      const audio = getAudio();
      if (store.isPlaying && audio.src) {
        if (store.currentTime === 0 && audio.currentTime > 0.5) {
          audio.currentTime = 0;
        }
        audio.play().catch(() => {
          const s = usePlayerStore.getState();
          s.pause();
          s.setPlaybackError("Could not resume playback");
        });
      }
      store.setLoading(false);
      return;
    }

    const load = async () => {
      const audio = getAudio();
      const url = await resolveUrl(song);

      if (!url) {
        store.setLoading(false);
        store.pause();
        store.setPlaybackError("Audio file not found");
        return;
      }

      currentSongIdRef.current = song.id;
      audio.src = url;
      audio.load();

      // 8-second loading timeout fallback
      loadingTimeoutHandle = setTimeout(() => {
        const s = usePlayerStore.getState();
        if (s.isLoading) {
          s.setLoading(false);
          s.setPlaybackError("Loading timed out. The audio file may be unavailable.");
        }
      }, 8000);

      if (store.isPlaying) {
        pendingPlayOnCanPlay = true;
        audio.play().catch(() => {
          // canplay will handle it
        });
      }
    };

    load();
  }, [currentIndex, playlist, resolveUrl]);

  // Pause — play is handled in the load effect via pendingPlayOnCanPlay
  useEffect(() => {
    const audio = getAudio();
    if (!audio.src) return;
    if (!isPlaying) {
      audio.pause();
    }
  }, [isPlaying]);

  // Volume
  useEffect(() => {
    const audio = getAudio();
    audio.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume));
  }, [volume, isMuted]);

  // Seek — only jump if more than 1 second out of sync (avoid loops)
  useEffect(() => {
    const audio = getAudio();
    if (Math.abs(audio.currentTime - currentTime) > 1) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  const seek = useCallback((time: number) => {
    getAudio().currentTime = time;
  }, []);

  return { seek };
}

/** Revoke a cached blob URL. Call when a local song is deleted. */
export function revokeCachedBlobUrl(songId: string) {
  const cached = blobUrlCache.get(songId);
  if (cached) {
    URL.revokeObjectURL(cached);
    blobUrlCache.delete(songId);
  }
}
