# Aura Music Player Project Brief

## Product Scope
- Web music player inspired by Spotify interaction patterns.
- Built with Next.js App Router + React client components.
- Playback must persist across route navigation.
- Song catalog is merged from three sources:
  - Built-in static songs
  - Local songs stored in IndexedDB
  - Cloud songs stored in Supabase

## Current Capabilities
- Home, Library, Search, Liked, Recently Played, Made for You, Mood Queue.
- Persistent playback state via Zustand.
- Fullscreen player with multi-slide surface (Cover, Lyrics, Queue, Details).
- Upload/edit/delete flows for local and Supabase song records.
- Supabase cover rendering and metadata sync.

## Active Constraints
- Do not rewrite major architecture.
- Do not break playback continuity.
- Do not break route navigation audio persistence.
- Do not expose Supabase service role keys in frontend code.
- Keep static/local/supabase source behavior intact.

## Current Task Goal
- Fix Home song-management actions and non-working More options button.
- Add premium cover-focus transition in fullscreen player without breaking close gestures.
- Audit and fix safe interaction bugs (mobile hover-only actions, event propagation, source-safe actions).
