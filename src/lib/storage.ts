"use client";

/**
 * Local storage utilities for liked songs and recently played history.
 * Uses localStorage for lightweight persistence across sessions.
 */

const LIKED_SONGS_KEY = "aura-liked-songs";
const RECENT_PLAYS_KEY = "aura-recent-plays";
const MAX_RECENT_PLAYS = 50;

// --- Liked Songs ---

export function getLikedSongIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LIKED_SONGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isLikedSong(songId: string): boolean {
  return getLikedSongIds().includes(songId);
}

export function toggleLikeSong(songId: string): boolean {
  const ids = getLikedSongIds();
  const index = ids.indexOf(songId);
  if (index >= 0) {
    ids.splice(index, 1);
    localStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(ids));
    // Notify other tabs and same-tab components
    window.dispatchEvent(new Event("aura-likes-changed"));
    return false; // unliked
  } else {
    ids.unshift(songId);
    localStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event("aura-likes-changed"));
    return true; // liked
  }
}

export function setLikedSongs(ids: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("aura-likes-changed"));
}

export function removeLikedSongId(songId: string): void {
  if (typeof window === "undefined") return;
  const next = getLikedSongIds().filter((id) => id !== songId);
  localStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("aura-likes-changed"));
}

// --- Recently Played ---

export interface RecentPlay {
  songId: string;
  playedAt: string; // ISO 8601
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

/**
 * Track a song play. If the song was played recently, update its timestamp
 * instead of inserting a duplicate. Newest first.
 */
export function trackRecentPlay(songId: string): void {
  if (typeof window === "undefined") return;
  const plays = getRecentPlays();
  const existing = plays.findIndex((p) => p.songId === songId);
  if (existing >= 0) {
    plays.splice(existing, 1);
  }
  plays.unshift({ songId, playedAt: new Date().toISOString() });
  // Cap at max
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
