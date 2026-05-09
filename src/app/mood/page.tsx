"use client";

import { MoodCard } from "@/components/mood/MoodCard";
import { MoodQueueList } from "@/components/mood/MoodQueueList";
import { useSongLibrary } from "@/hooks/SongLibraryProvider";
import { usePlayerStore } from "@/store/playerStore";
import { MOOD_CONFIGS, sortByMoodScore, type MoodCategory } from "@/lib/mood-queue";
import { useState, useMemo } from "react";
import { Headphones, Music2 } from "lucide-react";

export default function MoodQueuePage() {
  const { allSongs } = useSongLibrary();
  const playSong = usePlayerStore((s) => s.playSong);
  const [selectedMood, setSelectedMood] = useState<MoodCategory | null>(null);

  const moodQueue = useMemo(() => {
    if (!selectedMood) return [];
    const config = MOOD_CONFIGS.find((m) => m.id === selectedMood);
    if (!config) return [];
    return sortByMoodScore(allSongs, config, 25);
  }, [allSongs, selectedMood]);

  const handleMoodSelect = (moodId: MoodCategory) => {
    setSelectedMood(moodId);
  };

  const handlePlayMoodQueue = () => {
    if (moodQueue.length === 0) return;
    playSong(moodQueue[0], moodQueue);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Headphones className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Smart Mood Queue</h1>
            <p className="text-sm text-text-secondary">
              Select a mood to generate a personalized playlist
            </p>
          </div>
        </div>
      </div>

      {/* Mood Cards */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-4">How are you feeling?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {MOOD_CONFIGS.map((mood) => (
            <MoodCard
              key={mood.id}
              config={mood}
              isSelected={selectedMood === mood.id}
              onSelect={() => handleMoodSelect(mood.id)}
            />
          ))}
        </div>
      </section>

      {/* Mood Queue Preview */}
      {selectedMood && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Music2 className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-text-primary">
                {MOOD_CONFIGS.find((m) => m.id === selectedMood)?.label} Queue
              </h2>
              <span className="text-sm text-text-secondary">
                {moodQueue.length} songs
              </span>
            </div>
            {moodQueue.length > 0 && (
              <button
                type="button"
                onClick={handlePlayMoodQueue}
                className="px-4 py-2 bg-accent text-white rounded-full text-sm font-semibold
                         hover:bg-accent/90 transition-colors active:scale-95"
              >
                Play All
              </button>
            )}
          </div>

          {moodQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center mb-4">
                <Music2 className="w-8 h-8 text-text-muted" />
              </div>
              <p className="text-text-secondary">
                No songs match this mood yet. Try another mood or add more songs.
              </p>
            </div>
          ) : (
            <MoodQueueList
              songs={moodQueue}
              onPlay={(song, queue) => playSong(song, queue)}
            />
          )}
        </section>
      )}

      {/* Empty state when no mood selected */}
      {!selectedMood && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-bg-elevated flex items-center justify-center mb-6">
            <Headphones className="w-10 h-10 text-text-muted" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Choose your mood
          </h3>
          <p className="text-text-secondary max-w-md">
            Select a mood above to generate a personalized queue of songs that match
            your current vibe. The queue is deterministic and based on genre, mood tags,
            and energy level.
          </p>
        </div>
      )}
    </div>
  );
}