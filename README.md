# Aura — Premium Music Player

A polished, portfolio-quality front-end music player built with Next.js, TypeScript, Tailwind CSS, and Framer Motion. Deployable to Vercel.

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Adding Music

### 1. Audio files

Place your `.mp3` files in `public/songs/`:

```bash
public/songs/
├── midnight-reverie.mp3
├── velvet-horizons.mp3
└── ...
```

### 2. Cover images

Place your cover images in `public/covers/`, then reference them as `/covers/filename.jpg` in the data file. Alternatively, use remote URLs (Unsplash, S3, etc.) — already configured in `next.config.ts`.

### 3. Define songs

Open `src/data/songs.ts` and add or modify song entries:

```ts
{
  id: "7",
  title: "Your Song Title",
  artist: "Artist Name",
  album: "Album Name",
  audioUrl: "/songs/your-song.mp3",
  coverUrl: "/covers/cover.jpg",
  lyrics: `[00:00.00] Verse one...
[00:05.00] [00:10.00] Two timestamps in one line...`,
  lyricsType: "lrc",   // "lrc" or "plain"
  duration: 210,        // seconds (optional — auto-detected)
},
```

### Lyrics formats

**Plain text** — multiline text, displayed as a scrollable block:

```ts
lyrics: `First line of the song
Second line
Bridge: some lyrics here`,
lyricsType: "plain",
```

**LRC (synchronized)** — timestamps in `[mm:ss.xx]` format:

```ts
lyrics: `[00:00.00] First line
[00:05.50] Second line
[00:10.00] Third line`,
lyricsType: "lrc",
```

LRC lines with multiple timestamps on the same line are supported.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   ├── library/page.tsx    # Library page
│   ├── search/page.tsx     # Search page (placeholder)
│   └── globals.css         # Global styles + CSS variables
├── components/
│   ├── layout/
│   │   ├── MainLayout.tsx  # Responsive shell
│   │   ├── Sidebar.tsx     # Desktop navigation
│   │   └── Header.tsx      # Mobile header
│   ├── player/
│   │   ├── Player.tsx           # Sticky bottom bar (desktop)
│   │   ├── MiniPlayer.tsx       # Mobile mini bar
│   │   ├── PlayerFullscreen.tsx # Full-screen overlay (mobile)
│   │   ├── ProgressBar.tsx     # Seekable progress
│   │   ├── PlayerControls.tsx  # Play/pause/next/prev/repeat/shuffle
│   │   └── VolumeControl.tsx   # Volume slider
│   └── music/
│       ├── SongCard.tsx        # Grid card
│       ├── SongList.tsx        # List/table view
│       ├── HeroSection.tsx     # Featured song hero
│       ├── NowPlayingInfo.tsx  # Compact now playing info
│       └── LyricsPanel.tsx     # Plain text or LRC lyrics
├── store/
│   └── playerStore.ts      # Zustand global player state
├── hooks/
│   └── useAudioPlayer.ts  # HTML5 Audio wrapper
├── lib/
│   └── lrc-parser.ts      # LRC timestamp parser
└── data/
    └── songs.ts            # Song definitions

public/
├── songs/                  # Audio files go here
└── covers/                # Cover images go here
```

---

## Deploy to Vercel

```bash
npm install
npm run build
```

Connect your GitHub repository to Vercel. The build command is `npm run build` and the output directory is `.next`.

---

## Features

- **Play / Pause / Next / Previous** with full playback control
- **Seekable progress bar** with hover preview
- **Volume control** with mute toggle
- **Repeat** (none → all → one)
- **Shuffle** playback
- **Synchronized LRC lyrics** with active line highlighting and auto-scroll
- **Plain text lyrics** scrollable panel
- **Desktop**: sticky bottom player bar + sidebar navigation
- **Mobile**: mini player bar + fullscreen player sheet with slide-up animation
- **Current song highlight** in the song list
- **Hero section** with featured song
- **Responsive grid** song cards
- **Framer Motion** animations — subtle, not flashy
- **Touch-friendly** controls (min 44px targets)
- **Zero backend** — all client-side

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