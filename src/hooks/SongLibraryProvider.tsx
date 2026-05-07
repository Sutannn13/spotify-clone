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
  getAudioBlob,
  getCoverBlob,
  createObjectUrl,
  revokeObjectUrl,
  openDB,
  STORES,
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
  if (!ctx) throw new Error("useSongLibrary must be used within SongLibraryProvider");
  return ctx;
}

export function SongLibraryProvider({ children }: { children: ReactNode }) {
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [localSongs, setLocalSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const blobUrlCache = useRef<Map<string, string>>(new Map());
  const coverCache = useRef<Map<string, string>>(new Map());

  const getCoverUrl = useCallback((song: Song): string => {
    if (song.source === "static") {
      return song.coverUrl;
    }

    if (coverCache.current.has(song.id)) {
      return coverCache.current.get(song.id)!;
    }

    return "";
  }, []);

  const loadSongs = useCallback(async () => {
    try {
      setIsLoading(true);
      const local = await getLocalSongs();

      // Revoke old blob URLs for local songs
      coverCache.current.forEach((url) => {
        if (url.startsWith("blob:")) revokeObjectUrl(url);
      });
      blobUrlCache.current.forEach((url) => {
        if (url.startsWith("blob:")) revokeObjectUrl(url);
      });
      coverCache.current.clear();
      blobUrlCache.current.clear();

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

  // Load cover blobs and cache URLs
  const loadCoverBlob = useCallback(async (song: Song): Promise<string> => {
    if (song.source === "static") return song.coverUrl;
    if (coverCache.current.has(song.id)) return coverCache.current.get(song.id)!;

    const blob = await getCoverBlob(song.id);
    if (blob) {
      const url = createObjectUrl(blob);
      coverCache.current.set(song.id, url);
      return url;
    }
    return "";
  }, []);

  useEffect(() => {
    loadSongs();
    return () => {
      blobUrlCache.current.forEach((url) => revokeObjectUrl(url));
      coverCache.current.forEach((url) => revokeObjectUrl(url));
    };
  }, [loadSongs]);

  // Preload cover URLs for visible songs
  useEffect(() => {
    const preload = async () => {
      for (const song of allSongs) {
        if (song.source === "local") {
          loadCoverBlob(song).catch(() => {});
        }
      }
    };
    preload();
  }, [allSongs, loadCoverBlob]);

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

      // Cache cover URL
      if (coverBlob) {
        const coverUrl = createObjectUrl(coverBlob);
        coverCache.current.set(id, coverUrl);
      }

      await loadSongs();
      return song;
    },
    [loadSongs]
  );

  const removeSong = useCallback(
    async (songId: string) => {
      const song = localSongs.find((s) => s.id === songId);
      if (!song) return;

      blobUrlCache.current.delete(songId);
      coverCache.current.delete(songId);

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
      const db = await openDB();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORES.SONGS, "readwrite");
        const store = tx.objectStore(STORES.SONGS);
        const request = store.get(songId);

        request.onsuccess = () => {
          const song = request.result as Song;
          if (!song) {
            reject(new Error("Song not found"));
            return;
          }
          const updatedSong: Song = {
            ...song,
            title: data.title,
            artist: data.artist,
            album: data.album,
            lyrics: data.lyrics,
            lyricsType: data.lyricsType,
            mood: data.mood,
            genre: data.genre,
          };
          store.put(updatedSong);
          tx.oncomplete = () => {
            loadSongs();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
        request.onerror = () => reject(request.error);
      });
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
    getCoverUrl,
    refresh: loadSongs,
  };

  return (
    <SongLibraryContext.Provider value={value}>
      {children}
    </SongLibraryContext.Provider>
  );
}
