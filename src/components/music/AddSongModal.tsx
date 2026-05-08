"use client";

import { useState, useRef, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Image, Music, Type, FileAudio, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import type { Song, LyricsType } from "@/data/songs.types";
import { useToast } from "@/components/ui/Toast";

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  supabaseEnabled?: boolean;
  onAdd: (data: {
    title: string;
    artist: string;
    album: string;
    duration: number;
    lyrics: string;
    lyricsType: LyricsType;
    mood?: string;
    genre?: string;
    audioFile: File;
    coverFile?: File;
    uploadTarget?: "local" | "supabase";
  }) => Promise<Song>;
}

const ACCEPTED_AUDIO = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a", "audio/m4a"];
const ACCEPTED_IMAGE = ["image/jpeg", "image/png", "image/webp"];

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

export function AddSongModal({
  isOpen,
  onClose,
  onAdd,
  supabaseEnabled = false,
}: AddSongModalProps) {
  const { toast } = useToast();
  const formId = useId();
  const audioInputId = `${formId}-audio-file`;
  const coverInputId = `${formId}-cover-file`;
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string>("");
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [duration, setDuration] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [lyricsType, setLyricsType] = useState<LyricsType>("none");
  const [mood, setMood] = useState("");
  const [genre, setGenre] = useState("");
  const [uploadTarget, setUploadTarget] = useState<"local" | "supabase">("local");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setAudioFile(null);
    setCoverFile(null);
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setAudioPreview("");
    setCoverPreview("");
    setTitle("");
    setArtist("");
    setAlbum("");
    setDuration("");
    setLyrics("");
    setLyricsType("none");
    setMood("");
    setGenre("");
    setUploadTarget("local");
    setErrors({});
    setIsSubmitting(false);
  }, [audioPreview, coverPreview]);

  const handleAudioChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_AUDIO.includes(file.type)) {
      setErrors((prev) => ({ ...prev, audio: "Only MP3, WAV, and M4A files are supported" }));
      return;
    }

    setErrors((prev) => ({ ...prev, audio: "" }));
    setAudioFile(file);

    if (audioPreview) URL.revokeObjectURL(audioPreview);
    const url = URL.createObjectURL(file);
    setAudioPreview(url);

    // Auto-fill title from filename
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    if (!title) {
      setTitle(nameWithoutExt);
    }
  }, [audioPreview, title]);

  const handleCoverChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE.includes(file.type)) {
      setErrors((prev) => ({ ...prev, cover: "Only JPG, PNG, and WebP images are supported" }));
      return;
    }

    setErrors((prev) => ({ ...prev, cover: "" }));
    setCoverFile(file);

    if (coverPreview) URL.revokeObjectURL(coverPreview);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  }, [coverPreview]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!audioFile) {
      newErrors.audio = "Audio file is required";
    }
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!artist.trim()) {
      newErrors.artist = "Artist is required";
    }
    if (duration && isNaN(Number(duration))) {
      newErrors.duration = "Duration must be a number";
    }
    if (uploadTarget === "supabase" && !supabaseEnabled) {
      newErrors.uploadTarget = "Supabase is not configured in this environment";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim() || "Unknown Album",
        duration: duration ? parseFloat(duration) : 0,
        lyrics: lyricsType !== "none" ? lyrics : "",
        lyricsType,
        mood: mood || undefined,
        genre: genre || undefined,
        audioFile: audioFile as File,
        coverFile: coverFile ?? undefined,
        uploadTarget,
      });

      toast(
        uploadTarget === "supabase"
          ? "Song uploaded to Supabase successfully"
          : "Song added successfully",
        "success"
      );
      handleClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add song. Please try again.";
      toast(message, "error");
      setIsSubmitting(false);
    }
  };

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
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-lg bg-bg-elevated border border-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Add Song</h2>
                  <p className="text-xs text-text-muted mt-0.5">Upload audio files and metadata</p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close add song modal"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form
                id={formId}
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5"
              >
                {/* Upload target */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Upload Target
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUploadTarget("local")}
                      className={clsx(
                        "py-2.5 rounded-lg text-xs font-medium border transition-all",
                        uploadTarget === "local"
                          ? "border-accent bg-accent/10 text-text-primary"
                          : "border-border bg-bg-base text-text-secondary hover:bg-bg-hover"
                      )}
                      aria-label="Store song in local browser only"
                      aria-pressed={uploadTarget === "local"}
                    >
                      Local Browser
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!supabaseEnabled) return;
                        setUploadTarget("supabase");
                      }}
                      disabled={!supabaseEnabled}
                      className={clsx(
                        "py-2.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                        uploadTarget === "supabase"
                          ? "border-accent bg-accent/10 text-text-primary"
                          : "border-border bg-bg-base text-text-secondary hover:bg-bg-hover"
                      )}
                      aria-label="Upload song to Supabase cloud storage"
                      aria-pressed={uploadTarget === "supabase"}
                    >
                      Cloud Supabase
                    </button>
                  </div>
                  {!supabaseEnabled && (
                    <p className="text-xs text-text-muted mt-1.5">
                      Supabase env not found. Cloud upload is disabled and app will use local storage.
                    </p>
                  )}
                  {errors.uploadTarget && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.uploadTarget}
                    </p>
                  )}
                </div>

                {/* Audio file upload */}
                <div>
                  <label
                    className="block text-sm font-medium text-text-secondary mb-2"
                    htmlFor={audioInputId}
                  >
                    Audio File <span className="text-accent">*</span>
                  </label>
                  <button
                    type="button"
                    aria-label="Upload audio file"
                    onClick={() => audioInputRef.current?.click()}
                    className={clsx(
                      "w-full h-24 rounded-xl border-2 border-dashed flex items-center justify-center gap-3 transition-colors",
                      errors.audio
                        ? "border-red-500/50 bg-red-500/5"
                        : audioFile
                          ? "border-accent/50 bg-accent/5"
                          : "border-border hover:border-border-focus hover:bg-bg-hover"
                    )}
                  >
                    {audioFile ? (
                      <>
                        <FileAudio className="w-6 h-6 text-accent shrink-0" />
                        <div className="text-left min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{audioFile.name}</p>
                          <p className="text-xs text-text-muted">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-text-muted shrink-0" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-text-secondary">Click to upload audio</p>
                          <p className="text-xs text-text-muted">MP3, WAV, or M4A</p>
                        </div>
                      </>
                    )}
                  </button>
                  <input
                    ref={audioInputRef}
                    type="file"
                    id={audioInputId}
                    name="audioFile"
                    accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,audio/m4a"
                    onChange={handleAudioChange}
                    className="hidden"
                  />
                  {errors.audio && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.audio}
                    </p>
                  )}
                </div>

                {/* Cover image upload */}
                <div>
                  <label
                    className="block text-sm font-medium text-text-secondary mb-2"
                    htmlFor={coverInputId}
                  >
                    Cover Image
                  </label>
                  <button
                    type="button"
                    aria-label="Upload cover image"
                    onClick={() => coverInputRef.current?.click()}
                    className={clsx(
                      "w-full h-24 rounded-xl border-2 border-dashed flex items-center justify-center gap-3 transition-colors overflow-hidden",
                      errors.cover
                        ? "border-red-500/50 bg-red-500/5"
                        : coverFile || coverPreview
                          ? "border-border bg-bg-hover"
                          : "border-border hover:border-border-focus hover:bg-bg-hover"
                    )}
                  >
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : coverFile ? (
                      <FileAudio className="w-6 h-6 text-text-muted shrink-0" />
                    ) : (
                      <>
                        <Image className="w-5 h-5 text-text-muted shrink-0" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-text-secondary">Click to upload cover</p>
                          <p className="text-xs text-text-muted">JPG, PNG, or WebP</p>
                        </div>
                      </>
                    )}
                  </button>
                  <input
                    ref={coverInputRef}
                    type="file"
                    id={coverInputId}
                    name="coverFile"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                  {errors.cover && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.cover}
                    </p>
                  )}
                </div>

                {/* Title & Artist */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2" htmlFor="song-title">
                      Title <span className="text-accent">*</span>
                    </label>
                    <input
                      type="text"
                      id="song-title"
                      name="title"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        setErrors((prev) => ({ ...prev, title: "" }));
                      }}
                      placeholder="Song title"
                      className={clsx(
                        "w-full px-3.5 py-2.5 rounded-lg bg-bg-base border text-sm text-text-primary placeholder-text-muted transition-colors",
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
                    <label className="block text-sm font-medium text-text-secondary mb-2" htmlFor="song-artist">
                      Artist <span className="text-accent">*</span>
                    </label>
                    <input
                      type="text"
                      id="song-artist"
                      name="artist"
                      value={artist}
                      onChange={(e) => {
                        setArtist(e.target.value);
                        setErrors((prev) => ({ ...prev, artist: "" }));
                      }}
                      placeholder="Artist name"
                      className={clsx(
                        "w-full px-3.5 py-2.5 rounded-lg bg-bg-base border text-sm text-text-primary placeholder-text-muted transition-colors",
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

                {/* Album & Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2" htmlFor="song-album">Album</label>
                    <input
                      type="text"
                      id="song-album"
                      name="album"
                      value={album}
                      onChange={(e) => setAlbum(e.target.value)}
                      placeholder="Album name (optional)"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-bg-base border border-border text-sm text-text-primary placeholder-text-muted focus:border-border-focus transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2" htmlFor="song-duration">Duration (seconds)</label>
                    <input
                      type="number"
                      id="song-duration"
                      name="duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="Auto-detected"
                      min="0"
                      className={clsx(
                        "w-full px-3.5 py-2.5 rounded-lg bg-bg-base border text-sm text-text-primary placeholder-text-muted focus:border-border-focus transition-colors",
                        errors.duration ? "border-red-500/50" : "border-border"
                      )}
                    />
                    {errors.duration && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.duration}
                      </p>
                    )}
                  </div>
                </div>

                {/* Mood & Genre */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2" htmlFor="song-mood">Mood</label>
                    <select
                      id="song-mood"
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
                    <label className="block text-sm font-medium text-text-secondary mb-2" htmlFor="song-genre">Genre</label>
                    <select
                      id="song-genre"
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

                {/* Lyrics type */}
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
                        aria-label={
                          type === "none"
                            ? "No lyrics"
                            : type === "plain"
                              ? "Plain text lyrics"
                              : "LRC synced lyrics"
                        }
                        aria-pressed={lyricsType === type}
                      >
                        {type === "none" ? "None" : type === "plain" ? "Plain Text" : "LRC (Sync)"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lyrics textarea */}
                {lyricsType !== "none" && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2" htmlFor="song-lyrics">
                      {lyricsType === "lrc" ? "LRC Lyrics" : "Lyrics Text"}
                    </label>
                    <textarea
                      id="song-lyrics"
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

              {/* Footer */}
              <div className="flex items-center gap-3 px-6 py-4 border-t border-border shrink-0">
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Cancel add song"
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-text-secondary border border-border hover:bg-bg-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form={formId}
                  disabled={isSubmitting}
                  aria-label="Add song"
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-text-primary text-bg-base hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-bg-base/30 border-t-bg-base rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Add Song
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
