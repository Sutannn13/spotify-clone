"use client";

import { useState } from "react";
import { Moon } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import type { SleepTimerOption } from "@/store/playerStore";

const SLEEP_TIMER_OPTIONS: { value: SleepTimerOption; label: string }[] = [
  { value: "off", label: "Off" },
  { value: "5", label: "5 minutes" },
  { value: "10", label: "10 minutes" },
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
  { value: "end-of-song", label: "End of current song" },
];

function formatRemainingTime(endsAt: number | null): string {
  if (!endsAt) return "";
  const remaining = Math.max(0, endsAt - Date.now());
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function SleepTimerControl() {
  const [open, setOpen] = useState(false);
  const sleepTimer = usePlayerStore((s) => s.sleepTimer);
  const sleepTimerEndsAt = usePlayerStore((s) => s.sleepTimerEndsAt);
  const setSleepTimer = usePlayerStore((s) => s.setSleepTimer);

  const activeOption = SLEEP_TIMER_OPTIONS.find((o) => o.value === sleepTimer);
  const remaining = formatRemainingTime(sleepTimerEndsAt);
  const isActive = sleepTimer !== "off";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          "w-9 h-9 flex items-center justify-center rounded-full transition-all",
          isActive
            ? "text-accent bg-accent/10"
            : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
        )}
        aria-label="Sleep timer"
        aria-pressed={isActive}
      >
        <Moon className="w-4 h-4" />
        {isActive && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full right-0 mb-2 z-20 w-56 bg-bg-elevated border border-border rounded-xl shadow-xl shadow-black/40 overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Sleep Timer
                </p>
                {remaining && (
                  <p className="text-xs text-text-secondary mt-1">
                    {remaining} remaining
                  </p>
                )}
              </div>
              <div className="py-1">
                {SLEEP_TIMER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSleepTimer(opt.value);
                      setOpen(false);
                    }}
                    className={clsx(
                      "w-full px-3 py-2 text-sm text-left transition-colors",
                      sleepTimer === opt.value
                        ? "bg-bg-hover text-text-primary font-medium"
                        : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}