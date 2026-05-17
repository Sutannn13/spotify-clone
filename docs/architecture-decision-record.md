# Architecture Decision Record

## ADR-001: Persistent Client Playback
- Status: Accepted
- Decision: Use a singleton HTMLAudioElement (`useAudioPlayer`) and Zustand store to prevent route-change restarts.
- Rationale: Keeps playback state and media element stable while App Router re-renders client trees.

## ADR-002: Multi-Source Song Library Merge
- Status: Accepted
- Decision: Use `SongLibraryProvider` as the single source for merged `allSongs` from static, local IndexedDB, and Supabase.
- Rationale: Centralized source merging avoids per-page divergence and keeps playback list identity stable.

## ADR-003: Layout-Scoped Song Management Actions
- Status: Accepted
- Decision: Expose edit/delete/add handlers via `MainLayout` context (`useLayout`) and pass handlers to page-level list/card components.
- Rationale: Keeps admin gating, dialogs, and side-effects in one orchestration layer.

## ADR-004: Source-Safe Song Mutations
- Status: Accepted
- Decision: Static songs are read-only. Local and Supabase songs are mutable with source-specific deletion/update flows.
- Rationale: Prevents accidental mutation of shipped catalog data and preserves cloud/local integrity.

## ADR-005: Fullscreen Cover Focus Interaction
- Status: Accepted
- Decision: Cover-focus drag interaction is scoped to the cover area on desktop; mobile uses a simple toggle and retains modal close drag.
- Rationale: Prevents gesture conflict between content interaction and fullscreen-dismiss behavior.
