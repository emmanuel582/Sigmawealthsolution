"use client"

import { BrandLogo } from "@/components/BrandLogo"
import { cn } from "@/lib/utils"

type BrandLoaderProps = {
  /** Optional; omit for logo-only loading */
  label?: string
  className?: string
  size?: number
}

/** Centered logo with an orbiting ring — white canvas, no side branding text. */
export function BrandLoader({ label, className, size = 112 }: BrandLoaderProps) {
  const ring = size + 36

  return (
    <div
      className={cn(
        "min-h-screen bg-white flex flex-col items-center justify-center gap-5 px-4",
        className
      )}
    >
      <div className="relative flex items-center justify-center" style={{ width: ring, height: ring }}>
        <div
          className="absolute inset-0 rounded-full border border-[#004324]/10"
          aria-hidden
        />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#004324] border-r-[#9fe870] animate-spin"
          style={{ animationDuration: "1.15s" }}
          aria-hidden
        />
        <div
          className="absolute rounded-full border border-[#004324]/15 animate-spin"
          style={{
            width: ring - 14,
            height: ring - 14,
            animationDuration: "2.4s",
            animationDirection: "reverse",
          }}
          aria-hidden
        />
        <div className="relative z-10">
          <BrandLogo size={size} priority variant="icon" className="rounded-2xl shadow-sm" />
        </div>
      </div>
      {label ? (
        <p className="text-xs sm:text-sm font-medium tracking-wide text-[#004324]/70 animate-pulse">
          {label}
        </p>
      ) : null}
    </div>
  )
}
