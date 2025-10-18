"use client"
import Image from "next/image"
import { motion } from "framer-motion"
import { useDropdown } from "../contexts/DropdownContext"
import Link from "next/link"

export function HeroSection() {
  const { isFeaturesOpen } = useDropdown();

  return (
    <motion.section 
      className="relative w-full h-[calc(100vh-84px)] flex items-center justify-center overflow-hidden"
      animate={{
        scale: isFeaturesOpen ? 0.95 : 1,
        filter: isFeaturesOpen ? 'blur(4px)' : 'blur(0px)',
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut"
      }}
    >
      {/* Background Image */}
      <Image
        src="/images/finance-management-hero-bg-scaled.png"
        alt="Finance Management Hero Background"
        fill
        style={{ objectFit: 'cover' }}
        quality={100}
        className="absolute inset-0 z-0"
      />
      
      {/* Content Container */}
      <div className="relative z-10 w-[95%] max-w-[1080px] mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="text-black">The ultimate</span>
              <br />
              <span className="text-black">trend discovery</span>
              <br />
              <span className="text-[#004324]">platform</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg sm:text-xl text-black/90 mb-8 max-w-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Whether you're starting out or scaling up, NexTrend gives you the insights and automation to discover viral trends and create content your audience truly loves.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link href="/auth/signup">
                <button className="bg-[#303030] hover:bg-[#004324] text-white font-semibold px-6 py-3 rounded-2xl text-base transition-all duration-200 transform hover:translate-y-1 shadow-[0_6px_0_#000000] hover:shadow-[0_4px_0_#000000] active:translate-y-2 active:shadow-[0_2px_0_#000000]">
                  Explore Features
                </button>
              </Link>
            </motion.div>
          </div>
          
          {/* Right Image */}
          <motion.div 
            className="relative flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="relative w-full max-w-lg">
              <Image
                src="/images/banner_rt_img.webp"
                alt="NexTrend Platform Dashboard"
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
