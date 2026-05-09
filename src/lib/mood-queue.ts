import type { Song } from "@/data/songs.types";

export type MoodCategory =
  | "focus"
  | "late-night"
  | "chill"
  | "energetic"
  | "sad"
  | "study";

export interface MoodConfig {
  id: MoodCategory;
  label: string;
  emoji: string;
  gradient: string;
  description: string;
  tags: string[];
  energy: "low" | "medium" | "high";
  preferredGenres: string[];
  excludeGenres: string[];
}

export const MOOD_CONFIGS: MoodConfig[] = [
  {
    id: "focus",
    label: "Focus",
    emoji: "🎯",
    gradient: "from-blue-600/20 to-indigo-600/20",
    description: "Deep work and concentration",
    tags: ["instrumental", "ambient", "classical", "jazz"],
    energy: "medium",
    preferredGenres: ["instrumental", "ambient", "classical", "jazz", "electronic"],
    excludeGenres: ["rap", "metal"],
  },
  {
    id: "late-night",
    label: "Late Night",
    emoji: "🌙",
    gradient: "from-purple-600/20 to-pink-600/20",
    description: "Wind down after midnight",
    tags: ["slow", "lo-fi", "soul", "r&b"],
    energy: "low",
    preferredGenres: ["r&b", "soul", "slow", "lo-fi", "ambient"],
    excludeGenres: ["metal", "hardcore"],
  },
  {
    id: "chill",
    label: "Chill",
    emoji: "🌊",
    gradient: "from-cyan-600/20 to-teal-600/20",
    description: "Relaxed vibes",
    tags: ["lo-fi", "acoustic", "indie", "pop"],
    energy: "low",
    preferredGenres: ["indie", "acoustic", "lo-fi", "pop"],
    excludeGenres: ["metal", "hardcore"],
  },
  {
    id: "energetic",
    label: "Energetic",
    emoji: "⚡",
    gradient: "from-yellow-500/20 to-orange-500/20",
    description: "Pump up the volume",
    tags: ["edm", "pop", "dance", "rock"],
    energy: "high",
    preferredGenres: ["edm", "pop", "dance", "rock", "electronic"],
    excludeGenres: ["slow", "acoustic"],
  },
  {
    id: "sad",
    label: "Sad",
    emoji: "💧",
    gradient: "from-gray-600/20 to-slate-600/20",
    description: "Embrace the emotions",
    tags: ["sad", "melancholic", "ballad", "slow"],
    energy: "low",
    preferredGenres: ["ballad", "sad", "slow", "acoustic", "r&b"],
    excludeGenres: ["party", "dance", "edm"],
  },
  {
    id: "study",
    label: "Study",
    emoji: "📚",
    gradient: "from-green-600/20 to-emerald-600/20",
    description: "Ace your exams",
    tags: ["study", "lo-fi", "ambient", "classical"],
    energy: "medium",
    preferredGenres: ["lo-fi", "ambient", "classical", "instrumental", "electronic"],
    excludeGenres: ["metal", "hardcore", "party"],
  },
];

export const MOOD_MAP: Record<MoodCategory, MoodConfig> = Object.fromEntries(
  MOOD_CONFIGS.map((config) => [config.id, config])
) as Record<MoodCategory, MoodConfig>;

/** Score a song for a mood. Higher = better match. */
export function scoreSongForMood(song: Song, mood: MoodConfig): number {
  let score = 0;

  // Genre matching (most important)
  if (song.genre) {
    const normalizedGenre = song.genre.toLowerCase();
    if (mood.preferredGenres.some((g) => normalizedGenre.includes(g))) {
      score += 50;
    }
    if (mood.excludeGenres.some((g) => normalizedGenre.includes(g))) {
      score -= 30;
    }
  }

  // Mood matching
  if (song.mood) {
    const normalizedMood = song.mood.toLowerCase();
    if (normalizedMood === mood.id || normalizedMood.includes(mood.id)) {
      score += 40;
    }
    // Partial match
    if (mood.tags.some((tag) => normalizedMood.includes(tag))) {
      score += 20;
    }
  }

  // Title/Artist keywords (simple heuristic)
  const searchText = `${song.title} ${song.artist}`.toLowerCase();
  const relevantKeywords = getMoodKeywords(mood.id);
  for (const keyword of relevantKeywords) {
    if (searchText.includes(keyword)) {
      score += 10;
      break;
    }
  }

  // Energy matching (duration heuristic)
  if (mood.energy === "high" && song.duration > 0 && song.duration < 240) {
    score += 10; // Shorter songs tend to be more energetic
  }
  if (mood.energy === "low" && song.duration > 0 && song.duration > 180) {
    score += 10; // Longer songs tend to be more chill
  }

  return score;
}

function getMoodKeywords(mood: MoodCategory): string[] {
  const keywords: Record<MoodCategory, string[]> = {
    focus: ["instrumental", "study", "concentration", "ambient"],
    "late-night": ["night", "midnight", "slow", "vibes", "chill"],
    chill: ["relax", "chill", "easy", "summer", "vibes"],
    energetic: ["party", "dance", "club", "hype", "pump"],
    sad: ["sad", "cry", "heartbreak", "lonely", "missing"],
    study: ["study", "homework", "exam", "focus", "work"],
  };
  return keywords[mood] || [];
}

/** Sort songs by mood match score and limit the result. */
export function sortByMoodScore(songs: Song[], mood: MoodConfig, limit = 20): Song[] {
  return [...songs]
    .filter((s) => s.source !== "static" || hasMoodKeywords(s))
    .sort((a, b) => scoreSongForMood(b, mood) - scoreSongForMood(a, mood))
    .slice(0, limit);
}

function hasMoodKeywords(song: Song): boolean {
  const text = `${song.title} ${song.artist}`.toLowerCase();
  const keywords = ["chill", "relax", "vibes", "study", "focus", "night", "sad", "energy"];
  return keywords.some((k) => text.includes(k));
}