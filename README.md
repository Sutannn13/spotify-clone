# Aura — Premium Music Player

A polished, portfolio-quality front-end music player built with Next.js, TypeScript, Tailwind CSS, and Framer Motion. Deployable to Vercel. Features both built-in static songs and a browser-based library for user-uploaded music.

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Architecture Overview

```
src/
├── app/
│   ├── layout.tsx              # Root layout (providers: SongLibrary + Toast)
│   ├── page.tsx                # Homepage (hero + grid + full song list)
│   ├── library/page.tsx        # Library page
│   ├── search/page.tsx         # Search placeholder
│   └── globals.css            # Design tokens + custom animations
│
├── components/
│   ├── layout/
│   │   ├── MainLayout.tsx      # Responsive shell + modal orchestration
│   │   ├── Sidebar.tsx         # Desktop nav + Add Song button
│   │   └── Header.tsx          # Mobile header + Add Song button
│   ├── player/
│   │   ├── Player.tsx           # Sticky bottom bar (desktop)
│   │   ├── MiniPlayer.tsx       # Mobile mini bar
│   │   ├── PlayerFullscreen.tsx # Legacy fullscreen (desktop)
│   │   ├── NowPlayingModal.tsx  # New swipeable fullscreen modal
│   │   ├── ProgressBar.tsx     # Seekable progress
│   │   ├── VolumeControl.tsx   # Volume slider + mute
│   │   ├── PlayerControls.tsx  # Play/pause/next/prev/repeat/shuffle
│   │   ├── QueuePanel.tsx       # Queue / Up Next slide
│   │   └── SongDetailsPanel.tsx # Song metadata + mood slide
│   └── music/
│       ├── SongCard.tsx        # Grid card with hover play overlay
│       ├── SongList.tsx        # List/table view with per-row actions
│       ├── HeroSection.tsx    # Featured song hero
│       ├── LyricsPanel.tsx     # Plain text or LRC synchronized lyrics
│       ├── EmptyLibrary.tsx    # Premium empty state with CTA
│       ├── AddSongModal.tsx    # Upload modal for local songs
│       └── DeleteSongDialog.tsx # Delete confirmation dialog
├── components/ui/
│   └── Toast.tsx               # Toast notification system
├── data/
│   ├── songs.types.ts          # Canonical Song type definition
│   └── static-songs.ts        # Built-in static songs (public folder)
├── hooks/
│   ├── SongLibraryProvider.tsx # React context for library operations
│   └── useAudioPlayer.ts       # HTML5 Audio hook (singleton)
├── lib/
│   └── indexed-db.ts           # IndexedDB operations for local songs
└── store/
    └── playerStore.ts          # Zustand global player state

public/
├── songs/                       # Static .mp3 audio files
└── covers/                     # Static cover images
```

---

## Adding Songs

### Static Songs (built-in, lives in `public/`)

1. Place your `.mp3` files in `public/songs/`
2. Place your cover images in `public/covers/`
3. Add entries to `src/data/static-songs.ts`:

```ts
{
  id: "static-my-song",
  title: "My Song Title",
  artist: "Artist Name",
  album: "Album Name",
  audioUrl: "/songs/my-song.mp3",
  coverUrl: "/covers/my-cover.webp",
  lyrics: "",
  lyricsType: "none",
  source: "static",
  audioFileName: "my-song.mp3",
  coverFileName: "my-cover.webp",
  duration: 0,  // auto-detected at playback
  createdAt: new Date().toISOString(),
}
```

### User-Uploaded Songs (browser IndexedDB)

Click **Add Song** in the sidebar or header. Fill in:
- **Audio file** (MP3, WAV, M4A — required)
- **Cover image** (JPG, PNG, WebP — optional; a placeholder is shown if omitted)
- **Title** and **Artist** (required)
- **Album**, **Duration**, **Mood**, **Genre** (optional)
- **Lyrics** (plain text or LRC synchronized format)

Songs are stored as blobs in IndexedDB and persist in the same browser. Object URLs are managed and cleaned up automatically to prevent memory leaks.

### Lyrics Formats

**Plain text**:
```ts
lyricsType: "plain",
lyrics: `First verse line
Second verse line
Bridge: some lyrics`,
```

**LRC synchronized** (timestamps in `[mm:ss.xx]`):
```ts
lyricsType: "lrc",
lyrics: `[00:00.00] First line
[00:05.50] Second line
[00:10.00] Third line`,
```

Lines with multiple timestamps on the same line are supported. Tap any lyric line to seek to that timestamp.

---

## Fullscreen Player

Click the **bottom player bar** (desktop) or **mini player** (mobile) to open the full Now Playing modal. It has **4 swipeable slides**:

| Slide | Content |
|---|---|
| Cover | Large album art, song title, artist, album |
| Lyrics | Synchronized (LRC) or plain text with tap-to-seek |
| Queue | Full playlist with play controls per song |
| Details | Metadata, mood tags, session info |

On mobile: **swipe left/right** to navigate. On desktop: use the **tab indicators** or arrow buttons. Pull the modal **down** to dismiss.

---

## Data Model

```ts
interface Song {
  id: string;              // "static-*" for built-in, "local-*" for uploads
  title: string;
  artist: string;
  album: string;
  duration: number;        // seconds (0 = auto-detected)
  audioUrl: string;        // resolved at runtime (path or blob URL)
  coverUrl: string;        // resolved at runtime
  lyrics: string;          // plain text or LRC
  lyricsType: "none" | "plain" | "lrc";
  source: "static" | "local";
  audioFileName: string;
  coverFileName: string;
  createdAt: string;       // ISO date string
  mood?: string;
  genre?: string;
}
```

---

## Deploy to Vercel

```bash
npm install
npm run build
```

Connect your GitHub repository to Vercel. The build command is `npm run build` and the output directory is `.next`. No environment variables are required for the first version.

---

## Tech Stack

| Concern | Library |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| State | Zustand |
| Animation | Framer Motion |
| Icons | Lucide React |
| Audio | HTML5 Audio API |
| Storage | IndexedDB (browser blobs) |
