"use client"
import Image from "next/image"
import { motion } from "framer-motion"
import { useDropdown } from "../contexts/DropdownContext"
import Link from "next/link"

export function HeroSection() {
  const { isFeaturesOpen } = useDropdown()

  return (
    <motion.section
      className="relative w-full min-h-[calc(100vh-72px)] sm:min-h-[calc(100vh-84px)] flex items-center justify-center overflow-hidden py-10 sm:py-12"
      animate={{
        scale: isFeaturesOpen ? 0.95 : 1,
        filter: isFeaturesOpen ? "blur(4px)" : "blur(0px)",
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
    >
      <Image
        src="/images/finance-management-hero-bg-scaled.png"
        alt="SigmawealthSolution investment background"
        fill
        style={{ objectFit: "cover" }}
        quality={100}
        className="absolute inset-0 z-0"
        priority
      />

      <div className="relative z-10 w-[95%] max-w-[1080px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-center lg:text-left">
            <motion.p
              className="text-[#004324] font-semibold text-sm sm:text-base tracking-wide mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              SigmawealthSolution
            </motion.p>
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5 sm:mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="text-black">Grow your wealth</span>
              <br />
              <span className="text-black">with smart</span>
              <br />
              <span className="text-[#004324]">investing</span>
            </motion.h1>

            <motion.p
              className="text-base sm:text-lg md:text-xl text-black/90 mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Invest from $100 to unlimited. Get your full return every month — 50% paid in the first two weeks, and the rest at month end.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-[#303030] hover:bg-[#004324] text-white font-semibold px-6 py-3 rounded-2xl text-base transition-all duration-200 transform hover:translate-y-1 shadow-[0_6px_0_#000000] hover:shadow-[0_4px_0_#000000] active:translate-y-2 active:shadow-[0_2px_0_#000000]">
                  Start Investing
                </button>
              </Link>
              <Link href="/#how-it-works" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-white text-[#004324] border border-[#004324] font-semibold px-6 py-3 rounded-2xl text-base transition-all duration-200 shadow-[0_4px_0_#002a18] hover:translate-y-0.5 hover:shadow-[0_2px_0_#002a18]">
                  How It Works
                </button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="relative flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="relative w-full max-w-xs sm:max-w-md lg:max-w-lg">
              <Image
                src="/images/Gemini_Generated_Image_w40uojw40uojw40u.jpg"
                alt="SigmawealthSolution investor platform"
                width={600}
                height={400}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
