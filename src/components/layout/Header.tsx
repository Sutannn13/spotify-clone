"use client";

import { Music } from "lucide-react";

export function Header() {
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
    </header>
  );
}
