"use client";

import Image from "next/image";
import { usePlayerStore } from "@/store/playerStore";
import { PlayerControls } from "./PlayerControls";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";
import { useSongLibrary } from "@/hooks/SongLibraryProvider";
import { getCoverBlob, createObjectUrl } from "@/lib/indexed-db";
import { useState, useEffect } from "react";
import { Music2 } from "lucide-react";

export function Player() {
  const currentSong = usePlayerStore((s) => {
    const playlist = s.playlist;
    const idx = s.currentIndex;
    return idx >= 0 ? playlist[idx] : null;
  });
  const setFullscreen = usePlayerStore((s) => s.setFullscreen);
  const [coverUrl, setCoverUrl] = useState("");

  useEffect(() => {
    if (!currentSong) { setCoverUrl(""); return; }
    if (currentSong.source === "static") {
      setCoverUrl(currentSong.coverUrl);
    } else {
      getCoverBlob(currentSong.id).then((blob) => {
        setCoverUrl(blob ? createObjectUrl(blob) : "");
      });
    }
  }, [currentSong]);

  if (!currentSong) return null;

  return (
    <div
      onClick={() => setFullscreen(true)}
      className="glass border-t border-border px-4 py-3 cursor-pointer hover:bg-bg-hover/50 transition-colors"
    >
      <div className="flex items-center gap-4">
        {/* Now playing info */}
        <div className="flex items-center gap-3 w-64 min-w-0 shrink-0">
          <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0 bg-bg-hover">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={currentSong.title}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-bg-elevated">
                <Music2 className="w-4 h-4 text-text-muted" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate leading-tight">
              {currentSong.title}
            </p>
            <p className="text-xs text-text-secondary truncate leading-tight mt-0.5">
              {currentSong.artist}
            </p>
          </div>
        </div>

        {/* Center — controls + progress */}
        <div className="flex-1 flex flex-col items-center gap-2 max-w-3xl mx-auto">
          <PlayerControls />
          <ProgressBar />
        </div>

        {/* Right — volume */}
        <div className="w-40 flex justify-end">
          <VolumeControl />
        </div>
      </div>
    </div>
  );
}
