"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import type { Song, LyricsType } from "@/data/songs.types";
import { staticSongs } from "@/data/static-songs";
import {
  getLocalSongs,
  saveLocalSong,
  deleteLocalSong,
  getCoverBlob,
  createObjectUrl,
} from "@/lib/indexed-db";

interface SongLibraryContextValue {
  allSongs: Song[];
  localSongs: Song[];
  staticSongsList: Song[];
  isLoading: boolean;
  error: string | null;
  addSong: (data: {
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
  }) => Promise<Song>;
  removeSong: (songId: string) => Promise<void>;
  updateSong: (songId: string, data: {
    title: string;
    artist: string;
    album: string;
    lyrics: string;
    lyricsType: LyricsType;
    mood?: string;
    genre?: string;
  }) => Promise<void>;
  getCoverUrl: (song: Song) => string;
  refresh: () => Promise<void>;
}

const SongLibraryContext = createContext<SongLibraryContextValue | null>(null);

export function useSongLibrary(): SongLibraryContextValue {
  const ctx = useContext(SongLibraryContext);
  if (!ctx)
    throw new Error(
      "useSongLibrary must be used within SongLibraryProvider"
    );
  return ctx;
}

export function SongLibraryProvider({ children }: { children: ReactNode }) {
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [localSongs, setLocalSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const coverUrlMap = useRef<Map<string, string>>(new Map());
  const [coverMapVersion, setCoverMapVersion] = useState(0);

  const getCoverUrl = useCallback((song: Song): string => {
    if (song.source === "static") return song.coverUrl;
    return coverUrlMap.current.get(song.id) ?? "";
  }, []);

  const loadSongs = useCallback(async () => {
    try {
      setIsLoading(true);
      const local = await getLocalSongs();

      // Build cover URL map without creating object URLs until needed
      for (const song of local) {
        if (!coverUrlMap.current.has(song.id)) {
          // Will be lazily resolved — placeholder
          coverUrlMap.current.set(song.id, "");
        }
      }

      const merged: Song[] = [...local, ...staticSongs];
      setAllSongs(merged);
      setLocalSongs(local);
      setError(null);
    } catch {
      setError("Failed to load songs");
      setAllSongs(staticSongs);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load songs once on mount — NOT on every prop change
  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  // Lazily load a single cover blob when getCoverUrl is first called for a local song
  const loadCoverForSong = useCallback(async (song: Song) => {
    if (song.source === "static") return;
    if (coverUrlMap.current.has(song.id) && coverUrlMap.current.get(song.id) !== "") return;

    const blob = await getCoverBlob(song.id);
    if (blob) {
      const url = createObjectUrl(blob);
      coverUrlMap.current.set(song.id, url);
      // Trigger re-render of components using this song's cover
      setCoverMapVersion((v) => v + 1);
    }
  }, []);

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
        audioUrl: "",
        coverUrl: "",
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

      // Pre-cache the cover blob URL so it's ready immediately
      if (coverBlob) {
        const url = createObjectUrl(coverBlob);
        coverUrlMap.current.set(id, url);
      }

      await loadSongs();
      return song;
    },
    [loadSongs]
  );

  const removeSong = useCallback(
    async (songId: string) => {
      const song = localSongs.find((s) => s.id === songId);
      if (song) {
        coverUrlMap.current.delete(songId);
      }
      await deleteLocalSong(songId);
      await loadSongs();
    },
    [localSongs, loadSongs]
  );

  const updateSong = useCallback(
    async (songId: string, data: {
      title: string;
      artist: string;
      album: string;
      lyrics: string;
      lyricsType: LyricsType;
      mood?: string;
      genre?: string;
    }) => {
      // Read existing local song from IndexedDB
      const local = await getLocalSongs();
      const existing = local.find((s) => s.id === songId);
      if (!existing) return;

      const updated: Song = {
        ...existing,
        title: data.title,
        artist: data.artist,
        album: data.album,
        lyrics: data.lyrics,
        lyricsType: data.lyricsType,
        mood: data.mood,
        genre: data.genre,
      };

      // Save updated metadata (audio/cover blobs unchanged)
      await saveLocalSong(updated);
      await loadSongs();
    },
    [loadSongs]
  );

  const value: SongLibraryContextValue = {
    allSongs,
    localSongs,
    staticSongsList: staticSongs,
    isLoading,
    error,
    addSong,
    removeSong,
    updateSong,
    getCoverUrl: (song: Song) => {
      const url = getCoverUrl(song);
      // Trigger lazy load for local song covers
      if (song.source === "local") {
        loadCoverForSong(song);
      }
      return url;
    },
    refresh: loadSongs,
  };

  return (
    <SongLibraryContext.Provider value={value}>
      {children}
    </SongLibraryContext.Provider>
  );
}