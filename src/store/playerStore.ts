import { create } from "zustand";
import type { Song } from "@/data/songs.types";

export type RepeatMode = "none" | "one" | "all";
export type SleepTimerOption =
  | "off"
  | "5"
  | "10"
  | "15"
  | "30"
  | "45"
  | "60"
  | "end-of-song";

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
  // Queue
  queue: Song[];
  queuePosition: number;
  // Sleep timer
  sleepTimer: SleepTimerOption;
  sleepTimerEndsAt: number | null;
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
  setPlaybackError: (error: string | null) => void;
  onSongEnd: () => void;
  getCurrentSong: () => Song | null;
  setPlaylist: (songs: Song[]) => void;
  // Queue
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

/** Returns the next index considering shuffle, repeatMode, and end-of-playlist. */
function computeNextIndex(
  playlist: Song[],
  currentIndex: number,
  repeatMode: RepeatMode,
  isShuffled: boolean
): number | null {
  if (playlist.length === 0) return null;

  // Repeat one: just restart this song (caller handles seek + play)
  if (repeatMode === "one") return currentIndex;

  let nextIndex: number;

  if (isShuffled) {
    const available = playlist
      .map((_, i) => i)
      .filter((i) => i !== currentIndex);
    nextIndex =
      available.length > 0
        ? available[Math.floor(Math.random() * available.length)]
        : currentIndex;
  } else {
    nextIndex = currentIndex + 1;
    if (nextIndex >= playlist.length) {
      if (repeatMode === "all") {
        nextIndex = 0;
      } else {
        return null; // end of playlist, stop
      }
    }
  }

  return nextIndex;
}

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
  queue: [],
  queuePosition: -1,
  sleepTimer: "off",
  sleepTimerEndsAt: null,

  setPlaylist: (songs) => set({ playlist: songs }),

  /**
   * Play a specific song. Shuffle NEVER affects which song is played here.
   * Only next() respects shuffle.
   */
  playSong: (song, playlist) => {
    const state = get();
    const list = playlist ?? state.playlist;
    let index = list.findIndex((s) => s.id === song.id);

    // Not found in given list — prepend to playlist
    if (index === -1 && list.length > 0) {
      set({
        playlist: [song, ...list],
        currentIndex: 0,
        isPlaying: true,
        currentTime: 0,
        isLoading: true,
        playbackError: null,
      });
      return;
    }

    if (index === -1) {
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

    // Same song, same playlist — just resume
    if (state.currentIndex === index && state.playlist === list) {
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
  toggle: () =>
    set((state) => ({
      isPlaying: !state.isPlaying,
      playbackError: state.isPlaying ? state.playbackError : null,
    })),

  next: () => {
    const { playlist, currentIndex, repeatMode, isShuffled } = get();
    const nextIdx = computeNextIndex(playlist, currentIndex, repeatMode, isShuffled);

    if (nextIdx === null) {
      // End of non-looping playlist
      set({ isPlaying: false });
      return;
    }

    // repeatMode === "one" means just restart (seek handled by audio hook)
    if (repeatMode === "one") {
      set({ currentTime: 0, isPlaying: true, isLoading: false, playbackError: null });
      return;
    }

    set({
      currentIndex: nextIdx,
      currentTime: 0,
      isPlaying: true,
      isLoading: true,
      playbackError: null,
    });
  },

  prev: () => {
    const { currentTime, currentIndex, playlist } = get();
    if (playlist.length === 0) return;

    // Restart current song if more than 3s in
    if (currentTime > 3) {
      set({ currentTime: 0, playbackError: null });
      return;
    }

    const prevIndex =
      currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1;
    set({
      currentIndex: prevIndex,
      currentTime: 0,
      isPlaying: true,
      isLoading: true,
      playbackError: null,
    });
  },

  seek: (time) => set({ currentTime: time }),

  setVolume: (vol) =>
    set({ volume: Math.max(0, Math.min(1, vol)), isMuted: false }),

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

  /**
   * Called by the audio element's `ended` event.
   * - Handles sleep-timer "end-of-song" once.
   * - Handles repeat-one: seek to 0 and restart.
   * - Otherwise calls next().
   */
  onSongEnd: () => {
    const { repeatMode, sleepTimer, pause } = get();

    if (sleepTimer === "end-of-song") {
      pause();
      set({ sleepTimer: "off", sleepTimerEndsAt: null });
      return;
    }

    if (repeatMode === "one") {
      // Seek to 0 and restart — isPlaying stays true so audio hook auto-plays
      set({ currentTime: 0, isPlaying: true, isLoading: false, playbackError: null });
      return;
    }

    get().next();
  },

  getCurrentSong: () => {
    const { playlist, currentIndex } = get();
    return currentIndex >= 0 && currentIndex < playlist.length
      ? playlist[currentIndex]
      : null;
  },

  // Queue
  setQueue: (songs, position = -1) => set({ queue: songs, queuePosition: position }),

  addToQueue: (song) => {
    set((state) => ({ queue: [...state.queue, song] }));
  },

  removeFromQueue: (songId) => {
    set((state) => {
      const idx = state.queue.findIndex((s) => s.id === songId);
      if (idx === -1) return {};
      const newQueue = state.queue.filter((s) => s.id !== songId);
      let newPos = state.queuePosition;
      if (idx < state.queuePosition) newPos = Math.max(-1, state.queuePosition - 1);
      else if (idx === state.queuePosition) newPos = -1;
      return { queue: newQueue, queuePosition: newPos };
    });
  },

  clearQueue: () => set({ queue: [], queuePosition: -1 }),

  moveQueueItem: (fromIndex, toIndex) => {
    set((state) => {
      if (fromIndex < 0 || fromIndex >= state.queue.length) return {};
      if (toIndex < 0 || toIndex >= state.queue.length) return {};
      const newQueue = [...state.queue];
      const [item] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, item);
      return { queue: newQueue };
    });
  },

  // Sleep timer
  setSleepTimer: (option) => {
    if (option === "off") {
      set({ sleepTimer: "off", sleepTimerEndsAt: null });
    } else if (option === "end-of-song") {
      set({ sleepTimer: "end-of-song", sleepTimerEndsAt: null });
    } else {
      const minutes = parseInt(option, 10);
      set({ sleepTimer: option, sleepTimerEndsAt: Date.now() + minutes * 60 * 1000 });
    }
  },

  clearSleepTimer: () => set({ sleepTimer: "off", sleepTimerEndsAt: null }),

  checkSleepTimer: () => {
    const { sleepTimer, sleepTimerEndsAt, isPlaying, pause } = get();
    if (!isPlaying || sleepTimer === "off") return;
    if (sleepTimer === "end-of-song") return;
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