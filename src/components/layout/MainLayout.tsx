"use client";

import { ReactNode, useState, useCallback, useEffect, createContext, useContext, useRef } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { Player } from "@/components/player/Player";
import { MiniPlayer } from "@/components/player/MiniPlayer";
import { NowPlayingModal } from "@/components/player/NowPlayingModal";
import { AddSongModal } from "@/components/music/AddSongModal";
import { EditSongModal } from "@/components/music/EditSongModal";
import { DeleteSongDialog } from "@/components/music/DeleteSongDialog";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { usePlayerStore } from "@/store/playerStore";
import { useSongLibrary } from "@/hooks/SongLibraryProvider";
import { trackRecentPlay } from "@/lib/storage";
import type { Song } from "@/data/songs.types";
import { useMemo } from "react";

interface LayoutContextValue {
  openAddSong: () => void;
  openDeleteSong: (song: Song) => void;
  openEditSong: (song: Song) => void;
}

const LayoutContext = createContext<LayoutContextValue>({
  openAddSong: () => {},
  openDeleteSong: () => {},
  openEditSong: () => {},
});

export function useLayout() {
  return useContext(LayoutContext);
}

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  useAudioPlayer();
  useKeyboardShortcuts();

  const { allSongs, addSong, removeSong, updateSong } = useSongLibrary();

  const isFullscreen = usePlayerStore((s) => s.isFullscreen);
  const currentSong = usePlayerStore((s) => {
    const playlist = s.playlist;
    const idx = s.currentIndex;
    return idx >= 0 && idx < playlist.length ? playlist[idx] : null;
  });
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const setPlaylist = usePlayerStore((s) => s.setPlaylist);
  const [addSongOpen, setAddSongOpen] = useState(false);
  const [deleteSongId, setDeleteSongId] = useState<string | null>(null);
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);
  const [editSong, setEditSong] = useState<Song | null>(null);
  const [editSongOpen, setEditSongOpen] = useState(false);
  const prevSongIdRef = useRef<string | null>(null);
  const playlistSetRef = useRef<boolean>(false);
  const lastPlaylistLengthRef = useRef<number>(0);

  // Track recently played when a new song starts playing
  useEffect(() => {
    if (currentSong && isPlaying && currentSong.id !== prevSongIdRef.current) {
      prevSongIdRef.current = currentSong.id;
      trackRecentPlay(currentSong.id);
    }
  }, [currentSong, isPlaying]);

  // Set playlist ONCE on initial mount and when allSongs actually changes in length
  // (i.e., song added or removed). Do NOT call repeatedly.
  useEffect(() => {
    if (allSongs.length === 0) return;
    // Only update if song count changed (add/delete) or we haven't set it yet
    if (allSongs.length !== lastPlaylistLengthRef.current || !playlistSetRef.current) {
      lastPlaylistLengthRef.current = allSongs.length;
      playlistSetRef.current = true;
      setPlaylist(allSongs);
    }
  }, [allSongs, setPlaylist]);

  const openAddSong = useCallback(() => setAddSongOpen(true), []);
  const openDeleteSong = useCallback((song: Song) => {
    setSongToDelete(song);
    setDeleteSongId(song.id);
  }, []);
  const openEditSong = useCallback((song: Song) => {
    setEditSong(song);
    setEditSongOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!songToDelete) return;

    const store = usePlayerStore.getState();
    const current = store.getCurrentSong();

    // If deleting the currently playing song, move to next or stop
    if (current?.id === songToDelete.id) {
      if (store.playlist.length > 1) {
        store.next({ manual: true });
      } else {
        store.pause();
      }
    }

    await removeSong(songToDelete.id);
    // After delete, we need to reset the playlist set flag so it can update
    playlistSetRef.current = false;
    lastPlaylistLengthRef.current = 0;
    setSongToDelete(null);
    setDeleteSongId(null);
  }, [songToDelete, removeSong]);

  // Cover resolver for player components
  const coverResolver = useCallback(
    (song: Song) => {
      if (song.source === "static") return song.coverUrl;
      return ""; // Local covers are resolved by individual components
    },
    []
  );

  // Calculate bottom padding based on what is visible
  const hasCurrentSong = !!currentSong;
  const bottomPaddingClass = hasCurrentSong
    ? "pb-[140px] md:pb-[96px] lg:pb-[80px]"
    : "pb-[56px] md:pb-4 lg:pb-4";

  return (
    <LayoutContext.Provider value={{ openAddSong, openDeleteSong, openEditSong }}>
      <div className="flex h-screen overflow-hidden bg-bg-base">
        <Sidebar onAddSong={openAddSong} />

        <div className="flex flex-col flex-1 min-w-0 h-full">
          <Header onAddSong={openAddSong} />

          <main className={`flex-1 overflow-y-auto ${bottomPaddingClass}`}>
            {children}
          </main>

          {/* Desktop player */}
          {currentSong && !isFullscreen && (
            <div className="hidden md:block fixed bottom-0 left-0 right-0 z-40">
              <Player />
            </div>
          )}

          {/* Mobile mini player */}
          {currentSong && !isFullscreen && (
            <div
              className="md:hidden fixed bottom-[56px] left-0 right-0 z-40 safe-area-bottom"
            >
              <MiniPlayer />
            </div>
          )}

          {/* Mobile bottom navigation */}
          <MobileNav onAddSong={openAddSong} />
        </div>

        <NowPlayingModal songs={allSongs} coverResolver={coverResolver} />

        <AddSongModal
          isOpen={addSongOpen}
          onClose={() => setAddSongOpen(false)}
          onAdd={addSong}
        />

        <DeleteSongDialog
          isOpen={deleteSongId !== null}
          song={songToDelete}
          onClose={() => {
            setDeleteSongId(null);
            setSongToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
        />

        <EditSongModal
          isOpen={editSongOpen}
          song={editSong}
          onClose={() => {
            setEditSongOpen(false);
            setEditSong(null);
          }}
          onSave={updateSong}
        />
      </div>
    </LayoutContext.Provider>
  );
}
