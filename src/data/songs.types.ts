export type LyricsType = "none" | "plain" | "lrc";
export type SongSource = "static" | "local" | "supabase";

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  audioUrl: string;
  coverUrl: string;
  lyrics: string;
  lyricsType: LyricsType;
  source: SongSource;
  audioFileName: string;
  coverFileName: string;
  createdAt: string;
  updatedAt?: string;
  mood?: string;
  genre?: string;
}

export interface LocalSong extends Song {
  source: "local";
  audioBlob?: Blob;
  coverBlob?: Blob;
}
