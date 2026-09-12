"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { BrandLogo } from "@/components/BrandLogo"
import { ArrowLeft, Compass, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d1a12] text-white relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(159,232,112,0.14),_transparent_55%)]" />
      <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,#9fe870_1px,transparent_1px),linear-gradient(to_bottom,#9fe870_1px,transparent_1px)] bg-[size:48px_48px]" />

      <header className="relative z-10 px-5 sm:px-8 py-6">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <BrandLogo size={44} className="rounded-xl" />
          <span className="text-sm font-semibold tracking-wide text-white/80 group-hover:text-[#9fe870] transition">
            Sigma Wealth Solutions
          </span>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-5 sm:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-lg w-full text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#9fe870]/25 bg-[#9fe870]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9fe870] mb-6">
            <Compass className="w-3.5 h-3.5" />
            Path not found
          </div>

          <p className="text-[72px] sm:text-[96px] font-black leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#9fe870] to-[#9fe870]/20">
            404
          </p>

          <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">
            This page stepped off the map
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/60 leading-relaxed max-w-md mx-auto">
            Every route on Sigma Wealth is intentional. The link you followed either never existed,
            moved, or was kept private for security. Let&apos;s get you back to solid ground.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#9fe870] text-[#0d1a12] font-bold text-sm hover:brightness-105 transition shadow-[0_8px_30px_rgba(159,232,112,0.25)]"
            >
              <Home className="w-4 h-4" />
              Return home
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-2xl border border-white/15 text-white/85 font-semibold text-sm hover:bg-white/5 transition"
            >
              <ArrowLeft className="w-4 h-4 rotate-180" />
              Contact support
            </Link>
          </div>

          <p className="mt-10 text-[11px] text-white/35 tracking-wide">
            Tip: bookmark your dashboard — we keep sensitive tools off the public map.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
