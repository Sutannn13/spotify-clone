"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, Heart, Plus } from "lucide-react";
import { clsx } from "clsx";

interface MobileNavProps {
  onAddSong: () => void;
}

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Library", icon: Library },
  { href: "/liked", label: "Liked", icon: Heart },
];

export function MobileNav({ onAddSong }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg-base/95 backdrop-blur-lg border-t border-border safe-area-bottom"
    >
      <div className="flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] min-h-[48px] justify-center transition-colors",
                isActive
                  ? "text-text-primary"
                  : "text-text-muted"
              )}
            >
              <item.icon
                className={clsx(
                  "w-5 h-5 transition-colors",
                  isActive && "text-accent"
                )}
                fill={item.icon === Heart && isActive ? "currentColor" : "none"}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Add Song button */}
        <button
          type="button"
          onClick={onAddSong}
          className="flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] min-h-[48px] justify-center text-text-muted"
        >
          <div className="w-5 h-5 rounded-md bg-bg-elevated border border-border flex items-center justify-center">
            <Plus className="w-3 h-3" />
          </div>
          <span className="text-[10px] font-medium">Add</span>
        </button>
      </div>
    </nav>
  );
}
