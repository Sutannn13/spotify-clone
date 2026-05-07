"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { isLikedSong, toggleLikeSong } from "@/lib/storage";
import { clsx } from "clsx";

interface LikeButtonProps {
  songId: string;
  className?: string;
  size?: "sm" | "md";
}

export function LikeButton({ songId, className, size = "sm" }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(isLikedSong(songId));
  }, [songId]);

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const nowLiked = toggleLikeSong(songId);
      setLiked(nowLiked);
    },
    [songId]
  );

  const iconSize = size === "md" ? "w-5 h-5" : "w-3.5 h-3.5";
  const btnSize = size === "md" ? "w-9 h-9" : "w-7 h-7";

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={clsx(
        "flex items-center justify-center rounded-full transition-all",
        btnSize,
        liked
          ? "text-accent"
          : "text-text-muted hover:text-text-primary",
        className
      )}
      aria-label={liked ? "Unlike" : "Like"}
      aria-pressed={liked}
    >
      <Heart
        className={clsx(iconSize, "transition-transform", liked && "scale-110")}
        fill={liked ? "currentColor" : "none"}
      />
    </button>
  );
}
