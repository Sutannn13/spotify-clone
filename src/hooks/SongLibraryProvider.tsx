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
  revokeObjectUrl,
} from "@/lib/indexed-db";
import { revokeCachedBlobUrl } from "@/hooks/useAudioPlayer";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  fetchSupabaseSongs,
  createSupabaseSong,
  updateSupabaseSong,
  deleteSupabaseSong,
} from "@/lib/supabase/songs";
import {
  uploadSongAudioFile,
  uploadSongCoverFile,
  deleteSupabaseStorageFiles,
} from "@/lib/supabase/storage";

interface SongLibraryContextValue {
  allSongs: Song[];
  localSongs: Song[];
  supabaseSongs: Song[];
  staticSongsList: Song[];
  isLoading: boolean;
  error: string | null;
  supabaseEnabled: boolean;
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
    uploadTarget?: "local" | "supabase";
  }) => Promise<Song>;
  removeSong: (song: Song) => Promise<void>;
  updateSong: (
    song: Song,
    data: {
      title: string;
      artist: string;
      album: string;
      lyrics: string;
      lyricsType: LyricsType;
      mood?: string;
      genre?: string;
      coverFile?: File;
    }
  ) => Promise<void>;
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

function createLocalSongId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createCloudSongId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `supabase-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function SongLibraryProvider({ children }: { children: ReactNode }) {
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [localSongs, setLocalSongs] = useState<Song[]>([]);
  const [supabaseSongs, setSupabaseSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const coverUrlMap = useRef<Map<string, string>>(new Map());
  const [coverMapVersion, setCoverMapVersion] = useState(0);
  const supabaseEnabled = isSupabaseConfigured();

  const revokeCoverUrlForSong = useCallback((songId: string) => {
    const existing = coverUrlMap.current.get(songId);
    if (existing) {
      revokeObjectUrl(existing);
    }
    coverUrlMap.current.delete(songId);
  }, []);

  const revokeAllCoverUrls = useCallback(() => {
    for (const url of coverUrlMap.current.values()) {
      if (url) {
        revokeObjectUrl(url);
      }
    }
    coverUrlMap.current.clear();
  }, []);

  const getCoverUrl = useCallback((song: Song): string => {
    if (song.source === "static" || song.source === "supabase") return song.coverUrl;
    return coverUrlMap.current.get(song.id) ?? "";
  }, []);

  const loadSongs = useCallback(async () => {
    let nextError: string | null = null;

    try {
      setIsLoading(true);

      const localPromise = getLocalSongs();
      const supabasePromise = supabaseEnabled
        ? fetchSupabaseSongs()
        : Promise.resolve<Song[]>([]);

      const [local, supabase] = await Promise.allSettled([
        localPromise,
        supabasePromise,
      ]);

      const localSongsValue = local.status === "fulfilled" ? local.value : [];
      const supabaseSongsValue = supabase.status === "fulfilled" ? supabase.value : [];

      if (local.status === "rejected") {
        nextError = "Failed to load local songs";
      }

      if (supabase.status === "rejected") {
        nextError = nextError
          ? `${nextError}. Supabase songs are temporarily unavailable.`
          : `Supabase songs are temporarily unavailable: ${supabase.reason instanceof Error ? supabase.reason.message : "unknown error"}`;
      }

      const localIds = new Set(localSongsValue.map((song) => song.id));

      // Remove stale object URLs for deleted local songs
      for (const songId of coverUrlMap.current.keys()) {
        if (!localIds.has(songId)) {
          revokeCoverUrlForSong(songId);
        }
      }

      // Build cover URL map without creating object URLs until needed
      for (const song of localSongsValue) {
        if (!coverUrlMap.current.has(song.id)) {
          // Will be lazily resolved
          coverUrlMap.current.set(song.id, "");
        }
      }

      const merged: Song[] = [
        ...supabaseSongsValue,
        ...localSongsValue,
        ...staticSongs,
      ];

      setAllSongs(merged);
      setLocalSongs(localSongsValue);
      setSupabaseSongs(supabaseSongsValue);
      setError(nextError);
    } catch {
      setError("Failed to load songs");
      setAllSongs(staticSongs);
      setLocalSongs([]);
      setSupabaseSongs([]);
    } finally {
      setIsLoading(false);
    }
  }, [revokeCoverUrlForSong, supabaseEnabled]);

  // Load songs once on mount
  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  useEffect(() => {
    return () => {
      revokeAllCoverUrls();
    };
  }, [revokeAllCoverUrls]);

  // Lazily load a single cover blob when getCoverUrl is first called for a local song
  const loadCoverForSong = useCallback(async (song: Song) => {
    if (song.source !== "local") return;
    if (coverUrlMap.current.has(song.id) && coverUrlMap.current.get(song.id) !== "") return;

    const blob = await getCoverBlob(song.id);
    if (blob) {
      const url = createObjectUrl(blob);
      const previous = coverUrlMap.current.get(song.id);
      if (previous && previous !== url) {
        revokeObjectUrl(previous);
      }
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
      uploadTarget?: "local" | "supabase";
    }): Promise<Song> => {
      const uploadTarget = data.uploadTarget ?? "local";

      if (uploadTarget === "supabase") {
        if (!supabaseEnabled) {
          throw new Error("Supabase is not configured");
        }

        const cloudSongId = createCloudSongId();
        let uploadedAudio: { fileName: string; publicUrl: string } | null = null;
        let uploadedCover: { fileName: string; publicUrl: string } | null = null;

        try {
          uploadedAudio = await uploadSongAudioFile(cloudSongId, data.audioFile);

          if (data.coverFile) {
            try {
              uploadedCover = await uploadSongCoverFile(cloudSongId, data.coverFile);
            } catch {
              // Cover upload is optional; continue without cover.
              uploadedCover = null;
            }
          }

          const created = await createSupabaseSong({
            id: cloudSongId,
            title: data.title,
            artist: data.artist,
            album: data.album,
            duration: data.duration,
            lyrics: data.lyricsType !== "none" ? data.lyrics : "",
            lyricsType: data.lyricsType,
            mood: data.mood,
            genre: data.genre,
            audioUrl: uploadedAudio.publicUrl,
            coverUrl: uploadedCover?.publicUrl,
            audioFileName: uploadedAudio.fileName,
            coverFileName: uploadedCover?.fileName,
          });

          await loadSongs();
          return created;
        } catch (err) {
          await deleteSupabaseStorageFiles({
            audioFileName: uploadedAudio?.fileName,
            coverFileName: uploadedCover?.fileName,
          });
          throw err;
        }
      }

      const id = createLocalSongId();
      const nowIso = new Date().toISOString();
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
        createdAt: nowIso,
        updatedAt: nowIso,
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
    [loadSongs, supabaseEnabled]
  );

  const removeSong = useCallback(
    async (song: Song) => {
      if (song.source === "static") {
        throw new Error("Static songs must be edited in code.");
      }

      if (song.source === "supabase") {
        await deleteSupabaseSong(song.id);
        await deleteSupabaseStorageFiles({
          audioFileName: song.audioFileName,
          coverFileName: song.coverFileName,
        });
        await loadSongs();
        return;
      }

      revokeCoverUrlForSong(song.id);
      revokeCachedBlobUrl(song.id);
      await deleteLocalSong(song.id);
      await loadSongs();
    },
    [loadSongs, revokeCoverUrlForSong]
  );

  const updateSong = useCallback(
    async (
      song: Song,
      data: {
        title: string;
        artist: string;
        album: string;
        lyrics: string;
        lyricsType: LyricsType;
        mood?: string;
        genre?: string;
        coverFile?: File;
      }
    ) => {
      if (song.source === "static") {
        throw new Error("Static songs must be edited in code.");
      }

      if (song.source === "supabase") {
        let nextCoverUrl: string | undefined;
        let nextCoverFileName: string | undefined;

        if (data.coverFile) {
          const uploadedCover = await uploadSongCoverFile(song.id, data.coverFile);
          nextCoverUrl = uploadedCover.publicUrl;
          nextCoverFileName = uploadedCover.fileName;
        }

        await updateSupabaseSong(song.id, {
          title: data.title,
          artist: data.artist,
          album: data.album,
          lyrics: data.lyricsType !== "none" ? data.lyrics : "",
          lyricsType: data.lyricsType,
          mood: data.mood,
          genre: data.genre,
          coverUrl: nextCoverUrl,
          coverFileName: nextCoverFileName,
        });

        await loadSongs();
        return;
      }

      // Read existing local song from IndexedDB
      const local = await getLocalSongs();
      const existing = local.find((s) => s.id === song.id);
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
        updatedAt: new Date().toISOString(),
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
    supabaseSongs,
    staticSongsList: staticSongs,
    isLoading,
    error,
    supabaseEnabled,
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

