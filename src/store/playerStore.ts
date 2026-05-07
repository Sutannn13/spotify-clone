import { create } from "zustand";
import type { Song } from "@/data/songs.types";

export type RepeatMode = "none" | "one" | "all";
export type SleepTimerOption = "off" | "5" | "10" | "15" | "30" | "45" | "60" | "end-of-song";

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
  playbackError: string | null;
  resolvedUrls: Map<string, { audioUrl: string; coverUrl: string }>;
  // Queue management
  queue: Song[];
  queuePosition: number;
  // Sleep timer
  sleepTimer: SleepTimerOption;
  sleepTimerEndsAt: number | null; // timestamp when timer should fire
}

interface PlayerActions {
  setPlaylist: (songs: Song[]) => void;
  setResolvedUrls: (urls: Map<string, { audioUrl: string; coverUrl: string }>) => void;
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
  setPlaybackError: (error: string | null) => void;
  onSongEnd: () => void;
  getCurrentSong: () => Song | null;
  // Queue actions
  setQueue: (songs: Song[], position?: number) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  clearQueue: () => void;
  moveQueueItem: (fromIndex: number, toIndex: number) => void;
  // Sleep timer
  setSleepTimer: (option: SleepTimerOption) => void;
  clearSleepTimer: () => void;
  checkSleepTimer: () => void;
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
  playbackError: null,
  resolvedUrls: new Map(),
  queue: [],
  queuePosition: -1,
  sleepTimer: "off",
  sleepTimerEndsAt: null,

  setPlaylist: (songs) => set({ playlist: songs }),

  setResolvedUrls: (urls) => set({ resolvedUrls: urls }),

  /**
   * Play a specific song. Shuffle NEVER affects which song is played here.
   * Shuffle only affects next(). The user-clicked song is always honored.
   */
  playSong: (song, playlist) => {
    const state = get();
    const list = playlist ?? state.playlist;
    let index = list.findIndex((s) => s.id === song.id);

    if (index === -1 && list.length > 0) {
      const newList = [song, ...list];
      set({
        playlist: newList,
        currentIndex: 0,
        isPlaying: true,
        currentTime: 0,
        isLoading: true,
        playbackError: null,
      });
      return;
    }

    if (index === -1) {
      // No playlist, single song
      set({
        playlist: [song],
        currentIndex: 0,
        isPlaying: true,
        currentTime: 0,
        isLoading: true,
        playbackError: null,
      });
      return;
    }

    // If same song is already current, do not reset
    if (state.currentIndex === index && state.playlist === list) {
      // Same song: just resume
      set({ isPlaying: true, playbackError: null });
      return;
    }

    set({
      playlist: list,
      currentIndex: index,
      isPlaying: true,
      currentTime: 0,
      isLoading: true,
      playbackError: null,
    });
  },

  play: () => set({ isPlaying: true, playbackError: null }),
  pause: () => set({ isPlaying: false }),
  toggle: () => set((state) => ({
    isPlaying: !state.isPlaying,
    playbackError: state.isPlaying ? state.playbackError : null,
  })),

  next: () => {
    const { playlist, currentIndex, repeatMode, isShuffled } = get();
    if (playlist.length === 0) return;

    if (repeatMode === "one") {
      // Restart current song
      set({ currentTime: 0, isLoading: true, playbackError: null });
      return;
    }

    let nextIndex: number;

    if (isShuffled) {
      // Pick random song that is not current
      const available = playlist
        .map((_, i) => i)
        .filter((i) => i !== currentIndex);
      if (available.length === 0) {
        nextIndex = currentIndex;
      } else {
        nextIndex = available[Math.floor(Math.random() * available.length)];
      }
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= playlist.length) {
        if (repeatMode === "all") {
          nextIndex = 0;
        } else {
          // repeatMode "none" at end: stop
          set({ isPlaying: false });
          return;
        }
      }
    }

    set({
      currentIndex: nextIndex,
      currentTime: 0,
      isLoading: true,
      playbackError: null,
    });
  },

  prev: () => {
    const { currentTime, currentIndex, playlist } = get();
    if (playlist.length === 0) return;

    if (currentTime > 3) {
      // Restart current song
      set({ currentTime: 0, playbackError: null });
      return;
    }

    const prevIndex =
      currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1;
    set({
      currentIndex: prevIndex,
      currentTime: 0,
      isLoading: true,
      playbackError: null,
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

  setPlaybackError: (error) => set({ playbackError: error }),

  onSongEnd: () => {
    const { repeatMode, sleepTimer, pause } = get();
    if (sleepTimer === "end-of-song") {
      pause();
      set({ sleepTimer: "off", sleepTimerEndsAt: null });
      return;
    }
    if (repeatMode === "one") {
      set({ currentTime: 0 });
    } else {
      get().next();
    }
  },

  getCurrentSong: () => {
    const { playlist, currentIndex } = get();
    return currentIndex >= 0 && currentIndex < playlist.length
      ? playlist[currentIndex]
      : null;
  },

  // Queue actions
  setQueue: (songs, position = -1) => {
    set({ queue: songs, queuePosition: position });
  },

  addToQueue: (song) => {
    const { queue } = get();
    set({ queue: [...queue, song] });
  },

  removeFromQueue: (songId) => {
    const { queue, queuePosition } = get();
    const idx = queue.findIndex((s) => s.id === songId);
    if (idx === -1) return;
    const newQueue = queue.filter((s) => s.id !== songId);
    // Adjust queue position if needed
    let newPos = queuePosition;
    if (idx < queuePosition) {
      newPos = Math.max(-1, queuePosition - 1);
    } else if (idx === queuePosition) {
      newPos = -1;
    }
    set({ queue: newQueue, queuePosition: newPos });
  },

  clearQueue: () => {
    set({ queue: [], queuePosition: -1 });
  },

  moveQueueItem: (fromIndex, toIndex) => {
    const { queue } = get();
    if (fromIndex < 0 || fromIndex >= queue.length) return;
    if (toIndex < 0 || toIndex >= queue.length) return;
    const newQueue = [...queue];
    const [item] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, item);
    set({ queue: newQueue });
  },

  // Sleep timer
  setSleepTimer: (option) => {
    if (option === "off") {
      set({ sleepTimer: "off", sleepTimerEndsAt: null });
    } else if (option === "end-of-song") {
      set({ sleepTimer: "end-of-song", sleepTimerEndsAt: null });
    } else {
      const minutes = parseInt(option, 10);
      const now = Date.now();
      set({ sleepTimer: option, sleepTimerEndsAt: now + minutes * 60 * 1000 });
    }
  },

  clearSleepTimer: () => {
    set({ sleepTimer: "off", sleepTimerEndsAt: null });
  },

  checkSleepTimer: () => {
    const { sleepTimer, sleepTimerEndsAt, isPlaying, pause } = get();
    if (!isPlaying || sleepTimer === "off") return;

    if (sleepTimer === "end-of-song") return; // handled by onSongEnd

    if (sleepTimerEndsAt !== null && Date.now() >= sleepTimerEndsAt) {
      pause();
      set({ sleepTimer: "off", sleepTimerEndsAt: null });
    }
  },
}));

export const useCurrentSong = () => {
  const playlist = usePlayerStore((s) => s.playlist);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  return currentIndex >= 0 && currentIndex < playlist.length
    ? playlist[currentIndex]
    : null;
};