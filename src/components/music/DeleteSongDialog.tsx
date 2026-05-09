"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, AlertTriangle } from "lucide-react";
import { clsx } from "clsx";
import type { Song } from "@/data/songs.types";
import { useEffect, useId, useState } from "react";

interface DeleteSongDialogProps {
  isOpen: boolean;
  song: Song | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteSongDialog({
  isOpen,
  song,
  onClose,
  onConfirm,
}: DeleteSongDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) {
      setIsDeleting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isDeleting, onClose]);

  const isStaticSong = song?.source === "static";

  const handleConfirm = async () => {
    if (!song || isDeleting || isStaticSong) return;
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isDeleting) return;
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && song && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              className="pointer-events-auto w-full max-w-sm bg-bg-elevated border border-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start gap-4 p-6">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 id={titleId} className="text-base font-semibold text-text-primary">
                    Delete Song
                  </h3>
                  <p id={descriptionId} className="text-sm text-text-secondary mt-1">
                    Are you sure you want to remove{" "}
                    <span className="text-text-primary font-medium">"{song.title}"</span> by{" "}
                    <span className="text-text-primary font-medium">{song.artist}</span>?
                  </p>
                  {song.source === "static" && (
                    <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-yellow-500" />
                      Static songs must be edited in code.
                    </p>
                  )}
                  {song.source === "local" && (
                    <p className="text-xs text-text-muted mt-2">
                      This removes the uploaded audio and cover from this browser.
                    </p>
                  )}
                  {song.source === "supabase" && (
                    <p className="text-xs text-text-muted mt-2">
                      This deletes the cloud song metadata and related storage files.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isDeleting}
                  aria-label="Close delete dialog"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 px-6 py-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-text-secondary border border-border hover:bg-bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isDeleting || isStaticSong}
                  className={clsx(
                    "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2",
                    isStaticSong
                      ? "bg-bg-hover text-text-muted cursor-not-allowed"
                      : "bg-red-500 text-white hover:bg-red-600 disabled:opacity-70 disabled:cursor-not-allowed"
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
