"use client";

import { usePlayerStore } from "@/store/playerStore";
import { PlayerControls } from "./PlayerControls";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";
import { LikeButton } from "@/components/music/LikeButton";
import { PremiumCover } from "@/components/ui/PremiumCover";
import { getCoverBlob, createObjectUrl } from "@/lib/indexed-db";
import { useState, useEffect, useRef } from "react";

export function Player() {
  const currentSong = usePlayerStore((s) => {
    const playlist = s.playlist;
    const idx = s.currentIndex;
    return idx >= 0 && idx < playlist.length ? playlist[idx] : null;
  });
  const setFullscreen = usePlayerStore((s) => s.setFullscreen);
  const playbackError = usePlayerStore((s) => s.playbackError);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const [coverUrl, setCoverUrl] = useState("");
  const coverBlobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const revokeBlobCover = () => {
      if (coverBlobUrlRef.current) {
        URL.revokeObjectURL(coverBlobUrlRef.current);
        coverBlobUrlRef.current = null;
      }
    };

    if (!currentSong) {
      revokeBlobCover();
      setCoverUrl("");
      return;
    }
    if (currentSong.source === "static") {
      revokeBlobCover();
      setCoverUrl(currentSong.coverUrl);
    } else {
      getCoverBlob(currentSong.id).then((blob) => {
        if (isCancelled) return;
        revokeBlobCover();
        if (blob) {
          const url = createObjectUrl(blob);
          coverBlobUrlRef.current = url;
          setCoverUrl(url);
          return;
        }
        setCoverUrl("");
      });
    }

    return () => {
      isCancelled = true;
    };
  }, [currentSong]);

  useEffect(() => {
    return () => {
      if (coverBlobUrlRef.current) {
        URL.revokeObjectURL(coverBlobUrlRef.current);
        coverBlobUrlRef.current = null;
      }
    };
  }, []);

  if (!currentSong) return null;

  return (
    <div className="glass border-t border-border px-4 py-3">
      <div className="flex items-center gap-4">
        {/* Now playing info */}
        <div className="flex items-center gap-2.5 w-64 min-w-0 shrink-0">
          <button
            type="button"
            className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer hover:opacity-80 transition-opacity min-h-[44px]"
            onClick={() => setFullscreen(true)}
            aria-label="Open full player"
          >
            <PremiumCover
              src={coverUrl}
              alt={`${currentSong.title} cover`}
              size="md"
              rounded="md"
              playing={isPlaying}
              sizes="48px"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary truncate leading-tight">
                {currentSong.title}
              </p>
              {playbackError ? (
                <p className="text-xs text-red-400 truncate leading-tight mt-0.5">
                  {playbackError}
                </p>
              ) : (
                <p className="text-xs text-text-secondary truncate leading-tight mt-0.5">
                  {currentSong.artist}
                </p>
              )}
            </div>
          </button>
          <LikeButton songId={currentSong.id} />
        </div>

        {/* Center -- controls + progress */}
        <div className="flex-1 flex flex-col items-center gap-2 max-w-3xl mx-auto">
          <PlayerControls />
          <ProgressBar />
        </div>

        {/* Right -- volume */}
        <div className="w-40 flex justify-end">
          <VolumeControl />
        </div>
      </div>
    </div>
  );
}
