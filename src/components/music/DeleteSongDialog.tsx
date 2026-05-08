"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, AlertTriangle } from "lucide-react";
import { clsx } from "clsx";
import type { Song } from "@/data/songs.types";

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
  const handleConfirm = async () => {
    await onConfirm();
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
            onClick={onClose}
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
            <div className="pointer-events-auto w-full max-w-sm bg-bg-elevated border border-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
              {/* Header */}
              <div className="flex items-start gap-4 p-6">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-text-primary">
                    Delete Song
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Are you sure you want to remove{" "}
                    <span className="text-text-primary font-medium">"{song.title}"</span>{" "}
                    from your library?
                  </p>
                  {song.source === "static" && (
                    <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-yellow-500" />
                      Static songs must be edited in code.
                    </p>
                  )}
                  {song.source === "local" && (
                    <p className="text-xs text-text-muted mt-2">
                      This will permanently remove the uploaded file from your browser storage.
                    </p>
                  )}
                  {song.source === "supabase" && (
                    <p className="text-xs text-text-muted mt-2">
                      This will remove song metadata from Supabase and attempt to delete related storage files.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close delete dialog"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 px-6 py-4 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-text-secondary border border-border hover:bg-bg-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
