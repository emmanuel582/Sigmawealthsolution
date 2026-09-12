"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

type BrandLogoProps = {
  className?: string
  size?: number
  priority?: boolean
  /** Kept for call-site compat — always uses logo.png */
  variant?: "icon" | "full"
}

/** Single brand asset: /images/logo.png (transparent). */
export function BrandLogo({ className, size = 40, priority }: BrandLogoProps) {
  return (
    <Image
      src="/images/logo.png"
      alt="Sigma Wealth Solutions"
      width={size}
      height={size}
      priority={priority}
      className={cn("object-contain select-none bg-transparent", className)}
    />
  )
}
