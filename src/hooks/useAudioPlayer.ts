"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePlayerStore } from "@/store/playerStore";
import type { Song } from "@/data/songs.types";
import { getAudioBlob, createObjectUrl } from "@/lib/indexed-db";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initialized = useRef(false);
  const currentAudioUrlRef = useRef<string>("");
  const urlCache = useRef<Map<string, string>>(new Map());

  const playlist = usePlayerStore((s) => s.playlist);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const currentTime = usePlayerStore((s) => s.currentTime);

  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime);
  const setDuration = usePlayerStore((s) => s.setDuration);
  const setLoading = usePlayerStore((s) => s.setLoading);
  const onSongEnd = usePlayerStore((s) => s.onSongEnd);
  const pause = usePlayerStore((s) => s.pause);

  const resolveAudioUrl = useCallback(async (song: Song): Promise<string> => {
    if (song.source === "static") {
      return song.audioUrl;
    }

    if (urlCache.current.has(song.id)) {
      return urlCache.current.get(song.id)!;
    }

    const blob = await getAudioBlob(song.id);
    if (blob) {
      const url = createObjectUrl(blob);
      urlCache.current.set(song.id, url);
      return url;
    }

    return "";
  }, []);

  useEffect(() => {
    if (!initialized.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "metadata";
      initialized.current = true;
    }

    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoading(false);
    };
    const onEnded = () => onSongEnd();
    const onWaiting = () => setLoading(true);
    const onPlaying = () => setLoading(false);
    const onError = () => {
      setLoading(false);
      setIsPlaying(false);
    };

    const setIsPlaying = (val: boolean) => {
      // handled via pause action
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("error", onError);
    };
  }, [setCurrentTime, setDuration, setLoading, onSongEnd]);

  // Load song audio when currentIndex changes
  useEffect(() => {
    const loadAudio = async () => {
      if (!audioRef.current || currentIndex < 0 || currentIndex >= playlist.length) return;

      const song: Song = playlist[currentIndex];
      const url = await resolveAudioUrl(song);

      if (!url) return;

      if (currentAudioUrlRef.current !== url) {
        currentAudioUrlRef.current = url;
        audioRef.current.src = url;
        audioRef.current.load();
      }
    };

    loadAudio();
  }, [currentIndex, playlist, resolveAudioUrl]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    if (isPlaying) {
      audio.play().catch(() => pause());
    } else {
      audio.pause();
    }
  }, [isPlaying, pause]);

  // Handle volume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Handle seek
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (Math.abs(audio.currentTime - currentTime) > 1) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
  }, []);

  return { seek, audioRef };
}