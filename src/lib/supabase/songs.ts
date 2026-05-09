import type { Song, LyricsType } from "@/data/songs.types";
import { getSupabaseClient } from "./client";
import type { SupabaseSongRow } from "./types";

function normalizeLyricsType(value: string | null): LyricsType {
  if (value === "plain" || value === "lrc") return value;
  return "none";
}

export function mapSupabaseSongRow(row: SupabaseSongRow): Song {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    album: row.album ?? "Unknown Album",
    duration: Number(row.duration ?? 0),
    audioUrl: row.audio_url,
    coverUrl: row.cover_url ?? "",
    lyrics: row.lyrics ?? "",
    lyricsType: normalizeLyricsType(row.lyrics_type),
    source: "supabase",
    audioFileName: row.audio_file_name ?? "",
    coverFileName: row.cover_file_name ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    genre: row.genre ?? undefined,
    mood: row.mood ?? undefined,
  };
}

export async function fetchSupabaseSongs(): Promise<Song[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch songs: ${error.message}`);
  }

  return (data ?? []).map((row) => mapSupabaseSongRow(row as SupabaseSongRow));
}

interface CreateSupabaseSongInput {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre?: string;
  mood?: string;
  duration?: number;
  audioUrl: string;
  coverUrl?: string;
  lyrics?: string;
  lyricsType?: LyricsType;
  audioFileName?: string;
  coverFileName?: string;
}

export async function createSupabaseSong(input: CreateSupabaseSongInput): Promise<Song> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const payload = {
    id: input.id,
    title: input.title,
    artist: input.artist,
    album: input.album,
    genre: input.genre ?? null,
    mood: input.mood ?? null,
    duration: Number(input.duration ?? 0),
    audio_url: input.audioUrl,
    cover_url: input.coverUrl ?? null,
    lyrics: input.lyrics ?? "",
    lyrics_type: input.lyricsType ?? "none",
    source: "supabase" as const,
    audio_file_name: input.audioFileName ?? null,
    cover_file_name: input.coverFileName ?? null,
  };

  const { data, error } = await supabase
    .from("songs")
    .insert(payload)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create song: ${error?.message ?? "unknown error"}`);
  }

  return mapSupabaseSongRow(data as SupabaseSongRow);
}

interface UpdateSupabaseSongInput {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  mood?: string;
  duration?: number;
  lyrics?: string;
  lyricsType?: LyricsType;
  coverUrl?: string;
  coverFileName?: string;
}

export async function updateSupabaseSong(
  songId: string,
  input: UpdateSupabaseSongInput
): Promise<Song> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const payload = {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.artist !== undefined ? { artist: input.artist } : {}),
    ...(input.album !== undefined ? { album: input.album } : {}),
    ...(input.genre !== undefined ? { genre: input.genre || null } : {}),
    ...(input.mood !== undefined ? { mood: input.mood || null } : {}),
    ...(input.duration !== undefined ? { duration: Number(input.duration) } : {}),
    ...(input.lyrics !== undefined ? { lyrics: input.lyrics } : {}),
    ...(input.lyricsType !== undefined ? { lyrics_type: input.lyricsType } : {}),
    ...(input.coverUrl !== undefined ? { cover_url: input.coverUrl || null } : {}),
    ...(input.coverFileName !== undefined ? { cover_file_name: input.coverFileName || null } : {}),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("songs")
    .update(payload)
    .eq("id", songId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Failed to update song: ${error?.message ?? "unknown error"}`);
  }

  return mapSupabaseSongRow(data as SupabaseSongRow);
}

export async function deleteSupabaseSong(songId: string): Promise<Song | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const { data, error } = await supabase
    .from("songs")
    .delete()
    .eq("id", songId)
    .select("*")
    .maybeSingle();

  if (error) {
    const lowerMessage = error.message.toLowerCase();
    if (
      error.code === "42501" ||
      lowerMessage.includes("row-level security") ||
      lowerMessage.includes("permission denied") ||
      lowerMessage.includes("not allowed")
    ) {
      throw new Error("Delete failed. Check Supabase delete policy.");
    }
    throw new Error(`Failed to delete song: ${error.message}`);
  }

  return data ? mapSupabaseSongRow(data as SupabaseSongRow) : null;
}

