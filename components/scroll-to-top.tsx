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
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-[#fafafa] border border-gray-300 hover:border-gray-400 text-green-700 rounded-md shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center group"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6 text-green-700 group-hover:scale-110 transition-transform duration-200" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
