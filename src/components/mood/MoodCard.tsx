"use client";

import { type MoodConfig } from "@/lib/mood-queue";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { Zap, Moon, Waves, Flame, Droplet, BookOpen } from "lucide-react";

const moodIcons: Record<string, React.ReactNode> = {
  focus: <Zap className="w-6 h-6" />,
  "late-night": <Moon className="w-6 h-6" />,
  chill: <Waves className="w-6 h-6" />,
  energetic: <Flame className="w-6 h-6" />,
  sad: <Droplet className="w-6 h-6" />,
  study: <BookOpen className="w-6 h-6" />,
};

const moodColors: Record<string, string> = {
  focus: "text-blue-400",
  "late-night": "text-purple-400",
  chill: "text-cyan-400",
  energetic: "text-yellow-400",
  sad: "text-gray-400",
  study: "text-emerald-400",
};

interface MoodCardProps {
  config: MoodConfig;
  isSelected: boolean;
  onSelect: () => void;
}

export function MoodCard({ config, isSelected, onSelect }: MoodCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={clsx(
        "relative flex flex-col items-center justify-center p-4 rounded-2xl",
        "bg-bg-elevated border border-border transition-all cursor-pointer",
        "min-h-[140px]",
        isSelected
          ? "border-accent ring-2 ring-accent/30 bg-accent/10"
          : "hover:border-border/80 hover:bg-bg-elevated/80"
      )}
    >
      {/* Background gradient */}
      <div
        className={clsx(
          "absolute inset-0 rounded-2xl opacity-0 transition-opacity",
          config.gradient,
          isSelected ? "opacity-100" : "group-hover:opacity-50"
        )}
      />

      {/* Icon */}
      <div
        className={clsx(
          "mb-3 transition-colors",
          moodColors[config.id] || "text-text-primary"
        )}
      >
        {moodIcons[config.id]}
      </div>

      {/* Label */}
      <span className="text-sm font-semibold text-text-primary mb-1">
        {config.label}
      </span>

      {/* Description */}
      <span className="text-xs text-text-secondary text-center line-clamp-2">
        {config.description}
      </span>

      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          layoutId="mood-selected"
          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-accent"
        />
      )}
    </motion.button>
  );
}