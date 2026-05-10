"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Play,
  Pause,
  Save,
  SkipBack,
  Clock,
  AlertCircle,
  Music2,
} from "lucide-react";
import { clsx } from "clsx";
import { usePlayerStore } from "@/store/playerStore";
import { useSongLibrary } from "@/hooks/SongLibraryProvider";
import { useToast } from "@/components/ui/Toast";
import type { Song } from "@/data/songs.types";

interface LyricLine {
  time: number; // seconds
  text: string;
}

interface LyricsTimelineEditorProps {
  isOpen: boolean;
  song: Song | null;
  onClose: () => void;
  onSave: (
    song: Song,
    data: {
      lyrics: string;
      lyricsType: "lrc";
    }
  ) => Promise<void>;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
}

function parseTimeToSeconds(timeStr: string): number | null {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?$/);
  if (!match) return null;
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  const ms = match[3] ? parseInt(match[3].padEnd(3, "0").slice(0, 3), 10) : 0;
  return minutes * 60 + seconds + ms / 1000;
}

function lrcToLines(lrc: string): LyricLine[] {
  const lineRegex = /^\[(\d{2}:\d{2}(?:\.\d{1,3})?)\]\s*(.*)$/;
  const lines: LyricLine[] = [];
  for (const line of lrc.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(lineRegex);
    if (match) {
      const seconds = parseTimeToSeconds(match[1]);
      const text = match[2].trim();
      if (seconds !== null) {
        lines.push({ time: seconds, text });
      }
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}

function linesToLrc(lines: LyricLine[]): string {
  return lines
    .sort((a, b) => a.time - b.time)
    .map((line) => `[${formatTime(line.time)}] ${line.text}`)
    .join("\n");
}

export function LyricsTimelineEditor({
  isOpen,
  song,
  onClose,
  onSave,
}: LyricsTimelineEditorProps) {
  const { toast } = useToast();
  const currentSong = usePlayerStore((s) => {
    const playlist = s.playlist;
    const idx = s.currentIndex;
    return idx >= 0 && idx < playlist.length ? playlist[idx] : null;
  });
  const currentTime = usePlayerStore((s) => s.currentTime);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const seek = usePlayerStore((s) => s.seek);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const { updateSong } = useSongLibrary();

  const [lines, setLines] = useState<LyricLine[]>([]);
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Sync lines from song
  useEffect(() => {
    if (song && isOpen) {
      if (song.lyricsType === "lrc" && song.lyrics.trim()) {
        setLines(lrcToLines(song.lyrics));
      } else {
        setLines([]);
      }
      setError(null);
    }
  }, [song, isOpen]);

  // Focus edit input
  useEffect(() => {
    if (editingLineIndex !== null) {
      editInputRef.current?.focus();
    }
  }, [editingLineIndex]);

  const isCurrentSong = currentSong?.id === song?.id;

  const handleAddLineAtCurrentTime = useCallback(() => {
    if (!isCurrentSong) {
      setError("Play the song first to add lyrics at the current time.");
      return;
    }
    const time = currentTime;
    setLines((prev) => {
      const newLines = [...prev, { time, text: "" }].sort((a, b) => a.time - b.time);
      return newLines;
    });
    setError(null);
  }, [isCurrentSong, currentTime]);

  const handleEditLine = useCallback((index: number) => {
    setEditingLineIndex(index);
    setEditText(lines[index].text);
  }, [lines]);

  const handleSaveLine = useCallback(() => {
    if (editingLineIndex === null) return;
    setLines((prev) => {
      const next = [...prev];
      next[editingLineIndex] = { ...next[editingLineIndex], text: editText };
      return next;
    });
    setEditingLineIndex(null);
    setEditText("");
  }, [editingLineIndex, editText]);

  const handleDeleteLine = useCallback((index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleLineClick = useCallback((time: number) => {
    if (isCurrentSong) {
      seek(time);
    }
  }, [isCurrentSong, seek]);

  const handleSave = async () => {
    if (!song) return;
    // Validate non-empty lines
    const emptyLines = lines.filter((l) => !l.text.trim());
    if (emptyLines.length > 0) {
      setError("Please fill in all lyric line texts or delete empty lines.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const lrcContent = linesToLrc(lines);
      await onSave(song, { lyrics: lrcContent, lyricsType: "lrc" });
      toast("Synced lyrics saved successfully", "success");
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save lyrics";
      setError(message);
      toast(message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isSaving) return;
    setLines([]);
    setEditingLineIndex(null);
    setEditText("");
    setError(null);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveLine();
    }
    if (e.key === "Escape") {
      setEditingLineIndex(null);
      setEditText("");
    }
  };

  if (!song) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[55] bg-black/70 backdrop-blur-sm"
          />

          {/* Editor Panel */}
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 bottom-0 z-[55] w-full max-w-lg bg-bg-elevated border-l border-border shadow-2xl shadow-black/50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div>
                <h2 className="text-base font-semibold text-text-primary">
                  Lyrics Timeline
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  {song.title} · {song.artist}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close lyrics editor"
                className="w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Player controls */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border shrink-0">
              {isCurrentSong ? (
                <>
                  {isLoading ? (
                    <div className="w-8 h-8 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                    </div>
                  ) : isPlaying ? (
                    <button
                      type="button"
                      onClick={pause}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-hover text-text-primary hover:bg-bg-base transition-colors"
                      aria-label="Pause"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={play}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-hover text-text-primary hover:bg-bg-base transition-colors"
                      aria-label="Play"
                    >
                      <Play className="w-4 h-4 ml-0.5" />
                    </button>
                  )}
                  <span className="text-xs font-mono text-text-secondary tabular-nums">
                    {formatTime(currentTime)}
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Play the song to use the timeline
                </div>
              )}
              <button
                type="button"
                onClick={handleAddLineAtCurrentTime}
                disabled={!isCurrentSong}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
                Add line at current time
              </button>
            </div>

            {/* Lines list */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1.5">
              {lines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Clock className="w-8 h-8 text-text-muted" />
                  <p className="text-sm font-medium text-text-primary">No lyrics yet</p>
                  <p className="text-xs text-text-secondary text-center max-w-xs">
                    Play the song and tap "Add line at current time" to build synced lyrics line by line.
                  </p>
                </div>
              ) : (
                lines.map((line, i) => {
                  const isActive =
                    isCurrentSong &&
                    currentTime >= line.time &&
                    (i === lines.length - 1 || currentTime < lines[i + 1].time);
                  const isEditing = editingLineIndex === i;

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.2 }}
                      className={clsx(
                        "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors group",
                        isActive && isCurrentSong
                          ? "bg-accent/10 border border-accent/20"
                          : "hover:bg-bg-hover"
                      )}
                    >
                      <span
                        className={clsx(
                          "shrink-0 text-xs font-mono tabular-nums min-w-[72px] cursor-pointer",
                          isActive && isCurrentSong
                            ? "text-accent font-bold"
                            : "text-text-muted hover:text-text-primary"
                        )}
                        onClick={() => handleLineClick(line.time)}
                        title="Click to seek"
                      >
                        {formatTime(line.time)}
                      </span>

                      {isEditing ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onBlur={handleSaveLine}
                          onKeyDown={handleKeyDown}
                          className="flex-1 bg-bg-base border border-accent rounded px-2 py-1 text-sm text-text-primary focus:outline-none"
                          placeholder="Enter lyric text..."
                        />
                      ) : (
                        <span
                          className={clsx(
                            "flex-1 text-sm cursor-pointer",
                            line.text
                              ? isActive && isCurrentSong
                                ? "text-text-primary font-medium"
                                : "text-text-secondary"
                              : "text-text-muted italic"
                          )}
                          onClick={() => handleEditLine(i)}
                        >
                          {line.text || "(empty line)"}
                        </span>
                      )}

                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => handleEditLine(i)}
                          className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Edit line"
                        >
                          <span className="text-xs">✏️</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteLine(i)}
                        className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete line"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border shrink-0 space-y-3">
              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </div>
              )}

              {/* LRC preview */}
              {lines.length > 0 && (
                <details className="group">
                  <summary className="text-xs text-text-muted cursor-pointer hover:text-text-secondary">
                    Preview LRC format
                  </summary>
                  <pre className="mt-1 text-[10px] font-mono text-text-muted bg-bg-base border border-border rounded-lg px-3 py-2 overflow-x-auto max-h-32">
                    {linesToLrc(lines)}
                  </pre>
                </details>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-text-secondary border border-border hover:bg-bg-hover transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || lines.length === 0}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-text-primary text-bg-base hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-bg-base/30 border-t-bg-base rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Lyrics
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}