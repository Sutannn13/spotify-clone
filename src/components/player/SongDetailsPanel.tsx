"use client";

import { Clock, Disc, Zap, Moon, Sun, Heart, Type } from "lucide-react";
import { PremiumCover } from "@/components/ui/PremiumCover";
import type { Song } from "@/data/songs.types";
import { clsx } from "clsx";
import { useState } from "react";
import { LyricsTimelineEditor } from "@/components/lyrics/LyricsTimelineEditor";
import { useSongLibrary } from "@/hooks/SongLibraryProvider";

interface SongDetailsPanelProps {
  song: Song | null;
  coverResolver: (song: Song) => string;
}

function formatDuration(s: number): string {
  if (!s) return "Unknown";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m} min ${sec} sec`;
}

function getAudioFormat(filename: string): string {
  const ext = filename.split(".").pop()?.toUpperCase() ?? "AUDIO";
  return ext;
}

function getListeningMood(mood?: string, genre?: string): {
  label: string;
  emoji: React.ReactNode;
  color: string;
} | null {
  if (!mood && !genre) return null;

  const moodLower = (mood ?? genre ?? "").toLowerCase();

  const moodMap: Record<string, { label: string; emoji: React.ReactNode; color: string }> = {
    chill: { label: "Chill Vibes", emoji: <Moon className="w-4 h-4" />, color: "bg-indigo-500/20 text-indigo-400" },
    energetic: { label: "High Energy", emoji: <Zap className="w-4 h-4" />, color: "bg-orange-500/20 text-orange-400" },
    melancholic: { label: "Melancholic", emoji: <Moon className="w-4 h-4" />, color: "bg-blue-500/20 text-blue-400" },
    romantic: { label: "Romantic", emoji: <Heart className="w-4 h-4" />, color: "bg-pink-500/20 text-pink-400" },
    focus: { label: "Deep Focus", emoji: <Zap className="w-4 h-4" />, color: "bg-cyan-500/20 text-cyan-400" },
    workout: { label: "Workout Mode", emoji: <Zap className="w-4 h-4" />, color: "bg-red-500/20 text-red-400" },
    late: { label: "Late Night", emoji: <Moon className="w-4 h-4" />, color: "bg-violet-500/20 text-violet-400" },
    morning: { label: "Morning Vibes", emoji: <Sun className="w-4 h-4" />, color: "bg-amber-500/20 text-amber-400" },
  };

  for (const key of Object.keys(moodMap)) {
    if (moodLower.includes(key)) return moodMap[key];
  }

  return null;
}

export function SongDetailsPanel({ song, coverResolver }: SongDetailsPanelProps) {
  const { updateSong } = useSongLibrary();
  const [lyricsEditorOpen, setLyricsEditorOpen] = useState(false);

  const handleSaveLyrics = async (
    s: Song,
    data: { lyrics: string; lyricsType: "lrc" }
  ) => {
    await updateSong(s, {
      title: s.title,
      artist: s.artist,
      album: s.album,
      lyrics: data.lyrics,
      lyricsType: data.lyricsType,
      mood: s.mood,
      genre: s.genre,
    });
  };

  if (!song) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-text-muted py-16">
        <Disc className="w-10 h-10 opacity-30" />
        <p className="text-sm">No song selected</p>
        <p className="text-xs">Select a song to view details</p>
      </div>
    );
  }

  const coverUrl = coverResolver(song);
  const moodData = getListeningMood(song.mood, song.genre);
  const audioFormat = getAudioFormat(song.audioFileName);
  const lyricsStatus =
    song.lyricsType === "none"
      ? "Not added"
      : song.lyricsType === "plain"
        ? "Plain text"
        : "Synchronized (LRC)";
  const lyricsStatusColor =
    song.lyricsType === "none" ? "text-text-muted" : "text-emerald-400";

  return (
    <div className="h-full overflow-y-auto no-scrollbar px-6 py-8">
      <div className="flex flex-col gap-8">
        {/* Cover + title block */}
        <div className="flex flex-col items-center text-center gap-4">
          <PremiumCover
            src={coverUrl}
            alt={song.title}
            size="lg"
            rounded="2xl"
            sizes="160px"
            className="w-40 h-40"
          />

          <div>
            <h2 className="text-xl font-semibold text-text-primary tracking-tight">
              {song.title}
            </h2>
            <p className="text-sm text-text-secondary mt-1">{song.artist}</p>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-bg-hover rounded-xl p-3.5">
            <p className="text-xs text-text-muted mb-1">Album</p>
            <p className="text-sm text-text-primary font-medium truncate">
              {song.album || "Unknown Album"}
            </p>
          </div>
          <div className="bg-bg-hover rounded-xl p-3.5">
            <p className="text-xs text-text-muted mb-1">Duration</p>
            <p className="text-sm text-text-primary font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" />
              {formatDuration(song.duration)}
            </p>
          </div>
          <div className="bg-bg-hover rounded-xl p-3.5">
            <p className="text-xs text-text-muted mb-1">Audio Format</p>
            <p className="text-sm text-text-primary font-medium">{audioFormat}</p>
          </div>
          <div className="bg-bg-hover rounded-xl p-3.5">
            <p className="text-xs text-text-muted mb-1">Source</p>
            <p
              className={clsx(
                "text-sm font-medium capitalize",
                song.source === "local" ? "text-sky-400" : "text-text-primary"
              )}
            >
              {song.source === "local" ? "My Upload" : "Built-in"}
            </p>
          </div>
          <div className="bg-bg-hover rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-muted mb-1">Lyrics</p>
              {(song.source === "local" || song.source === "supabase") && (
                <button
                  type="button"
                  onClick={() => setLyricsEditorOpen(true)}
                  className="text-xs text-accent hover:text-accent/80 flex items-center gap-1 transition-colors"
                  aria-label="Edit synced lyrics"
                >
                  <Type className="w-3 h-3" />
                  Edit
                </button>
              )}
            </div>
            <p className={clsx("text-sm font-medium", lyricsStatusColor)}>
              {lyricsStatus}
            </p>
          </div>
          <div className="bg-bg-hover rounded-xl p-3.5">
            <p className="text-xs text-text-muted mb-1">Added</p>
            <p className="text-sm text-text-primary font-medium">
              {new Date(song.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Mood / genre tags */}
        {(song.mood || song.genre) && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
              Listening Mood
            </p>
            <div className="flex flex-wrap gap-2">
              {song.mood && (
                <span className="px-3 py-1.5 rounded-full bg-bg-hover text-xs font-medium text-text-secondary border border-border">
                  {song.mood}
                </span>
              )}
              {song.genre && (
                <span className="px-3 py-1.5 rounded-full bg-bg-hover text-xs font-medium text-text-secondary border border-border">
                  {song.genre}
                </span>
              )}
              {moodData && (
                <span
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5",
                    moodData.color
                  )}
                >
                  {moodData.emoji}
                  {moodData.label}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Listening session info */}
        <div className="bg-bg-hover rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Current Session
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-text-muted">File</p>
              <p className="text-xs text-text-secondary mt-0.5 truncate" title={song.audioFileName}>
                {song.audioFileName}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Encoding</p>
              <p className="text-xs text-text-secondary mt-0.5">{audioFormat}</p>
            </div>
          </div>
        </div>
      </div>

        <LyricsTimelineEditor
          isOpen={lyricsEditorOpen}
          song={song}
          onClose={() => setLyricsEditorOpen(false)}
          onSave={handleSaveLyrics}
        />
      </div>
  );
}