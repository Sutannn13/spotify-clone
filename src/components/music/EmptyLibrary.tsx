"use client";

import { motion } from "framer-motion";
import { Music2, Plus, Upload } from "lucide-react";
import { useLayout } from "@/components/layout/MainLayout";

export function EmptyLibrary() {
  const { openAddSong } = useLayout();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 py-16 text-center">
      {/* Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative mb-8"
      >
        <div className="w-24 h-24 rounded-full bg-bg-elevated flex items-center justify-center border border-border">
          <Music2 className="w-10 h-10 text-text-muted" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
          <Plus className="w-4 h-4 text-accent" />
        </div>
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="space-y-2 max-w-sm"
      >
        <h2 className="text-xl font-semibold text-text-primary tracking-tight">
          Your library is empty
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          Start building your collection by adding songs from your device.
          Your uploads are stored securely in your browser.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mt-8"
      >
        <button
          onClick={openAddSong}
          className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-text-primary text-bg-base text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Upload className="w-4 h-4" />
          Add Your First Song
        </button>
      </motion.div>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xs text-text-muted mt-6 max-w-xs"
      >
        Supports MP3, WAV, and M4A audio files.
        <br />
        Add album covers and lyrics for the full experience.
      </motion.p>
    </div>
  );
}
