import type { Song } from "@/data/songs.types";

const DB_NAME = "aura-music-db";
const DB_VERSION = 1;

const STORES = {
  SONGS: "local-songs",
  AUDIO_BLOBS: "audio-blobs",
  COVER_BLOBS: "cover-blobs",
} as const;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.SONGS)) {
        const songStore = db.createObjectStore(STORES.SONGS, { keyPath: "id" });
        songStore.createIndex("source", "source", { unique: false });
        songStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.AUDIO_BLOBS)) {
        db.createObjectStore(STORES.AUDIO_BLOBS, { keyPath: "songId" });
      }

      if (!db.objectStoreNames.contains(STORES.COVER_BLOBS)) {
        db.createObjectStore(STORES.COVER_BLOBS, { keyPath: "songId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getLocalSongs(): Promise<Song[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SONGS, "readonly");
    const store = tx.objectStore(STORES.SONGS);
    const request = store.getAll();

    request.onsuccess = () => {
      const songs = (request.result as Song[]).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      resolve(songs);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveLocalSong(
  song: Song,
  audioBlob?: Blob,
  coverBlob?: Blob
): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(
      [STORES.SONGS, STORES.AUDIO_BLOBS, STORES.COVER_BLOBS],
      "readwrite"
    );

    const songStore = tx.objectStore(STORES.SONGS);
    const audioStore = tx.objectStore(STORES.AUDIO_BLOBS);
    const coverStore = tx.objectStore(STORES.COVER_BLOBS);

    songStore.put(song);

    if (audioBlob) {
      audioStore.put({ songId: song.id, blob: audioBlob });
    }
    if (coverBlob) {
      coverStore.put({ songId: song.id, blob: coverBlob });
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteLocalSong(songId: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(
      [STORES.SONGS, STORES.AUDIO_BLOBS, STORES.COVER_BLOBS],
      "readwrite"
    );

    tx.objectStore(STORES.SONGS).delete(songId);
    tx.objectStore(STORES.AUDIO_BLOBS).delete(songId);
    tx.objectStore(STORES.COVER_BLOBS).delete(songId);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAudioBlob(songId: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.AUDIO_BLOBS, "readonly");
    const store = tx.objectStore(STORES.AUDIO_BLOBS);
    const request = store.get(songId);

    request.onsuccess = () => {
      resolve(request.result?.blob ?? null);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getCoverBlob(songId: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.COVER_BLOBS, "readonly");
    const store = tx.objectStore(STORES.COVER_BLOBS);
    const request = store.get(songId);

    request.onsuccess = () => {
      resolve(request.result?.blob ?? null);
    };
    request.onerror = () => reject(request.error);
  });
}

export function createObjectUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokeObjectUrl(url: string): void {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export async function getLocalSongWithBlobs(
  songId: string
): Promise<{ song: Song; audioUrl: string; coverUrl: string } | null> {
  const songs = await getLocalSongs();
  const song = songs.find((s) => s.id === songId);
  if (!song) return null;

  const [audioBlob, coverBlob] = await Promise.all([
    getAudioBlob(songId),
    getCoverBlob(songId),
  ]);

  const audioUrl = audioBlob ? createObjectUrl(audioBlob) : "";
  const coverUrl = coverBlob ? createObjectUrl(coverBlob) : "";

  return { song, audioUrl, coverUrl };
}
