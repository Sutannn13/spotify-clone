"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Song, LyricsType } from "@/data/songs.types";
import { staticSongs } from "@/data/static-songs";
import {
  getLocalSongs,
  saveLocalSong,
  deleteLocalSong,
  getAudioBlob,
  getCoverBlob,
  createObjectUrl,
  revokeObjectUrl,
} from "@/lib/indexed-db";

export function useSongLibrary() {
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [localSongs, setLocalSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const urlCache = useRef<Map<string, string>>(new Map());

  // Resolve song URLs (local songs get blob URLs, static songs use paths)
  const resolveSongUrl = useCallback(async (song: Song): Promise<string> => {
    if (song.source === "static") {
      return song.audioUrl;
    }

    const cacheKey = `audio:${song.id}`;
    if (urlCache.current.has(cacheKey)) {
      return urlCache.current.get(cacheKey)!;
    }

    const blob = await getAudioBlob(song.id);
    if (blob) {
      const url = createObjectUrl(blob);
      urlCache.current.set(cacheKey, url);
      return url;
    }

    return "";
  }, []);

  const resolveCoverUrl = useCallback(async (song: Song): Promise<string> => {
    if (song.source === "static") {
      return song.coverUrl;
    }

    const cacheKey = `cover:${song.id}`;
    if (urlCache.current.has(cacheKey)) {
      return urlCache.current.get(cacheKey)!;
    }

    const blob = await getCoverBlob(song.id);
    if (blob) {
      const url = createObjectUrl(blob);
      urlCache.current.set(cacheKey, url);
      return url;
    }

    return "";
  }, []);

  // Load all songs from both sources
  const loadSongs = useCallback(async () => {
    try {
      setIsLoading(true);
      const local = await getLocalSongs();

      const merged: Song[] = [...local, ...staticSongs];
      setAllSongs(merged);
      setLocalSongs(local);
    } catch (err) {
      setError("Failed to load songs");
      setAllSongs(staticSongs);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSongs();
    return () => {
      // Clean up blob URLs on unmount
      urlCache.current.forEach((url) => revokeObjectUrl(url));
      urlCache.current.clear();
    };
  }, [loadSongs]);

  // Add a new local song
  const addSong = useCallback(
    async (data: {
      title: string;
      artist: string;
      album: string;
      duration: number;
      lyrics: string;
      lyricsType: LyricsType;
      mood?: string;
      genre?: string;
      audioFile: File;
      coverFile?: File;
    }): Promise<Song> => {
      const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const song: Song = {
        id,
        title: data.title,
        artist: data.artist,
        album: data.album,
        duration: data.duration,
        audioUrl: "", // resolved dynamically
        coverUrl: "", // resolved dynamically
        lyrics: data.lyrics,
        lyricsType: data.lyricsType,
        source: "local",
        audioFileName: data.audioFile.name,
        coverFileName: data.coverFile?.name ?? "",
        createdAt: new Date().toISOString(),
        mood: data.mood,
        genre: data.genre,
      };

      const audioBlob = new Blob([await data.audioFile.arrayBuffer()], {
        type: data.audioFile.type,
      });
      const coverBlob = data.coverFile
        ? new Blob([await data.coverFile.arrayBuffer()], {
            type: data.coverFile.type,
          })
        : undefined;

      await saveLocalSong(song, audioBlob, coverBlob);

      // Cache the blob URLs
      const audioUrl = createObjectUrl(audioBlob);
      urlCache.current.set(`audio:${id}`, audioUrl);
      if (coverBlob) {
        const coverUrl = createObjectUrl(coverBlob);
        urlCache.current.set(`cover:${id}`, coverUrl);
      }

      await loadSongs();
      return song;
    },
    [loadSongs]
  );

  // Delete a local song
  const removeSong = useCallback(
    async (songId: string): Promise<void> => {
      const song = localSongs.find((s) => s.id === songId);
      if (!song) return;

      // Clean up cached URLs
      urlCache.current.delete(`audio:${songId}`);
      urlCache.current.delete(`cover:${songId}`);

      await deleteLocalSong(songId);
      await loadSongs();
    },
    [localSongs, loadSongs]
  );

  // Get a resolved song object (with current blob URLs for local songs)
  const getResolvedSong = useCallback(
    async (song: Song): Promise<Song> => {
      if (song.source === "static") return song;

      const [audioUrl, coverUrl] = await Promise.all([
        resolveSongUrl(song),
        resolveCoverUrl(song),
      ]);

      return { ...song, audioUrl, coverUrl };
    },
    [resolveSongUrl, resolveCoverUrl]
  );

  return {
    allSongs,
    localSongs,
    staticSongs,
    isLoading,
    error,
    addSong,
    removeSong,
    resolveSongUrl,
    resolveCoverUrl,
    getResolvedSong,
    refresh: loadSongs,
  };
}