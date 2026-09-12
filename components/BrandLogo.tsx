"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

type BrandLogoProps = {
  className?: string
  size?: number
  priority?: boolean
  /** icon = crop-friendly square mark; full = full logo artwork */
  variant?: "icon" | "full"
}

export function BrandLogo({ className, size = 40, priority, variant = "icon" }: BrandLogoProps) {
  return (
    <Image
      src="/images/logo.png"
      alt="Sigma Wealth Solutions"
      width={variant === "full" ? size * 2.2 : size}
      height={size}
      priority={priority}
      className={cn(
        "object-contain select-none",
        variant === "icon" && "rounded-lg",
        className
      )}
    />
  )
}
