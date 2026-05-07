"use client";

import Image from "next/image";
import { useState, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Music2 } from "lucide-react";
import { clsx } from "clsx";

interface PremiumCoverProps {
  src: string;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl";
  priority?: boolean;
  /** Enable 3D tilt on hover (desktop) / press (mobile) */
  tilt?: boolean;
  /** Enable subtle scale pulse when playing */
  playing?: boolean;
  /** Show vinyl disc behind cover (fullscreen only) */
  showDisc?: boolean;
  /** Additional className for the wrapper */
  className?: string;
  /** Sizes prop for next/image */
  sizes?: string;
}

const SIZE_MAP = {
  xs: "w-10 h-10",
  sm: "w-11 h-11",
  md: "w-12 h-12",
  lg: "w-36 h-36 sm:w-40 sm:h-40 md:w-52 md:h-52",
  xl: "w-full max-w-[280px] sm:max-w-xs",
  hero: "w-36 h-36 sm:w-40 sm:h-40 md:w-52 md:h-52",
} as const;

const ROUNDED_MAP = {
  sm: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
} as const;

const DEFAULT_SIZES_MAP: Record<string, string> = {
  xs: "40px",
  sm: "44px",
  md: "48px",
  lg: "(max-width: 640px) 144px, (max-width: 768px) 160px, 208px",
  xl: "(max-width: 640px) 85vw, 320px",
  hero: "(max-width: 640px) 144px, (max-width: 768px) 160px, 208px",
};

/**
 * Premium album cover component with:
 * - Graceful fallback (charcoal bg + music icon, never broken image)
 * - 3D tilt on desktop hover / mobile press (CSS transforms, no WebGL)
 * - Subtle playing scale animation
 * - Optional vinyl disc layer
 * - Respects prefers-reduced-motion
 */
export function PremiumCover({
  src,
  alt,
  size = "md",
  rounded = "lg",
  priority = false,
  tilt = false,
  playing = false,
  showDisc = false,
  className,
  sizes,
}: PremiumCoverProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });

  const hasCover = src && !imgError;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!tilt || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setTransform({
        rotateX: (y - 0.5) * -7, // max 3.5deg each side
        rotateY: (x - 0.5) * 7,
      });
    },
    [tilt]
  );

  const handleMouseLeave = useCallback(() => {
    if (!tilt) return;
    setTransform({ rotateX: 0, rotateY: 0 });
  }, [tilt]);

  const handleTouchStart = useCallback(() => {
    if (!tilt) return;
    setTransform({ rotateX: -1.5, rotateY: 0 });
  }, [tilt]);

  const handleTouchEnd = useCallback(() => {
    if (!tilt) return;
    setTransform({ rotateX: 0, rotateY: 0 });
  }, [tilt]);

  const isAspectSquare = size === "xl";
  const resolvedSizes = sizes || DEFAULT_SIZES_MAP[size];

  const wrapperStyle = useMemo(
    () =>
      tilt
        ? {
            perspective: "800px",
          }
        : undefined,
    [tilt]
  );

  const innerStyle = useMemo(
    () =>
      tilt
        ? {
            transform: `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
            transition: "transform 0.25s cubic-bezier(0.33, 1, 0.68, 1)",
            transformStyle: "preserve-3d" as const,
          }
        : undefined,
    [tilt, transform]
  );

  return (
    <div
      ref={containerRef}
      className={clsx("premium-cover-perspective relative", className)}
      style={wrapperStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Optional vinyl disc behind cover */}
      {showDisc && (
        <div
          className={clsx(
            "premium-disc absolute inset-0 z-0",
            playing && "premium-disc-spinning"
          )}
          aria-hidden="true"
        >
          <div className="absolute inset-[5%] rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#262626]/40">
            <div className="absolute inset-[30%] rounded-full bg-[#0a0a0a] border border-[#333]/30" />
            {/* Groove lines */}
            <div className="absolute inset-[15%] rounded-full border border-[#222]/20" />
            <div className="absolute inset-[22%] rounded-full border border-[#222]/15" />
          </div>
        </div>
      )}

      <motion.div
        className={clsx(
          "relative overflow-hidden shrink-0 z-10",
          SIZE_MAP[size],
          ROUNDED_MAP[rounded],
          isAspectSquare && "aspect-square",
          playing && "premium-cover-playing",
          "premium-cover-shadow"
        )}
        style={innerStyle}
        animate={
          playing
            ? { scale: [1, 1.012, 1] }
            : { scale: 1 }
        }
        transition={
          playing
            ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.3 }
        }
      >
        {hasCover ? (
          <>
            <Image
              src={src}
              alt={alt}
              fill
              className={clsx(
                "object-cover transition-opacity duration-300",
                imgLoaded ? "opacity-100" : "opacity-0"
              )}
              sizes={resolvedSizes}
              priority={priority}
              onError={() => setImgError(true)}
              onLoad={() => setImgLoaded(true)}
            />
            {/* Loading skeleton */}
            {!imgLoaded && (
              <div className="absolute inset-0 bg-bg-elevated animate-pulse" />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center premium-cover-fallback">
            <Music2
              className={clsx(
                "text-text-muted/60",
                size === "xs" || size === "sm" || size === "md"
                  ? "w-4 h-4"
                  : size === "xl"
                    ? "w-14 h-14"
                    : "w-10 h-10"
              )}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
