"use client";

import { useMemo, useCallback } from "react";
import { PremiumCover } from "@/components/ui/PremiumCover";
import { useSongLibrary } from "@/hooks/SongLibraryProvider";
import { usePlaybackActions } from "@/hooks/usePlaybackActions";
import { usePlayerStore } from "@/store/playerStore";
import { Sparkles, Play, Music2 } from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import type { Song } from "@/data/songs.types";

interface MixSection {
  id: string;
  title: string;
  description: string;
  gradient: string;
  songs: Song[];
}

export default function MadeForYouPage() {
  const { allSongs, localSongs, isLoading, getCoverUrl } = useSongLibrary();
  const currentSong = usePlayerStore((s) => {
    const playlist = s.playlist;
    const idx = s.currentIndex;
    return idx >= 0 && idx < playlist.length ? playlist[idx] : null;
  });
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const { playOrPause } = usePlaybackActions();

  const getCover = useCallback((song: Song) => getCoverUrl(song), [getCoverUrl]);

  const mixes = useMemo((): MixSection[] => {
    const sections: MixSection[] = [];

    const recentlyAdded = [...allSongs]
      .sort((a, b) => {
        const left = new Date(b.createdAt).getTime();
        const right = new Date(a.createdAt).getTime();
        return left - right;
      })
      .slice(0, 10);

    if (recentlyAdded.length > 0) {
      sections.push({
        id: "recently-added",
        title: "Recently Added",
        description: "Your newest additions",
        gradient: "from-violet-600 to-indigo-900",
        songs: recentlyAdded,
      });
    }

    if (localSongs.length > 0) {
      sections.push({
        id: "local-uploads",
        title: "Your Uploads",
        description: "Songs from your device",
        gradient: "from-sky-600 to-cyan-900",
        songs: localSongs.slice(0, 10),
      });
    }

    const chillSongs = allSongs.filter((s) => {
      const mood = (s.mood ?? "").toLowerCase();
      const title = s.title.toLowerCase();
      return (
        mood.includes("chill") ||
        mood.includes("relax") ||
        mood.includes("calm") ||
        title.includes("slow") ||
        title.includes("chill") ||
        s.album.toLowerCase().includes("slowed")
      );
    });

    if (chillSongs.length > 0) {
      sections.push({
        id: "chill-mix",
        title: "Chill Mix",
        description: "Relax and unwind",
        gradient: "from-teal-600 to-emerald-900",
        songs: chillSongs.slice(0, 10),
      });
    }

    const energySongs = allSongs.filter((s) => {
      const mood = (s.mood ?? "").toLowerCase();
      const title = s.title.toLowerCase();
      const album = s.album.toLowerCase();
      return (
        mood.includes("energy") ||
        mood.includes("hype") ||
        mood.includes("party") ||
        title.includes("sped up") ||
        album.includes("sped up") ||
        title.includes("mashup")
      );
    });

    if (energySongs.length > 0) {
      sections.push({
        id: "high-energy",
        title: "High Energy",
        description: "Get pumped up",
        gradient: "from-orange-600 to-red-900",
        songs: energySongs.slice(0, 10),
      });
    }

    const unknownArtistSongs = allSongs.filter(
      (s) => s.artist.toLowerCase().includes("unknown") || s.artist.trim() === ""
    );

    if (unknownArtistSongs.length > 0) {
      sections.push({
        id: "discover",
        title: "Discover",
        description: "Hidden gems to explore",
        gradient: "from-pink-600 to-rose-900",
        songs: unknownArtistSongs.slice(0, 10),
      });
    }

    if (sections.length < 2 && allSongs.length > 0) {
      const shuffled = [...allSongs].sort(() => Math.random() - 0.5);
      sections.push({
        id: "quick-mix",
        title: "Quick Mix",
        description: "A mix of everything",
        gradient: "from-purple-600 to-fuchsia-900",
        songs: shuffled.slice(0, 10),
      });
    }

    return sections;
  }, [allSongs, localSongs]);

  const handlePlaySong = (song: Song, sectionSongs: Song[]) => {
    playOrPause(song, sectionSongs);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 md:py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-purple-900 flex items-center justify-center shrink-0 shadow-lg shadow-accent/20">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Made for You</h1>
          <p className="text-sm text-text-secondary mt-0.5">Personalized mixes based on your library</p>
        </div>
      </div>

      {mixes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 gap-4"
        >
          <div className="w-20 h-20 rounded-full bg-bg-elevated flex items-center justify-center border border-border">
            <Sparkles className="w-8 h-8 text-text-muted" />
          </div>
          <div className="text-center max-w-xs">
            <p className="text-sm font-medium text-text-primary">Add more songs to get personalized mixes</p>
            <p className="text-xs text-text-secondary mt-1">Upload songs or browse your library to get started</p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-10">
          {mixes.map((mix, sectionIdx) => (
            <motion.section
              key={mix.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIdx * 0.08, duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={clsx(
                    "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0",
                    mix.gradient
                  )}
                >
                  <Music2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary tracking-tight">{mix.title}</h2>
                  <p className="text-xs text-text-secondary">
                    {mix.description} · {mix.songs.length} songs
                  </p>
                </div>
              </div>

              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
                {mix.songs.map((song) => {
                  const isCurrent = currentSong?.id === song.id;
                  const isCurrentPlaying = isCurrent && isPlaying;
                  const cover = getCover(song);

                  return (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => handlePlaySong(song, mix.songs)}
                      className="group flex flex-col shrink-0 w-36 sm:w-40 text-left"
                    >
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-bg-hover mb-2.5">
                        <PremiumCover
                          src={cover}
                          alt={`${song.title} cover`}
                          size="xl"
                          rounded="lg"
                          tilt
                          playing={isCurrentPlaying}
                          sizes="160px"
                          className="w-full h-full"
                        />
                        <div
                          className={clsx(
                            "absolute inset-0 flex items-center justify-center transition-opacity z-20",
                            isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          )}
                        >
                          <div className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center">
                            {isCurrentPlaying ? (
                              <span className="flex items-end gap-0.5">
                                <span className="w-0.5 h-2.5 bg-white rounded-full animate-eq-1" />
                                <span className="w-0.5 h-2.5 bg-white rounded-full animate-eq-2" />
                                <span className="w-0.5 h-2.5 bg-white rounded-full animate-eq-3" />
                              </span>
                            ) : (
                              <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
                            )}
                          </div>
                        </div>
                        {isCurrent && !isCurrentPlaying && (
                          <div className="absolute bottom-1.5 right-1.5 z-20">
                            <div className="w-2 h-2 rounded-full bg-accent" />
                          </div>
                        )}
                      </div>
                      <p
                        className={clsx(
                          "text-sm font-medium truncate leading-tight",
                          isCurrent ? "text-accent" : "text-text-primary"
                        )}
                      >
                        {song.title}
                      </p>
                      <p className="text-xs text-text-secondary truncate mt-0.5">{song.artist}</p>
                    </button>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>
      )}

      <div className="h-8" />
    </div>
  );
}