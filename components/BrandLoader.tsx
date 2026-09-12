"use client"

import { BrandLogo } from "@/components/BrandLogo"
import { cn } from "@/lib/utils"

type BrandLoaderProps = {
  label?: string
  className?: string
  size?: number
}

/** White loading canvas — logo neatly inside the orbit ring. */
export function BrandLoader({ label, className, size = 140 }: BrandLoaderProps) {
  const ring = size + 56
  const logoSize = Math.round(size * 0.72)

  return (
    <div
      className={cn(
        "min-h-screen bg-white flex flex-col items-center justify-center gap-5 px-4",
        className
      )}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: ring, height: ring }}
      >
        <div
          className="absolute inset-0 rounded-full border border-[#004324]/10"
          aria-hidden
        />
        <div
          className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#004324] border-r-[#9fe870] animate-spin"
          style={{ animationDuration: "1.15s" }}
          aria-hidden
        />
        <div
          className="absolute rounded-full border border-[#004324]/12 animate-spin"
          style={{
            width: ring - 16,
            height: ring - 16,
            animationDuration: "2.4s",
            animationDirection: "reverse",
          }}
          aria-hidden
        />
        <div className="relative z-10 flex items-center justify-center bg-transparent">
          <BrandLogo
            size={logoSize}
            priority
            className="bg-transparent drop-shadow-sm"
          />
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
