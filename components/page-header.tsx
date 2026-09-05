"use client"
import Image from "next/image"
import type { PageHeaderProps } from "./types"

export function PageHeader({ title, description, imageUrl }: PageHeaderProps) {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24 lg:py-32 flex items-center justify-center text-white overflow-hidden">
      <Image
        src={imageUrl || "/placeholder.svg"}
        alt={title}
        fill
        style={{ objectFit: "cover" }}
        quality={100}
        className="absolute inset-0 z-0"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#004324]/80 to-gray-950/70 z-10" />
      <div className="relative z-20 w-[95%] max-w-[1080px] mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">{title}</h1>
        <p className="mx-auto max-w-[700px] text-gray-200 text-sm sm:text-base md:text-xl mt-4">{description}</p>
      </div>
    </section>
  )
}
