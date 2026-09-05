"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { ContentExamples } from "@/components/content-examples"
import { FeaturesSection } from "@/components/features-section"
import { DetailedFeaturesSection } from "@/components/detailed-features-section"
import { CaseStudies } from "@/components/case-studies"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"
import { ScrollToTop } from "@/components/scroll-to-top"
import { motion, type Variants } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"

export default function HomePage() {
  const router = useRouter()
  const { user, role, isLoading } = useAuth()

  // Signed-in users skip marketing and go straight to the app
  useEffect(() => {
    if (isLoading || !user) return
    router.replace(role === "admin" ? "/admin" : "/dashboard")
  }, [user, role, isLoading, router])

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0.0, 0.2, 1] } },
  }

  if (isLoading || user) {
    return (
      <div className="min-h-screen bg-[#edefeb] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#163300] border-t-[#9fe870] rounded-full animate-spin" />
        <span className="text-xs font-semibold text-[#163300]/60">
          {user ? "Opening your app…" : "Loading…"}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f4]">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <ContentExamples />
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <FeaturesSection />
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <DetailedFeaturesSection />
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <CaseStudies />
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <FAQSection />
        </motion.div>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
