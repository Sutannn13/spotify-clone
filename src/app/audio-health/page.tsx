"use client";

import { useMemo, useState } from "react";
import { useSongLibrary } from "@/hooks/SongLibraryProvider";
import { ShieldCheck, ShieldAlert, ShieldX, Music, Filter } from "lucide-react";
import { clsx } from "clsx";
import type { Song } from "@/data/songs.types";
import { motion } from "framer-motion";

interface HealthIssue {
  severity: "critical" | "warning";
  songId: string;
  songTitle: string;
  songArtist: string;
  source: string;
  issue: string;
  field: string;
  suggestedFix: string;
}

type FilterType = "all" | "critical" | "warning" | "static" | "local" | "supabase";

function runHealthChecks(songs: Song[]): HealthIssue[] {
  const issues: HealthIssue[] = [];

  // Track duplicates
  const titleMap = new Map<string, Song[]>();
  const artistMap = new Map<string, Song[]>();
  const idSet = new Set<string>();
  const audioFiles = new Map<string, Song[]>();
  const coverFiles = new Map<string, Song[]>();

  for (const song of songs) {
    // Duplicate IDs
    if (idSet.has(song.id)) {
      issues.push({
        severity: "critical",
        songId: song.id,
        songTitle: song.title,
        songArtist: song.artist,
        source: song.source,
        issue: "Duplicate song ID",
        field: "id",
        suggestedFix: "Change the song ID to be unique.",
      });
    }
    idSet.add(song.id);

    // Duplicate audio files
    if (song.audioFileName) {
      const existing = audioFiles.get(song.audioFileName);
      if (existing) {
        issues.push({
          severity: "warning",
          songId: song.id,
          songTitle: song.title,
          songArtist: song.artist,
          source: song.source,
          issue: `Duplicate audio filename: "${song.audioFileName}"`,
          field: "audioFileName",
          suggestedFix: "Rename the audio file or update the filename field.",
        });
        existing.push(song);
      } else {
        audioFiles.set(song.audioFileName, [song]);
      }
    }

    // Duplicate cover files
    if (song.coverFileName) {
      const existing = coverFiles.get(song.coverFileName);
      if (existing) {
        issues.push({
          severity: "warning",
          songId: song.id,
          songTitle: song.title,
          songArtist: song.artist,
          source: song.source,
          issue: `Duplicate cover filename: "${song.coverFileName}"`,
          field: "coverFileName",
          suggestedFix: "Rename the cover file or update the filename field.",
        });
        existing.push(song);
      } else {
        coverFiles.set(song.coverFileName, [song]);
      }
    }

    // Title grouping
    const titleKey = song.title.toLowerCase().trim();
    const titleGroup = titleMap.get(titleKey) ?? [];
    titleGroup.push(song);
    titleMap.set(titleKey, titleGroup);

    // Artist grouping
    const artistKey = song.artist.toLowerCase().trim();
    const artistGroup = artistMap.get(artistKey) ?? [];
    artistGroup.push(song);
    artistMap.set(artistKey, artistGroup);

    // --- Per-song validation ---

    // Missing title
    if (!song.title.trim()) {
      issues.push({
        severity: "critical",
        songId: song.id,
        songTitle: "(no title)",
        songArtist: song.artist,
        source: song.source,
        issue: "Missing song title",
        field: "title",
        suggestedFix: "Add a title to this song.",
      });
    }

    // Missing artist
    if (!song.artist.trim()) {
      issues.push({
        severity: "critical",
        songId: song.id,
        songTitle: song.title,
        songArtist: "(no artist)",
        source: song.source,
        issue: "Missing artist name",
        field: "artist",
        suggestedFix: "Add an artist name to this song.",
      });
    }

    // Missing audioUrl for static/supabase
    if (
      (song.source === "static" || song.source === "supabase") &&
      !song.audioUrl.trim()
    ) {
      issues.push({
        severity: "critical",
        songId: song.id,
        songTitle: song.title,
        songArtist: song.artist,
        source: song.source,
        issue: "Missing audio URL",
        field: "audioUrl",
        suggestedFix: "Set the audioUrl field to a valid file path or URL.",
      });
    }

    // Missing coverUrl for static/supabase
    if (
      (song.source === "static" || song.source === "supabase") &&
      !song.coverUrl.trim()
    ) {
      issues.push({
        severity: "warning",
        songId: song.id,
        songTitle: song.title,
        songArtist: song.artist,
        source: song.source,
        issue: "Missing cover image URL",
        field: "coverUrl",
        suggestedFix: "Set the coverUrl field to a valid image URL.",
      });
    }

    // Duration is 0 or missing
    if (!song.duration || song.duration <= 0) {
      issues.push({
        severity: "warning",
        songId: song.id,
        songTitle: song.title,
        songArtist: song.artist,
        source: song.source,
        issue: "Duration is 0 or missing — audio may not load correctly",
        field: "duration",
        suggestedFix: "Set the duration field to the audio length in seconds.",
      });
    }

    // Invalid source type
    if (!["static", "local", "supabase"].includes(song.source)) {
      issues.push({
        severity: "critical",
        songId: song.id,
        songTitle: song.title,
        songArtist: song.artist,
        source: song.source,
        issue: `Invalid source type: "${song.source}"`,
        field: "source",
        suggestedFix: "Change source to 'static', 'local', or 'supabase'.",
      });
    }

    // Missing genre
    if (!song.genre?.trim()) {
      issues.push({
        severity: "warning",
        songId: song.id,
        songTitle: song.title,
        songArtist: song.artist,
        source: song.source,
        issue: "Missing genre",
        field: "genre",
        suggestedFix: "Set a genre for better categorization.",
      });
    }

    // Missing mood
    if (!song.mood?.trim()) {
      issues.push({
        severity: "warning",
        songId: song.id,
        songTitle: song.title,
        songArtist: song.artist,
        source: song.source,
        issue: "Missing mood",
        field: "mood",
        suggestedFix: "Set a mood for Mood Queue functionality.",
      });
    }

    // Invalid lyrics type
    if (!["none", "plain", "lrc"].includes(song.lyricsType)) {
      issues.push({
        severity: "warning",
        songId: song.id,
        songTitle: song.title,
        songArtist: song.artist,
        source: song.source,
        issue: `Invalid lyrics type: "${song.lyricsType}"`,
        field: "lyricsType",
        suggestedFix: "Change lyricsType to 'none', 'plain', or 'lrc'.",
      });
    }

    // Malformed LRC
    if (song.lyricsType === "lrc" && song.lyrics.trim()) {
      const lines = song.lyrics.split("\n");
      let hasTag = false;
      let lineCount = 0;
      let validCount = 0;
      const lrcPattern = /^\[(\d{2}:\d{2}(?:\.\d{1,3})?)\]/;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        lineCount++;
        if (trimmed.startsWith("[") && trimmed.includes("]")) {
          hasTag = true;
        }
        if (lrcPattern.test(trimmed)) {
          validCount++;
        }
      }

      if (hasTag && validCount === 0) {
        issues.push({
          severity: "warning",
          songId: song.id,
          songTitle: song.title,
          songArtist: song.artist,
          source: song.source,
          issue: "LRC lyrics detected but no valid LRC timestamps found",
          field: "lyrics",
          suggestedFix: "Use format [mm:ss.xx] lyric line for each line.",
        });
      }
    }

    // Supabase-specific
    if (song.source === "supabase") {
      if (!song.audioFileName?.trim()) {
        issues.push({
          severity: "warning",
          songId: song.id,
          songTitle: song.title,
          songArtist: song.artist,
          source: "supabase",
          issue: "Supabase song missing audioFileName",
          field: "audioFileName",
          suggestedFix: "Update the audioFileName field for storage cleanup.",
        });
      }
      if (!song.coverFileName?.trim()) {
        issues.push({
          severity: "warning",
          songId: song.id,
          songTitle: song.title,
          songArtist: song.artist,
          source: "supabase",
          issue: "Supabase song missing coverFileName",
          field: "coverFileName",
          suggestedFix: "Update the coverFileName field for storage cleanup.",
        });
      }
    }
  }

  return issues;
}

const FILTER_CHIPS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "critical", label: "Critical" },
  { key: "warning", label: "Warning" },
  { key: "static", label: "Built-in" },
  { key: "local", label: "Local" },
  { key: "supabase", label: "Cloud" },
];

export default function AudioHealthPage() {
  const { allSongs, isLoading } = useSongLibrary();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const counts = useMemo(() => {
    const static_ = allSongs.filter((s) => s.source === "static");
    const local = allSongs.filter((s) => s.source === "local");
    const supabase = allSongs.filter((s) => s.source === "supabase");
    return {
      total: allSongs.length,
      static: static_.length,
      local: local.length,
      supabase: supabase.length,
    };
  }, [allSongs]);

  const issues = useMemo(() => runHealthChecks(allSongs), [allSongs]);

  const filteredIssues = useMemo(() => {
    if (activeFilter === "all") return issues;
    if (activeFilter === "critical") return issues.filter((i) => i.severity === "critical");
    if (activeFilter === "warning") return issues.filter((i) => i.severity === "warning");
    if (activeFilter === "static") return issues.filter((i) => i.source === "static");
    if (activeFilter === "local") return issues.filter((i) => i.source === "local");
    if (activeFilter === "supabase") return issues.filter((i) => i.source === "supabase");
    return issues;
  }, [issues, activeFilter]);

  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 md:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Audio Health Check
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Scan all songs for data quality issues
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, duration: 0.2 }}
          className="bg-bg-elevated border border-border rounded-xl px-5 py-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">Healthy</span>
          </div>
          <p className="text-2xl font-bold text-text-primary tabular-nums">
            {Math.max(0, counts.total - criticalCount - warningCount)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.2 }}
          className="bg-bg-elevated border border-border rounded-xl px-5 py-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <ShieldX className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">Critical</span>
          </div>
          <p className="text-2xl font-bold text-red-400 tabular-nums">{criticalCount}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          className="bg-bg-elevated border border-border rounded-xl px-5 py-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-yellow-400" />
            </div>
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">Warnings</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400 tabular-nums">{warningCount}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.2 }}
          className="bg-bg-elevated border border-border rounded-xl px-5 py-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Music className="w-4 h-4 text-accent" />
            </div>
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">Total Songs</span>
          </div>
          <p className="text-2xl font-bold text-text-primary tabular-nums">{counts.total}</p>
        </motion.div>
      </div>

      {/* Source breakdown */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs text-text-muted font-medium">Sources:</span>
        <span className="text-xs text-text-secondary">{counts.static} built-in</span>
        <span className="text-text-muted">·</span>
        <span className="text-xs text-text-secondary">{counts.local} local</span>
        <span className="text-text-muted">·</span>
        <span className="text-xs text-text-secondary">{counts.supabase} cloud</span>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => setActiveFilter(chip.key)}
            className={clsx(
              "shrink-0 px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all min-h-[36px]",
              activeFilter === chip.key
                ? "bg-text-primary text-bg-base"
                : "bg-bg-elevated text-text-secondary hover:text-text-primary border border-border"
            )}
          >
            {chip.label}
            {chip.key === "critical" && criticalCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">
                {criticalCount}
              </span>
            )}
            {chip.key === "warning" && warningCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold">
                {warningCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Issues table */}
      {filteredIssues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-text-primary">
            {activeFilter === "all"
              ? "All songs look healthy!"
              : `No ${activeFilter} issues found`}
          </p>
          <p className="text-xs text-text-secondary">
            {activeFilter === "all"
              ? "Your music library has no data quality issues."
              : `No issues matching the current filter.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-text-muted mb-3">
            {filteredIssues.length} issue{filteredIssues.length !== 1 ? "s" : ""}
          </p>
          {filteredIssues.map((issue, i) => (
            <motion.div
              key={`${issue.songId}-${issue.field}-${i}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02, duration: 0.2 }}
              className={clsx(
                "flex items-start gap-3 px-4 py-3 rounded-xl border",
                issue.severity === "critical"
                  ? "bg-red-500/5 border-red-500/20"
                  : "bg-yellow-500/5 border-yellow-500/20"
              )}
            >
              <div className="shrink-0 mt-0.5">
                {issue.severity === "critical" ? (
                  <ShieldX className="w-4 h-4 text-red-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-yellow-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {issue.songTitle}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {issue.songArtist} · {issue.source}
                    </p>
                  </div>
                  <span
                    className={clsx(
                      "shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                      issue.severity === "critical"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    )}
                  >
                    {issue.severity}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1">{issue.issue}</p>
                <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                  <span className="text-text-muted/60">Field:</span>
                  <code className="text-[10px] bg-bg-base px-1 py-0.5 rounded font-mono">
                    {issue.field}
                  </code>
                  <span className="text-text-muted/60 ml-2">Fix:</span>
                  <span className="text-text-muted">{issue.suggestedFix}</span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="h-8" />
    </div>
  );
}