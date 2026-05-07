"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Library, Search, Music } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/library", label: "Library", icon: Library },
  { href: "/search", label: "Search", icon: Search },
];

export function Sidebar() {
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
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
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

      {/* Library section */}
      <div className="mt-6 px-6">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Your Library
        </p>
      </div>

      <div className="flex flex-col gap-1 px-3 mt-3">
        {["Made for You", "Recently Played", "Liked Songs"].map((item) => (
          <button
            key={item}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors duration-150 text-left"
          >
            <div className="w-4 h-4 rounded bg-bg-hover" />
            <span>{item}</span>
          </button>
        ))}
      </div>

      {/* Bottom spacer */}
      <div className="mt-auto px-6 py-6">
        <p className="text-xs text-text-muted">
          © 2026 Aura Music
        </p>
      </div>
    </aside>
  );
}