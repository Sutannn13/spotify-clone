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

export interface SupabaseStorageCleanupResult {
  warnings: string[];
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
}): Promise<SupabaseStorageCleanupResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      warnings: ["Supabase client is not configured; storage cleanup skipped."],
    };
  }

  const warnings: string[] = [];
  const deletions: Array<{
    label: string;
    run: Promise<{ error: { message: string } | null }>;
  }> = [];

  if (params.audioFileName) {
    deletions.push({
      label: `audio file "${params.audioFileName}"`,
      run: supabase.storage
        .from(AUDIO_BUCKET)
        .remove([params.audioFileName]),
    });
  }

  if (params.coverFileName) {
    deletions.push({
      label: `cover file "${params.coverFileName}"`,
      run: supabase.storage
        .from(COVER_BUCKET)
        .remove([params.coverFileName]),
    });
  }

  if (deletions.length === 0) {
    return { warnings };
  }

  const results = await Promise.allSettled(deletions.map((d) => d.run));
  results.forEach((result, idx) => {
    const label = deletions[idx].label;
    if (result.status === "rejected") {
      warnings.push(`Failed to clean up ${label}.`);
      return;
    }

    if (result.value.error) {
      warnings.push(
        `Failed to clean up ${label}: ${result.value.error.message}`
      );
    }
  });

  return { warnings };
}

