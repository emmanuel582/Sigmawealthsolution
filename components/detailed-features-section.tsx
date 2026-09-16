"use client"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface CounterProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
}

function AnimatedCounter({ end, duration = 2, suffix = "", prefix = "" }: CounterProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(end * easeOutQuart))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration, isVisible])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      onViewportEnter={() => setIsVisible(true)}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#004324]">
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </span>
    </motion.div>
  )
}

export function DetailedFeaturesSection() {
  return (
    <section id="returns" className="w-full py-12 sm:py-16 md:py-24 bg-[#e8ebef] scroll-mt-24">
      <div className="w-[95%] max-w-[1080px] mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          className="text-center mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight mb-4 sm:mb-6 text-black">
            Designed for real investors who want clear, monthly returns.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12 md:gap-16 lg:gap-24 relative">
          <motion.div
            className="text-center relative"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div className="mb-4">
              <p className="text-base sm:text-lg font-semibold text-black mb-2">Minimum Investment</p>
            </div>
            <AnimatedCounter end={100000} prefix="₦" duration={2} />
            <p className="text-gray-600 mt-4 leading-relaxed text-sm sm:text-base">
              start from ₦100,000 — invest up to unlimited
            </p>
            <div className="hidden md:block absolute -right-8 lg:-right-12 top-1/2 transform -translate-y-1/2 w-px h-32 bg-gray-300" />
          </motion.div>

          <motion.div
            className="text-center relative"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mb-4">
              <p className="text-base sm:text-lg font-semibold text-black mb-2">First Payout</p>
            </div>
            <AnimatedCounter end={25} suffix="%" duration={2} />
            <p className="text-gray-600 mt-4 leading-relaxed text-sm sm:text-base">
              of your deposit paid every week for 4 weeks
            </p>
            <div className="hidden md:block absolute -right-8 lg:-right-12 top-1/2 transform -translate-y-1/2 w-px h-32 bg-gray-300" />
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="mb-4">
              <p className="text-base sm:text-lg font-semibold text-black mb-2">Full Cycle</p>
            </div>
            <AnimatedCounter end={4} suffix=" weeks" duration={1.5} />
            <p className="text-gray-600 mt-4 leading-relaxed text-sm sm:text-base">
              complete return by week 4 (includes interest)
            </p>
          </motion.div>
        </div>

        <motion.div
          className="mt-12 sm:mt-16 flex justify-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative w-full max-w-6xl overflow-hidden rounded-2xl border border-[#004324]/15 shadow-lg min-h-[220px] sm:min-h-[280px] md:min-h-[320px]">
            <Image
              src="/images/finance-management-hero-bg-scaled.png"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1080px) 95vw, 1080px"
            />
            <div className="absolute inset-0 bg-[#004324]/55" />
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 sm:px-10 py-12 sm:py-16 gap-4 sm:gap-5">
              <p className="text-[#9fe870] text-xs sm:text-sm font-semibold tracking-wide uppercase">
                SigmawealthSolution
              </p>
              <h3 className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight max-w-2xl leading-snug">
                We grow your capital with clear weekly returns
              </h3>
              <p className="text-white/85 text-sm sm:text-base max-w-xl leading-relaxed">
                Invest from ₦100,000, get 25% of your deposit back each week for 4 weeks, and manage everything from your dashboard — card fund, auto-debit, and bank payouts.
              </p>
              <Link
                href="/auth/signup"
                className="mt-2 inline-flex items-center justify-center rounded-xl bg-[#9fe870] text-[#163300] font-bold text-sm sm:text-base px-6 sm:px-8 py-3 hover:bg-[#b6f08e] transition-colors"
              >
                Start investing
              </Link>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </section>
  )
}
