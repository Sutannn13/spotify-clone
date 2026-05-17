# Aura Music Flow Overview

## 1. App Boot
1. `RootLayout` mounts `AdminAuthProvider`, `SongLibraryProvider`, `ToastProvider`, and persistent `MainLayout`.
2. `SongLibraryProvider` loads static + local + Supabase songs and publishes merged collections.
3. `MainLayout` synchronizes merged songs to player store while preserving currently playing track when possible.

## 2. Playback Flow
1. User taps/clicks a song from list/card/queue surfaces.
2. UI calls `usePlaybackActions.playOrPause`.
3. Store updates current song/index and playback flags.
4. `useAudioPlayer` resolves source URL (static/supabase direct URL, local blob URL) and drives singleton audio.
5. Player surfaces (`Player`, `MiniPlayer`, fullscreen modal) reflect store state.

## 3. Song Management Flow
1. Page component calls layout handlers via `useLayout`.
2. `MainLayout` opens modal/dialog and enforces source/admin guardrails.
3. Confirmed actions call `SongLibraryProvider` methods:
   - `removeSong` for local/Supabase deletion
   - `updateSong` for metadata edits
4. Player queue/playlist and local side data (liked/recent) are cleaned up on deletion.

## 4. Fullscreen Player Flow
1. User opens fullscreen from mini/desktop player.
2. User navigates slide tabs: Cover, Lyrics, Queue, Details.
3. Cover slide supports focused cover interaction while keeping controls and playback state intact.
4. Dismiss uses explicit close button and vertical dismiss gesture on mobile.
