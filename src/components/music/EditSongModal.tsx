"use client";

import { useState, useCallback, useId, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import type { Song, LyricsType } from "@/data/songs.types";
import { useToast } from "@/components/ui/Toast";

interface EditSongModalProps {
  isOpen: boolean;
  song: Song | null;
  onClose: () => void;
  onSave: (songId: string, data: {
    title: string;
    artist: string;
    album: string;
    lyrics: string;
    lyricsType: LyricsType;
    mood?: string;
    genre?: string;
  }) => Promise<void>;
}

const MOOD_OPTIONS = [
  "Chill",
  "Energetic",
  "Melancholic",
  "Romantic",
  "Focus",
  "Workout",
  "Late Night",
  "Morning",
];

const GENRE_OPTIONS = [
  "Pop",
  "Rock",
  "Hip Hop",
  "R&B",
  "Electronic",
  "Indie",
  "Acoustic",
  "Jazz",
  "Classical",
  "Other",
];

export function EditSongModal({ isOpen, song, onClose, onSave }: EditSongModalProps) {
  const { toast } = useToast();
  const formId = useId();

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [lyricsType, setLyricsType] = useState<LyricsType>("none");
  const [mood, setMood] = useState("");
  const [genre, setGenre] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when song changes
  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist);
      setAlbum(song.album);
      setLyrics(song.lyrics);
      setLyricsType(song.lyricsType);
      setMood(song.mood ?? "");
      setGenre(song.genre ?? "");
      setErrors({});
    }
  }, [song]);

  const handleClose = useCallback(() => {
    setErrors({});
    setIsSubmitting(false);
    onClose();
  }, [onClose]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!artist.trim()) newErrors.artist = "Artist is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!song || !validate()) return;

    setIsSubmitting(true);
    try {
      await onSave(song.id, {
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim() || "Unknown Album",
        lyrics: lyricsType !== "none" ? lyrics : "",
        lyricsType,
        mood: mood || undefined,
        genre: genre || undefined,
      });
      toast("Song updated successfully", "success");
      handleClose();
    } catch {
      toast("Failed to update song. Please try again.", "error");
      setIsSubmitting(false);
    }
  };

  if (!song) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-lg bg-bg-elevated border border-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Edit Song</h2>
                  <p className="text-xs text-text-muted mt-0.5">Update song metadata</p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close edit song modal"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                id={formId}
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2" htmlFor="edit-song-title">
                      Title <span className="text-accent">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-song-title"
                      name="title"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        setErrors((p) => ({ ...p, title: "" }));
                      }}
                      className={clsx(
                        "w-full px-3.5 py-2.5 rounded-lg bg-bg-base border text-sm text-text-primary transition-colors",
                        errors.title ? "border-red-500/50" : "border-border focus:border-border-focus"
                      )}
                    />
                    {errors.title && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.title}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2" htmlFor="edit-song-artist">
                      Artist <span className="text-accent">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-song-artist"
                      name="artist"
                      value={artist}
                      onChange={(e) => {
                        setArtist(e.target.value);
                        setErrors((p) => ({ ...p, artist: "" }));
                      }}
                      className={clsx(
                        "w-full px-3.5 py-2.5 rounded-lg bg-bg-base border text-sm text-text-primary transition-colors",
                        errors.artist ? "border-red-500/50" : "border-border focus:border-border-focus"
                      )}
                    />
                    {errors.artist && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.artist}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2" htmlFor="edit-song-album">Album</label>
                  <input
                    type="text"
                    id="edit-song-album"
                    name="album"
                    value={album}
                    onChange={(e) => setAlbum(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-bg-base border border-border text-sm text-text-primary focus:border-border-focus transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2" htmlFor="edit-song-mood">Mood</label>
                    <select
                      id="edit-song-mood"
                      name="mood"
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-bg-base border border-border text-sm text-text-primary focus:border-border-focus transition-colors"
                    >
                      <option value="">Select mood</option>
                      {MOOD_OPTIONS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2" htmlFor="edit-song-genre">Genre</label>
                    <select
                      id="edit-song-genre"
                      name="genre"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-bg-base border border-border text-sm text-text-primary focus:border-border-focus transition-colors"
                    >
                      <option value="">Select genre</option>
                      {GENRE_OPTIONS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Lyrics</label>
                  <div className="flex gap-2">
                    {(["none", "plain", "lrc"] as LyricsType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setLyricsType(type)}
                        className={clsx(
                          "flex-1 py-2 rounded-lg text-xs font-medium border transition-all",
                          lyricsType === type
                            ? "border-accent bg-accent/10 text-text-primary"
                            : "border-border bg-bg-base text-text-secondary hover:bg-bg-hover"
                        )}
                      >
                        {type === "none" ? "None" : type === "plain" ? "Plain Text" : "LRC (Sync)"}
                      </button>
                    ))}
                  </div>
                </div>

                {lyricsType !== "none" && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2" htmlFor="edit-song-lyrics">
                      {lyricsType === "lrc" ? "LRC Lyrics" : "Lyrics Text"}
                    </label>
                    <textarea
                      id="edit-song-lyrics"
                      name="lyrics"
                      value={lyrics}
                      onChange={(e) => setLyrics(e.target.value)}
                      rows={5}
                      placeholder={
                        lyricsType === "lrc"
                          ? "[00:00.00] First line\n[00:05.50] Second line"
                          : "Paste your lyrics here..."
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-bg-base border border-border text-sm text-text-primary placeholder-text-muted focus:border-border-focus transition-colors resize-none"
                    />
                  </div>
                )}
              </form>

              <div className="flex items-center gap-3 px-6 py-4 border-t border-border shrink-0">
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Cancel edit song"
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-text-secondary border border-border hover:bg-bg-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form={formId}
                  disabled={isSubmitting}
                  aria-label="Save song changes"
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-text-primary text-bg-base hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-bg-base/30 border-t-bg-base rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
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
