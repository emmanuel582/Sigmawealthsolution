"use client"
import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > window.innerHeight) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-[5.75rem] right-5 z-[45] w-12 h-12 bg-white/90 backdrop-blur-md border border-[#004324]/15 hover:border-[#004324]/35 text-[#004324] rounded-xl shadow-[0_8px_24px_rgba(0,67,36,0.12)] hover:shadow-[0_10px_28px_rgba(0,67,36,0.18)] transition-all duration-200 flex items-center justify-center group cursor-pointer"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6 text-[#004324] group-hover:scale-110 transition-transform duration-200" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
