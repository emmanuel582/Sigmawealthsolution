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
            <AnimatedCounter end={100} prefix="$" duration={2} />
            <p className="text-gray-600 mt-4 leading-relaxed text-sm sm:text-base">
              start from $100 — invest up to unlimited
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
            <AnimatedCounter end={50} suffix="%" duration={2} />
            <p className="text-gray-600 mt-4 leading-relaxed text-sm sm:text-base">
              of your return paid within the first 2 weeks
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
            <AnimatedCounter end={1} suffix=" month" duration={1.5} />
            <p className="text-gray-600 mt-4 leading-relaxed text-sm sm:text-base">
              complete return of investment by month end
            </p>
          </motion.div>
        </div>

        <div className="mt-12 sm:mt-16 flex justify-center">
          <div className="w-full max-w-6xl">
            <video className="w-full h-auto rounded-2xl shadow-lg" controls preload="metadata">
              <source src="/Top SaaS Marketing Video Example _ NeuraFlow.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </section>
  )
}
