"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Player } from "@/components/player/Player";
import { usePlayerStore } from "@/store/playerStore";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { AnimatePresence } from "framer-motion";
import { PlayerFullscreen } from "@/components/player/PlayerFullscreen";
import { MiniPlayer } from "@/components/player/MiniPlayer";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  useAudioPlayer();
  const isFullscreen = usePlayerStore((s) => s.isFullscreen);
  const currentSong = usePlayerStore((s) => {
    const playlist = s.playlist;
    const idx = s.currentIndex;
    return idx >= 0 ? playlist[idx] : null;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      {/* Sidebar — desktop */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Mobile header */}
        <Header />

        {/* Scrollable main area */}
        <main className="flex-1 overflow-y-auto pb-28 md:pb-24">
          {children}
        </main>

        {/* Desktop sticky player */}
        {currentSong && !isFullscreen && (
          <div className="hidden md:block fixed bottom-0 left-0 right-0 z-40">
            <Player />
          </div>
        )}

        {/* Mobile mini player */}
        {currentSong && !isFullscreen && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
            <MiniPlayer />
          </div>
        )}
      </div>

      {/* Fullscreen player overlay */}
      <AnimatePresence>
        {isFullscreen && currentSong && <PlayerFullscreen />}
      </AnimatePresence>
    </div>
  );
}
