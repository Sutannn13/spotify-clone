"use client";

import { Music, PlusSquare } from "lucide-react";

interface HeaderProps {
  onAddSong: () => void;
}

export function Header({ onAddSong }: HeaderProps) {
  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-4 border-b border-border bg-bg-base/80 glass">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0">
          <Music className="w-3.5 h-3.5 text-white" strokeWidth={2} />
        </div>
        <span className="text-sm font-semibold tracking-tight text-text-primary">
          Aura
        </span>
      </div>

      <button
        type="button"
        onClick={onAddSong}
        className="w-8 h-8 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
        aria-label="Add song"
      >
        <PlusSquare className="w-5 h-5" />
      </button>
    </header>
  );
}
