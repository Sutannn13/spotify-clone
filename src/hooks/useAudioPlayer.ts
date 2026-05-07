"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePlayerStore } from "@/store/playerStore";
import type { Song } from "@/data/songs.types";
import { getAudioBlob } from "@/lib/indexed-db";

/**
 * Singleton audio element — created once on the client and reused for all playback.
 * This prevents the double-playback issue caused by React Strict Mode remounting
 * the hook and creating multiple HTMLAudioElement instances.
 */
let globalAudio: HTMLAudioElement | null = null;
let listenersAttached = false;

function getAudio(): HTMLAudioElement {
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.preload = "metadata";
    globalAudio.crossOrigin = "anonymous";
  }
  return globalAudio;
}

function attachListeners(audio: HTMLAudioElement) {
  if (listenersAttached) return;

  const store = usePlayerStore.getState();

  const onTimeUpdate = () => store.setCurrentTime(audio.currentTime);
  const onLoadedMetadata = () => {
    store.setDuration(audio.duration);
    store.setLoading(false);
  };
  const onEnded = () => store.onSongEnd();
  const onWaiting = () => store.setLoading(true);
  const onPlaying = () => store.setLoading(false);
  const onError = () => {
    store.setLoading(false);
    // Stop playback on error — do NOT let a dead audio element keep playing
    store.pause();
  };

  audio.addEventListener("timeupdate", onTimeUpdate);
  audio.addEventListener("loadedmetadata", onLoadedMetadata);
  audio.addEventListener("ended", onEnded);
  audio.addEventListener("waiting", onWaiting);
  audio.addEventListener("playing", onPlaying);
  audio.addEventListener("error", onError);

  listenersAttached = true;
}

export function useAudioPlayer() {
  // Track the current song URL so we never re-create blob URLs unnecessarily
  const currentUrlRef = useRef<string>("");

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

  // Resolve audio URL for a song (blob URL for local, path for static)
  const resolveUrl = useCallback(async (song: Song): Promise<string> => {
    if (song.source === "static") return song.audioUrl;
    const blob = await getAudioBlob(song.id);
    return blob ? URL.createObjectURL(blob) : "";
  }, []);

  // Load new song when currentIndex changes
  useEffect(() => {
    if (currentIndex < 0 || currentIndex >= playlist.length) return;

    const song: Song = playlist[currentIndex];
    const load = async () => {
      const audio = getAudio();
      const url = await resolveUrl(song);
      if (!url) return;

      // Only reload if the URL actually changed
      if (currentUrlRef.current !== url) {
        currentUrlRef.current = url;
        audio.src = url;
        audio.load();
      }
    };

    load();
  }, [currentIndex, playlist, resolveUrl]);

  // Play / pause
  useEffect(() => {
    const audio = getAudio();
    if (!audio.src) return;

    if (isPlaying) {
      audio.play().catch(() => usePlayerStore.getState().pause());
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Volume
  useEffect(() => {
    const audio = getAudio();
    audio.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume));
  }, [volume, isMuted]);

  // Seek — only jump if the difference is more than 1 second (avoid loop)
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