import { create } from "zustand";
import type { Song } from "@/data/songs.types";

export type RepeatMode = "off" | "once" | "forever";
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
  repeatSongId: string | null; // which song the repeat mode applies to
  isShuffled: boolean;
  isFullscreen: boolean;
  isLoading: boolean;
  playbackError: string | null;
  queue: Song[];
  queuePosition: number;
  sleepTimer: SleepTimerOption;
  sleepTimerEndsAt: number | null;
}

interface PlayerActions {
  playSong: (song: Song, playlist?: Song[]) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: (opts?: { manual?: boolean }) => void;
  prev: (opts?: { manual?: boolean }) => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  cycleRepeat: () => void;
  resetRepeat: () => void;
  toggleShuffle: () => void;
  setFullscreen: (val: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setLoading: (loading: boolean) => void;
  setPlaybackError: (error: string | null) => void;
  onSongEnd: () => void;
  getCurrentSong: () => Song | null;
  setPlaylist: (songs: Song[]) => void;
  setQueue: (songs: Song[], position?: number) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  clearQueue: () => void;
  moveQueueItem: (fromIndex: number, toIndex: number) => void;
  setSleepTimer: (option: SleepTimerOption) => void;
  clearSleepTimer: () => void;
  checkSleepTimer: () => void;
}

type PlayerStore = PlayerState & PlayerActions;

/** Compare two playlists by song IDs. Returns true if they contain the same songs in the same order. */
function playlistsMatchById(a: Song[], b: Song[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id) return false;
  }
  return true;
}

/** Returns the next index for autoplay (shuffle/sequential), NOT for repeat. */
function computeAutoplayNext(
  playlist: Song[],
  currentIndex: number,
  isShuffled: boolean
): number | null {
  if (playlist.length === 0) return null;
  if (isShuffled) {
    const available = playlist
      .map((_, i) => i)
      .filter((i) => i !== currentIndex);
    return available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : currentIndex;
  }
  const next = currentIndex + 1;
  return next < playlist.length ? next : null;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  playlist: [],
  currentIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  repeatMode: "off",
  repeatSongId: null,
  isShuffled: false,
  isFullscreen: false,
  isLoading: false,
  playbackError: null,
  queue: [],
  queuePosition: -1,
  sleepTimer: "off",
  sleepTimerEndsAt: null,

  /**
   * Smart playlist update — preserves currentIndex/currentTime if the current song
   * still exists in the new playlist. Only resets on song removal.
   */
  setPlaylist: (songs) => {
    const { currentIndex, playlist: oldPlaylist } = get();
    const currentSong = currentIndex >= 0 && currentIndex < oldPlaylist.length
      ? oldPlaylist[currentIndex]
      : null;

    if (currentSong) {
      const newIndex = songs.findIndex((s) => s.id === currentSong.id);
      if (newIndex !== -1) {
        // Current song still exists — preserve its position, don't reset time/playback
        set({ playlist: songs, currentIndex: newIndex });
        return;
      }
    }
    // Current song removed or no current song
    set({ playlist: songs, currentIndex: -1, isPlaying: false, currentTime: 0 });
  },

  /**
   * Play a song. Direct user clicks always play the exact song — shuffle never overrides.
   * Repeat is reset because a new song was selected.
   */
  playSong: (song, playlist) => {
    const state = get();
    const list = playlist ?? state.playlist;

    // Reset repeat when selecting a different song
    const wasRepeatForSameSong =
      state.repeatMode !== "off" && state.repeatSongId === song.id;

    const listIndex = list.findIndex((s) => s.id === song.id);

    // Song not in the given list — prepend it
    if (listIndex === -1) {
      set({
        playlist: [song, ...list],
        currentIndex: 0,
        isPlaying: true,
        currentTime: 0,
        isLoading: true,
        playbackError: null,
        repeatMode: "off",
        repeatSongId: null,
      });
      return;
    }

    // Same song, same playlist array content — just resume
    if (
      listIndex === state.currentIndex &&
      playlistsMatchById(list, state.playlist)
    ) {
      set({ isPlaying: true, playbackError: null });
      return;
    }

    set({
      playlist: list,
      currentIndex: listIndex,
      isPlaying: true,
      currentTime: 0,
      isLoading: true,
      playbackError: null,
      repeatMode: "off",
      repeatSongId: null,
    });
  },

  play: () => set({ isPlaying: true, playbackError: null }),
  pause: () => set({ isPlaying: false }),
  toggle: () =>
    set((state) => ({
      isPlaying: !state.isPlaying,
      playbackError: state.isPlaying ? state.playbackError : null,
    })),

  /**
   * next({ manual: true }) — user pressed next. Always resets repeat.
   * next() — autoplay. Does NOT reset repeat.
   */
  next: (opts) => {
    const { playlist, currentIndex, repeatMode, repeatSongId, isShuffled } = get();
    if (playlist.length === 0) return;

    const isManual = opts?.manual === true;

    // Manual navigation always resets repeat
    if (isManual) {
      if (repeatMode !== "off") {
        set({ repeatMode: "off", repeatSongId: null });
      }
      const autoplayNext = computeAutoplayNext(playlist, currentIndex, isShuffled);
      if (autoplayNext === null) {
        set({ isPlaying: false });
        return;
      }
      set({
        currentIndex: autoplayNext,
        currentTime: 0,
        isPlaying: true,
        isLoading: true,
        playbackError: null,
      });
      return;
    }

    // Autoplay path
    if (repeatMode === "once" && repeatSongId === playlist[currentIndex]?.id) {
      // "once" was consumed — go to autoplay next, reset repeat
      set({ repeatMode: "off", repeatSongId: null, currentTime: 0, isPlaying: true, isLoading: false });
      return;
    }

    if (repeatMode === "forever" && repeatSongId === playlist[currentIndex]?.id) {
      // Restart same song
      set({ currentTime: 0, isPlaying: true, isLoading: false, playbackError: null });
      return;
    }

    const autoplayNext = computeAutoplayNext(playlist, currentIndex, isShuffled);
    if (autoplayNext === null) {
      set({ isPlaying: false });
      return;
    }
    set({
      currentIndex: autoplayNext,
      currentTime: 0,
      isPlaying: true,
      isLoading: true,
      playbackError: null,
    });
  },

  /**
   * prev({ manual: true }) — user pressed prev. Resets repeat.
   * prev() — autoplay navigation. Does NOT reset repeat.
   */
  prev: (opts) => {
    const { currentTime, currentIndex, playlist } = get();
    if (playlist.length === 0) return;

    const isManual = opts?.manual === true;

    if (currentTime > 3) {
      // Restart current song
      set({ currentTime: 0, playbackError: null });
      return;
    }

    const prevIndex =
      currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1;

    if (isManual && get().repeatMode !== "off") {
      set({ repeatMode: "off", repeatSongId: null });
    }

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

  /**
   * Cycle repeat for the CURRENT song only.
   * off → once → forever → off
   * If cycling for a different song, start from "once".
   */
  cycleRepeat: () => {
    const { repeatMode, repeatSongId, currentIndex, playlist } = get();
    const currentSongId = currentIndex >= 0 && currentIndex < playlist.length
      ? playlist[currentIndex].id
      : null;

    if (!currentSongId) return;

    const isForCurrentSong = repeatSongId === currentSongId;

    if (!isForCurrentSong) {
      // First press for a new song — start at "once"
      set({ repeatMode: "once", repeatSongId: currentSongId });
      return;
    }

    // Cycle: off → once → forever → off
    const next: RepeatMode =
      repeatMode === "off" ? "once"
      : repeatMode === "once" ? "forever"
      : "off";
    set({
      repeatMode: next,
      repeatSongId: next === "off" ? null : currentSongId,
    });
  },

  /** Explicitly clear repeat mode. Called when navigating away or changing songs. */
  resetRepeat: () => set({ repeatMode: "off", repeatSongId: null }),

  toggleShuffle: () => set((state) => ({ isShuffled: !state.isShuffled })),

  setFullscreen: (val) => set({ isFullscreen: val }),

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setLoading: (loading) => set({ isLoading: loading }),
  setPlaybackError: (error) => set({ playbackError: error }),

  /**
   * Audio element ended event.
   * - Handles sleep-timer end-of-song.
   * - Handles "once": repeat once, then reset to off.
   * - Handles "forever": repeat same song indefinitely.
   * - Otherwise: autoplay next.
   */
  onSongEnd: () => {
    const { repeatMode, repeatSongId, currentIndex, playlist, sleepTimer, pause } = get();
    const currentSongId = currentIndex >= 0 && currentIndex < playlist.length
      ? playlist[currentIndex].id
      : null;

    if (sleepTimer === "end-of-song") {
      pause();
      set({ sleepTimer: "off", sleepTimerEndsAt: null });
      return;
    }

    if (repeatMode === "once" && repeatSongId === currentSongId) {
      // Consume the "once" — restart same song once more
      set({
        currentTime: 0,
        isPlaying: true,
        isLoading: false,
        playbackError: null,
        repeatMode: "off",
        repeatSongId: null,
      });
      return;
    }

    if (repeatMode === "forever" && repeatSongId === currentSongId) {
      // Restart same song
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
