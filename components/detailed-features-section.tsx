"use client"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface CounterProps {
  end: number
  duration?: number
  suffix?: string
}

function AnimatedCounter({ end, duration = 2, suffix = "" }: CounterProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
      
      // Easing function for smooth animation
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
      <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#004324]">
        {count.toLocaleString()}{suffix}
      </span>
    </motion.div>
  )
}

export function DetailedFeaturesSection() {
  return (
    <section className="w-full py-16 md:py-24 bg-[#fafafa]">
      {/* Container aligned with other sections */}
      <div className="w-[95%] max-w-[1080px] mx-auto px-8">
        
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight mb-6 text-black">
            Designed for the real needs of content creators worldwide.
          </h2>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 relative">
          
          {/* Stat 1: AI-Powered Predictions */}
          <motion.div 
            className="text-center relative"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div className="mb-4">
              <p className="text-lg font-semibold text-black mb-2">AI-Powered Predictions</p>
            </div>
            <AnimatedCounter end={95} suffix="%" duration={2.5} />
            <p className="text-gray-600 mt-4 leading-relaxed">
              accuracy rate for trend predictions before they go viral
            </p>
            {/* Vertical separator - hidden on mobile, shown on md+ */}
            <div className="hidden md:block absolute -right-12 top-1/2 transform -translate-y-1/2 w-px h-32 bg-gray-300"></div>
          </motion.div>

          {/* Stat 2: Content Discovery */}
          <motion.div 
            className="text-center relative"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mb-4">
              <p className="text-lg font-semibold text-black mb-2">Instant Content Discovery</p>
            </div>
            <AnimatedCounter end={24} suffix=" hours" duration={2.5} />
            <p className="text-gray-600 mt-4 leading-relaxed">
              faster trend identification compared to manual research
            </p>
            {/* Vertical separator - hidden on mobile, shown on md+ */}
            <div className="hidden md:block absolute -right-12 top-1/2 transform -translate-y-1/2 w-px h-32 bg-gray-300"></div>
          </motion.div>

          {/* Stat 3: Creator Growth */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="mb-4">
              <p className="text-lg font-semibold text-black mb-2">Creator Growth Boost</p>
            </div>
            <AnimatedCounter end={300} suffix="%" duration={2.5} />
            <p className="text-gray-600 mt-4 leading-relaxed">
              average engagement increase for creators using our platform
            </p>
          </motion.div>

        </div>

        {/* Video Section */}
        <div className="mt-16 flex justify-center">
          <div className="w-full max-w-6xl">
            <video 
              className="w-full h-auto rounded-2xl shadow-lg"
              controls
              preload="metadata"
            >
              <source src="/Top SaaS Marketing Video Example _ NeuraFlow.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </section>
  )
}
