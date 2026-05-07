"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Player } from "@/components/player/Player";
import { MiniPlayer } from "@/components/player/MiniPlayer";
import { NowPlayingModal } from "@/components/player/NowPlayingModal";
import { AddSongModal } from "@/components/music/AddSongModal";
import { DeleteSongDialog } from "@/components/music/DeleteSongDialog";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { usePlayerStore } from "@/store/playerStore";
import { useSongLibrary } from "@/hooks/SongLibraryProvider";
import { getCoverBlob, createObjectUrl } from "@/lib/indexed-db";
import { useState, useCallback, useEffect, createContext, useContext } from "react";
import type { Song } from "@/data/songs.types";

interface LayoutContextValue {
  openAddSong: () => void;
  openDeleteSong: (song: Song) => void;
}

const LayoutContext = createContext<LayoutContextValue>({
  openAddSong: () => {},
  openDeleteSong: () => {},
});

export function useLayout() {
  return useContext(LayoutContext);
}

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  useAudioPlayer();

  const { allSongs, addSong, removeSong } = useSongLibrary();

  const isFullscreen = usePlayerStore((s) => s.isFullscreen);
  const currentSong = usePlayerStore((s) => {
    const playlist = s.playlist;
    const idx = s.currentIndex;
    return idx >= 0 ? playlist[idx] : null;
  });
  const setPlaylist = usePlayerStore((s) => s.setPlaylist);
  const [coverUrlMap, setCoverUrlMap] = useState<Map<string, string>>(new Map());
  const [addSongOpen, setAddSongOpen] = useState(false);
  const [deleteSongId, setDeleteSongId] = useState<string | null>(null);
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);

  useEffect(() => {
    const loadCovers = async () => {
      const newMap = new Map<string, string>();
      for (const song of allSongs) {
        if (song.source === "static") {
          newMap.set(song.id, song.coverUrl);
        } else {
          const blob = await getCoverBlob(song.id);
          newMap.set(song.id, blob ? createObjectUrl(blob) : "");
        }
      }
      setCoverUrlMap(newMap);
    };
    if (allSongs.length > 0) loadCovers();
  }, [allSongs]);

  useEffect(() => {
    if (allSongs.length > 0) {
      setPlaylist(allSongs);
    }
  }, [allSongs, setPlaylist]);

  const coverResolver = useCallback(
    (song: Song) => coverUrlMap.get(song.id) ?? "",
    [coverUrlMap]
  );

  const openAddSong = useCallback(() => setAddSongOpen(true), []);
  const openDeleteSong = useCallback((song: Song) => {
    setSongToDelete(song);
    setDeleteSongId(song.id);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!songToDelete) return;
    await removeSong(songToDelete.id);
    setSongToDelete(null);
    setDeleteSongId(null);
  }, [songToDelete, removeSong]);

  return (
    <LayoutContext.Provider value={{ openAddSong, openDeleteSong }}>
      <div className="flex h-screen overflow-hidden bg-bg-base">
        <Sidebar onAddSong={openAddSong} />

        <div className="flex flex-col flex-1 min-w-0 h-full">
          <Header onAddSong={openAddSong} />

          <main className="flex-1 overflow-y-auto pb-28 md:pb-24">
            {children}
          </main>

          {currentSong && !isFullscreen && (
            <div className="hidden md:block fixed bottom-0 left-0 right-0 z-40">
              <Player />
            </div>
          )}

          {currentSong && !isFullscreen && (
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
              <MiniPlayer />
            </div>
          )}
        </div>

        <NowPlayingModal
          songs={allSongs}
          coverResolver={coverResolver}
        />

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
      </div>
    </LayoutContext.Provider>
  );
}