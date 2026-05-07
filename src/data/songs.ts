// Re-export the canonical Song type from songs.types
export type { Song, LyricsType, SongSource } from "./songs.types";

// This file is kept for backward compatibility.
// Song data lives in:
//   - static-songs.ts  (for built-in / public folder songs)
//   - IndexedDB        (for user-uploaded local songs)