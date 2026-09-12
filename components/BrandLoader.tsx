"use client"

import { BrandLogo } from "@/components/BrandLogo"
import { cn } from "@/lib/utils"

type BrandLoaderProps = {
  label?: string
  className?: string
  size?: number
}

/** Centered logo with an intentional orbiting ring — used for route/auth loading. */
export function BrandLoader({ label = "Loading…", className, size = 72 }: BrandLoaderProps) {
  const ring = size + 28

  return (
    <div
      className={cn(
        "min-h-screen bg-[#0d1a12] flex flex-col items-center justify-center gap-6 px-4",
        className
      )}
    >
      <div className="relative flex items-center justify-center" style={{ width: ring, height: ring }}>
        <div
          className="absolute inset-0 rounded-full border border-[#9fe870]/15"
          aria-hidden
        />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#9fe870] border-r-[#9fe870]/40 animate-spin"
          style={{ animationDuration: "1.15s" }}
          aria-hidden
        />
        <div
          className="absolute rounded-full border border-[#9fe870]/25 animate-spin"
          style={{
            width: ring - 12,
            height: ring - 12,
            animationDuration: "2.4s",
            animationDirection: "reverse",
          }}
          aria-hidden
        />
        <div className="relative z-10 rounded-2xl bg-black/40 p-2.5 shadow-[0_0_40px_rgba(159,232,112,0.12)]">
          <BrandLogo size={size} priority variant="icon" className="rounded-xl" />
        </div>
      </div>
      {label && (
        <p className="text-xs sm:text-sm font-medium tracking-wide text-[#9fe870]/80 animate-pulse">
          {label}
        </p>
      )}
    </div>
  )
}
