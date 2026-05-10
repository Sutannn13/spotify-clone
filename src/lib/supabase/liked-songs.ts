import { getSupabaseClient } from "./client";

export interface CloudLikedSong {
  id: string;
  user_id: string;
  song_id: string;
  song_source: string;
  created_at: string;
}

export async function fetchCloudLikedSongIds(
  userId: string
): Promise<{ songId: string; songSource: string }[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("liked_songs")
    .select("song_id, song_source")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Failed to fetch cloud liked songs:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    songId: row.song_id,
    songSource: row.song_source,
  }));
}

export async function addCloudLikedSong(
  userId: string,
  songId: string,
  songSource: string
): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: "Supabase not configured" };

  const { error } = await supabase
    .from("liked_songs")
    .upsert(
      { user_id: userId, song_id: songId, song_source: songSource },
      { onConflict: "user_id,song_id" }
    );

  return { error: error?.message ?? null };
}

export async function removeCloudLikedSong(
  userId: string,
  songId: string
): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: "Supabase not configured" };

  const { error } = await supabase
    .from("liked_songs")
    .delete()
    .eq("user_id", userId)
    .eq("song_id", songId);

  return { error: error?.message ?? null };
}