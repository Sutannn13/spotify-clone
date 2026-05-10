"use client";

/**
 * Unified liked songs API — coordinates localStorage and Supabase cloud storage.
 * - Authenticated users: writes go to both local + cloud, reads prefer cloud.
 * - Guest users: uses localStorage only.
 */

import { getSupabaseClient } from "./supabase/client";
import { getCurrentUser } from "./supabase/auth";

export type LikeStatus = "local" | "cloud" | "both";

/** Check if a song is liked. Returns source info. */
export async function checkLikeStatus(songId: string): Promise<{
  liked: boolean;
  status: LikeStatus;
}> {
  const user = await getCurrentUser();

  if (user) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data } = await supabase
        .from("liked_songs")
        .select("song_id")
        .eq("user_id", user.id)
        .eq("song_id", songId)
        .maybeSingle();

      if (data) {
        return { liked: true, status: "cloud" };
      }
    }
    // Cloud failed or not found — check local as fallback
    const localLiked = localLikedSongIds().includes(songId);
    return { liked: localLiked, status: "local" };
  }

  // Not logged in — local only
  return {
    liked: localLikedSongIds().includes(songId),
    status: "local",
  };
}

/** Toggle like for a song. Syncs to cloud when logged in. */
export async function toggleLike(
  songId: string,
  songSource: "static" | "local" | "supabase" = "supabase"
): Promise<boolean> {
  const localIds = localLikedSongIds();
  const wasLiked = localIds.includes(songId);

  // Always update localStorage first (offline-first)
  if (wasLiked) {
    const next = localIds.filter((id) => id !== songId);
    setLocalLikedSongIds(next);
  } else {
    setLocalLikedSongIds([songId, ...localIds]);
  }

  // Also sync to cloud if logged in
  const user = await getCurrentUser();
  if (user) {
    const supabase = getSupabaseClient();
    if (supabase) {
      if (wasLiked) {
        await supabase
          .from("liked_songs")
          .delete()
          .eq("user_id", user.id)
          .eq("song_id", songId);
      } else {
        await supabase
          .from("liked_songs")
          .upsert(
            { user_id: user.id, song_id: songId, song_source: songSource },
            { onConflict: "user_id,song_id" }
          );
      }
    }
  }

  return !wasLiked;
}

/** Get all liked song IDs, preferring cloud when logged in. */
export async function getAllLikedSongIds(): Promise<string[]> {
  const user = await getCurrentUser();

  if (user) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data } = await supabase
        .from("liked_songs")
        .select("song_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!data || data.length === 0) {
        // No cloud data yet — try local
        return localLikedSongIds();
      }

      return data.map((row) => row.song_id);
    }
  }

  return localLikedSongIds();
}

// --- Local-only helpers (keep existing names for compatibility) ---

const LIKED_SONGS_KEY = "aura-liked-songs";
const RECENT_PLAYS_KEY = "aura-recent-plays";
const MAX_RECENT_PLAYS = 50;

export function getLikedSongIds(): string[] {
  return localLikedSongIds();
}

export function isLikedSong(songId: string): boolean {
  return localLikedSongIds().includes(songId);
}

export function toggleLikeSong(songId: string): boolean {
  return _toggleLocalLikeSong(songId);
}

function localLikedSongIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LIKED_SONGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalLikedSongIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("aura-likes-changed"));
}

function _toggleLocalLikeSong(songId: string): boolean {
  const ids = localLikedSongIds();
  const index = ids.indexOf(songId);
  if (index >= 0) {
    ids.splice(index, 1);
    setLocalLikedSongIds(ids);
    return false;
  } else {
    ids.unshift(songId);
    setLocalLikedSongIds(ids);
    return true;
  }
}

export function setLikedSongs(ids: string[]): void {
  setLocalLikedSongIds(ids);
}

export function removeLikedSongId(songId: string): void {
  if (typeof window === "undefined") return;
  const next = localLikedSongIds().filter((id) => id !== songId);
  setLocalLikedSongIds(next);
}

// --- Recently Played ---

export interface RecentPlay {
  songId: string;
  playedAt: string;
}

export function getRecentPlays(): RecentPlay[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_PLAYS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function trackRecentPlay(songId: string): void {
  if (typeof window === "undefined") return;
  const plays = getRecentPlays();
  const existing = plays.findIndex((p) => p.songId === songId);
  if (existing >= 0) {
    plays.splice(existing, 1);
  }
  plays.unshift({ songId, playedAt: new Date().toISOString() });
  if (plays.length > MAX_RECENT_PLAYS) {
    plays.length = MAX_RECENT_PLAYS;
  }
  localStorage.setItem(RECENT_PLAYS_KEY, JSON.stringify(plays));
  window.dispatchEvent(new Event("aura-recent-plays-changed"));
  window.dispatchEvent(new Event("aura-track-play"));
}

export function clearRecentPlays(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RECENT_PLAYS_KEY);
  window.dispatchEvent(new Event("aura-recent-plays-changed"));
}

export function removeRecentPlaySongId(songId: string): void {
  if (typeof window === "undefined") return;
  const next = getRecentPlays().filter((item) => item.songId !== songId);
  localStorage.setItem(RECENT_PLAYS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("aura-recent-plays-changed"));
}