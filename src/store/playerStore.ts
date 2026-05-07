import { create } from "zustand";
import type { Song } from "@/data/songs";

export type RepeatMode = "none" | "one" | "all";

interface PlayerState {
  playlist: Song[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  isFullscreen: boolean;
  isLoading: boolean;
}

interface PlayerActions {
  playSong: (song: Song, playlist?: Song[]) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  cycleRepeat: () => void;
  toggleShuffle: () => void;
  setFullscreen: (val: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setLoading: (loading: boolean) => void;
  onSongEnd: () => void;
}

type PlayerStore = PlayerState & PlayerActions;

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  playlist: [],
  currentIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  repeatMode: "none",
  isShuffled: false,
  isFullscreen: false,
  isLoading: false,

  playSong: (song, playlist) => {
    const list = playlist ?? get().playlist;
    let index = list.findIndex((s) => s.id === song.id);

    if (index === -1 && list.length > 0) {
      list.unshift(song);
      index = 0;
    }

    const shouldShuffle = get().isShuffled;
    let nextIndex = index;

    if (shouldShuffle && list.length > 1) {
      const available = list
        .map((_, i) => i)
        .filter((i) => i !== index);
      nextIndex = available[Math.floor(Math.random() * available.length)];
    }

    set({
      playlist: list,
      currentIndex: nextIndex,
      isPlaying: true,
      currentTime: 0,
      isLoading: true,
    });
  },

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),

  next: () => {
    const { playlist, currentIndex, repeatMode, isShuffled } = get();
    if (playlist.length === 0) return;

    if (repeatMode === "one") {
      set({ currentTime: 0 });
      return;
    }

    let nextIndex = currentIndex + 1;

    if (nextIndex >= playlist.length) {
      if (repeatMode === "all") {
        nextIndex = 0;
      } else {
        set({ isPlaying: false });
        return;
      }
    }

    if (isShuffled) {
      const available = playlist
        .map((_, i) => i)
        .filter((i) => i !== currentIndex);
      nextIndex = available[Math.floor(Math.random() * available.length)];
    }

    set({
      currentIndex: nextIndex,
      currentTime: 0,
      isLoading: true,
    });
  },

  prev: () => {
    const { currentTime, currentIndex, playlist } = get();
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }
    const prevIndex =
      currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1;
    set({
      currentIndex: prevIndex,
      currentTime: 0,
      isLoading: true,
    });
  },

  seek: (time) => set({ currentTime: time }),

  setVolume: (vol) => set({ volume: Math.max(0, Math.min(1, vol)), isMuted: false }),

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  cycleRepeat: () =>
    set((state) => {
      const modes: RepeatMode[] = ["none", "all", "one"];
      const currentIdx = modes.indexOf(state.repeatMode);
      return { repeatMode: modes[(currentIdx + 1) % modes.length] };
    }),

  toggleShuffle: () => set((state) => ({ isShuffled: !state.isShuffled })),

  setFullscreen: (val) => set({ isFullscreen: val }),

  setCurrentTime: (time) => set({ currentTime: time }),

  setDuration: (duration) => set({ duration }),

  setLoading: (loading) => set({ isLoading: loading }),

  onSongEnd: () => {
    const { repeatMode } = get();
    if (repeatMode === "one") {
      set({ currentTime: 0 });
    } else {
      get().next();
    }
  },
}));

export const useCurrentSong = () => {
  const playlist = usePlayerStore((s) => s.playlist);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  return currentIndex >= 0 ? playlist[currentIndex] : null;
};
