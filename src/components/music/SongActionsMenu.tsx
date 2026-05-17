"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { clsx } from "clsx";
import {
  MoreHorizontal,
  Play,
  Pause,
  Plus,
  Heart,
  HeartOff,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Song } from "@/data/songs.types";

interface SongActionsMenuProps {
  song: Song;
  isCurrent: boolean;
  isPlaying: boolean;
  isLiked: boolean;
  onPlayPause?: (song: Song) => void;
  onAddToQueue?: (song: Song) => void;
  onToggleLike?: (song: Song) => Promise<void> | void;
  onEdit?: (song: Song) => void;
  onDelete?: (song: Song) => void;
  triggerClassName?: string;
}

export function SongActionsMenu({
  song,
  isCurrent,
  isPlaying,
  isLiked,
  onPlayPause,
  onAddToQueue,
  onToggleLike,
  onEdit,
  onDelete,
  triggerClassName,
}: SongActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const canMutateSong = song.source === "local" || song.source === "supabase";
  const canEdit = canMutateSong && Boolean(onEdit);
  const canDelete = canMutateSong && Boolean(onDelete);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: Event) => {
      const target = event.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleAction = async (
    event: ReactMouseEvent<HTMLButtonElement>,
    action?: () => Promise<void> | void
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (!action) return;
    await action();
    setOpen(false);
  };

  const playLabel = isCurrent && isPlaying ? "Pause" : "Play";

  return (
    <div
      ref={rootRef}
      className="relative"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`More options for ${song.title}`}
        className={clsx(
          "w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors",
          triggerClassName
        )}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={`${song.title} actions`}
          className="absolute right-0 top-9 z-40 w-48 rounded-xl border border-white/10 bg-black/90 shadow-2xl shadow-black/60 p-1.5 backdrop-blur-md"
        >
          <button
            type="button"
            role="menuitem"
            onClick={(event) =>
              handleAction(event, () => onPlayPause?.(song))
            }
            className="w-full text-left text-sm px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            {playLabel}
          </button>

          {onAddToQueue && (
            <button
              type="button"
              role="menuitem"
              onClick={(event) =>
                handleAction(event, () => onAddToQueue(song))
              }
              className="w-full text-left text-sm px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Add to queue
            </button>
          )}

          {onToggleLike && (
            <button
              type="button"
              role="menuitem"
              onClick={(event) =>
                handleAction(event, () => onToggleLike(song))
              }
              className="w-full text-left text-sm px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              {isLiked ? (
                <HeartOff className="w-3.5 h-3.5" />
              ) : (
                <Heart className="w-3.5 h-3.5" />
              )}
              {isLiked ? "Unlike" : "Like"}
            </button>
          )}

          {(canEdit || canDelete) && (
            <div className="my-1 h-px bg-white/10" />
          )}

          {canEdit && (
            <button
              type="button"
              role="menuitem"
              onClick={(event) => handleAction(event, () => onEdit?.(song))}
              className="w-full text-left text-sm px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              role="menuitem"
              onClick={(event) => handleAction(event, () => onDelete?.(song))}
              className="w-full text-left text-sm px-3 py-2 rounded-lg text-red-300 hover:bg-red-500/20 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
