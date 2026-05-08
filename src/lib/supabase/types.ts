export type SupabaseLyricsType = "none" | "plain" | "lrc";

export interface SupabaseSongRow {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  genre: string | null;
  mood: string | null;
  duration: number | null;
  audio_url: string;
  cover_url: string | null;
  lyrics: string | null;
  lyrics_type: SupabaseLyricsType;
  source: "supabase";
  audio_file_name: string | null;
  cover_file_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      songs: {
        Row: SupabaseSongRow;
        Insert: Omit<SupabaseSongRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<SupabaseSongRow>;
      };
    };
  };
}

