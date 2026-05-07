"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Library,
  Search,
  Music,
  PlusSquare,
  Heart,
  Clock,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Library", icon: Library },
];

const quickAccessItems = [
  {
    href: "/made-for-you",
    label: "Made for You",
    icon: Sparkles,
    gradient: "from-accent to-purple-900",
  },
  {
    href: "/recently-played",
    label: "Recently Played",
    icon: Clock,
    gradient: "from-emerald-600 to-emerald-900",
  },
  {
    href: "/liked",
    label: "Liked Songs",
    icon: Heart,
    gradient: "from-accent to-accent-muted",
  },
];

interface SidebarProps {
  onAddSong: () => void;
}

export function Sidebar({ onAddSong }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-border bg-bg-base h-full sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
          <Music className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <span className="text-base font-semibold tracking-tight text-text-primary">
          Aura
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 mt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 relative",
                isActive
                  ? "bg-bg-hover text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 w-1 h-5 rounded-r-full bg-accent"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Add Song button */}
      <div className="px-3 mt-4">
        <button
          type="button"
          onClick={onAddSong}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
        >
          <PlusSquare className="w-4 h-4 shrink-0" />
          Add Song
        </button>
      </div>

      {/* Quick Access section */}
      <div className="mt-6 px-6">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Quick Access
        </p>
      </div>

      <div className="flex flex-col gap-1 px-3 mt-3">
        {quickAccessItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                isActive
                  ? "bg-bg-hover text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
              )}
            >
              <div
                className={clsx(
                  "w-4 h-4 rounded flex items-center justify-center bg-gradient-to-br",
                  item.gradient
                )}
              >
                <item.icon className="w-2.5 h-2.5 text-white" />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom spacer */}
      <div className="mt-auto px-6 py-6">
        <p className="text-xs text-text-muted">
          &copy; 2026 Aura Music
        </p>
      </div>
    </aside>
  );
}