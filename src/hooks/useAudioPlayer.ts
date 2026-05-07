"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePlayerStore } from "@/store/playerStore";
import type { Song } from "@/data/songs.types";
import { getAudioBlob } from "@/lib/indexed-db";

/**
 * Singleton audio element -- created once on the client and reused for all playback.
 * Prevents double-playback from React Strict Mode remounting.
 */
let globalAudio: HTMLAudioElement | null = null;
let listenersAttached = false;
let pendingPlayOnCanPlay = false;

/** Cache blob object URLs by song id to avoid recreating them. */
const blobUrlCache = new Map<string, string>();

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
    store.getState().setDuration(audio.duration);
    store.getState().setLoading(false);
  };

  const onCanPlay = () => {
    store.getState().setLoading(false);
    // If we need to play, do it when audio is ready
    if (pendingPlayOnCanPlay) {
      pendingPlayOnCanPlay = false;
      audio.play().catch(() => {
        store.getState().pause();
        store.getState().setPlaybackError("Could not start playback");
      });
    }
  };

  const onPlaying = () => {
    store.getState().setLoading(false);
    store.getState().setPlaybackError(null);
  };

  const onWaiting = () => {
    store.getState().setLoading(true);
  };

  const onEnded = () => {
    store.getState().onSongEnd();
  };

  const onError = () => {
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
  audio.addEventListener("ended", onEnded);
  audio.addEventListener("error", onError);

  listenersAttached = true;
}

export function useAudioPlayer() {
  const currentSongIdRef = useRef<string>("");
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirectlyPlayingRef = useRef<boolean>(false);

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
    if (song.source === "static") return song.audioUrl;

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

    // Clear any previous loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    // If same song is already loaded, just ensure it plays if needed
    if (currentSongIdRef.current === song.id) {
      const audio = getAudio();
      if (store.isPlaying && audio.src) {
        // Seek to 0 if we need to restart
        if (store.currentTime === 0 && audio.currentTime > 0.5) {
          audio.currentTime = 0;
        }
        audio.play().catch(() => {
          store.pause();
          store.setPlaybackError("Could not resume playback");
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

      // Set a loading timeout fallback (8 seconds)
      loadingTimeoutRef.current = setTimeout(() => {
        const s = usePlayerStore.getState();
        if (s.isLoading) {
          s.setLoading(false);
          s.setPlaybackError("Loading timed out. The audio file may be unavailable.");
        }
      }, 8000);

      // If store says isPlaying, signal to play when ready
      if (store.isPlaying) {
        pendingPlayOnCanPlay = true;
        // Attempt to play immediately too - might work on some browsers
        audio.play().catch(() => {
          // Will be handled by canplay event
        });
      }
    };

    load();

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [currentIndex, playlist, resolveUrl]);

  // Play / pause effect -- only for pause, play is handled in load effect
  useEffect(() => {
    const audio = getAudio();
    if (!audio.src) return;

    if (!isPlaying) {
      audio.pause();
    }
    // Play is handled in load effect via pendingPlayOnCanPlay
  }, [isPlaying]);

  // Volume
  useEffect(() => {
    const audio = getAudio();
    audio.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume));
  }, [volume, isMuted]);

  // Seek -- only jump if the difference is more than 1 second (avoid loop)
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

/**
 * Revoke a cached blob URL. Call when a local song is deleted.
 */
export function revokeCachedBlobUrl(songId: string) {
  const cached = blobUrlCache.get(songId);
  if (cached) {
    URL.revokeObjectURL(cached);
    blobUrlCache.delete(songId);
  }
}
