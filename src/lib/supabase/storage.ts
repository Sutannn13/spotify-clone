import { getSupabaseClient } from "./client";

const AUDIO_BUCKET = "song-audio";
const COVER_BUCKET = "song-covers";

function sanitizeFileName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");
}

function buildStoragePath(songId: string, fileName: string): string {
  const safeName = sanitizeFileName(fileName) || "file";
  return `${songId}/${Date.now()}-${safeName}`;
}

export interface UploadedStorageFile {
  path: string;
  publicUrl: string;
  fileName: string;
}

export async function uploadSongAudioFile(
  songId: string,
  file: File
): Promise<UploadedStorageFile> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const path = buildStoragePath(songId, file.name);
  const { error } = await supabase.storage.from(AUDIO_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "audio/mpeg",
  });

  if (error) {
    throw new Error(`Failed to upload audio: ${error.message}`);
  }

  const { data } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(path);

  return {
    path,
    publicUrl: data.publicUrl,
    fileName: path,
  };
}

export async function uploadSongCoverFile(
  songId: string,
  file: File
): Promise<UploadedStorageFile> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const path = buildStoragePath(songId, file.name);
  const { error } = await supabase.storage.from(COVER_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "image/webp",
  });

  if (error) {
    throw new Error(`Failed to upload cover: ${error.message}`);
  }

  const { data } = supabase.storage.from(COVER_BUCKET).getPublicUrl(path);

  return {
    path,
    publicUrl: data.publicUrl,
    fileName: path,
  };
}

export async function deleteSupabaseStorageFiles(params: {
  audioFileName?: string | null;
  coverFileName?: string | null;
}) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const deletions: Promise<unknown>[] = [];

  if (params.audioFileName) {
    deletions.push(
      supabase.storage.from(AUDIO_BUCKET).remove([params.audioFileName])
    );
  }

  if (params.coverFileName) {
    deletions.push(
      supabase.storage.from(COVER_BUCKET).remove([params.coverFileName])
    );
  }

  await Promise.allSettled(deletions);
}

