"use client"
import Image from "next/image"
import { motion } from "framer-motion"
import { useState, useEffect, useCallback } from "react"

export function CaseStudies() {
  const [activeTab, setActiveTab] = useState(0)

  const caseStudies = [
    {
      company: "Tunde A.",
      quote: "I started with just $100 and within a month I got my full return — half came in two weeks. SigmawealthSolution made investing simple and transparent for me.",
      description: "First-time Investor — Monthly Returns",
      image: "/images/case-study-1.jpeg",
      link: "Read full story"
    },
    {
      company: "Chioma E.",
      quote: "The monthly auto-debit feature makes everything seamless. I don't even have to think about it — my investment grows on its own every month.",
      description: "Recurring Investor — Monthly Auto-Debit",
      image: "/images/case-study-2.jpeg",
      link: "Read full story"
    },
    {
      company: "Emeka O.",
      quote: "I was skeptical at first, but receiving 50% of my returns within two weeks proved this platform is legit. I've now invested over $5,000.",
      description: "Scaled Investor — Growing Portfolio",
      image: "/images/review-emeka.jpeg",
      link: "Read full story"
    },
    {
      company: "Aisha M.",
      quote: "The investor dashboard shows everything clearly — my total investment, next payout date, and transaction history. It's professional and easy to navigate.",
      description: "Dashboard User — Full Transparency",
      image: "/images/review-aisha.jpeg",
      link: "Read full story"
    },
    {
      company: "David K.",
      quote: "Paying through Opay was super easy. Within minutes my investment was confirmed. Now I get consistent monthly returns without any stress.",
      description: "Opay Investor — Quick Funding",
      image: "/images/review-david.jpeg",
      link: "Read full story"
    },
    {
      company: "Funke B.",
      quote: "I recommend SigmawealthSolution to all my friends. The split payout system — 50% early, 50% at month end — gives me cash flow I can actually plan with.",
      description: "Referral Advocate — Split Payout Benefits",
      image: "/images/review-funke.jpeg",
      link: "Read full story"
    }
  ]

  const nextSlide = useCallback(() => {
    setActiveTab((prev) => (prev + 1) % caseStudies.length)
  }, [caseStudies.length])

  // Auto-advance disabled on phone/mobile screens
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return
    }
    const timer = setInterval(nextSlide, 6000)
    return () => clearInterval(timer)
  }, [nextSlide])

  return (
    <section id="testimonials" className="w-full py-12 sm:py-16 md:py-24 bg-[#f0f2f4] scroll-mt-24">
      {/* Section Header */}
      <div className="w-[95%] max-w-[1080px] mx-auto px-4 sm:px-6 md:px-8 mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-center mb-3 sm:mb-4">
          <span className="text-black">What Our </span>
          <span className="text-[#004324]">Investors</span>
          <span className="text-black"> Say</span>
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 text-center max-w-2xl mx-auto">
          Real stories from real investors who trust SigmawealthSolution with their money.
        </p>
      </div>

      {/* Tab Navigation - Centered names on all devices */}
      <div className="mb-8 sm:mb-12 max-w-[1080px] mx-auto px-4">
        <div className="relative">
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 md:gap-8 lg:gap-10 mb-3 px-2">
            {caseStudies.map((study, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`text-xs sm:text-sm md:text-base font-semibold transition-colors duration-200 pb-2 relative whitespace-nowrap ${
                  activeTab === index 
                    ? 'text-[#004324] font-bold' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {study.company}
                {activeTab === index && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#004324]"
                    layoutId="activeCaseTab"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
          <div className="mx-auto max-w-2xl h-px bg-gray-200/80"></div>
        </div>
      </div>

      {/* Content Container */}
      <div className="w-[95%] max-w-[1080px] mx-auto px-4 sm:px-6 md:px-8">
        <div>
          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-200/70 shadow-sm"
          >
            {/* Image */}
            <div className="relative order-2 lg:order-1">
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-green-50 to-green-100 aspect-[4/3] flex items-center justify-center">
                <Image
                  src={caseStudies[activeTab].image}
                  alt={caseStudies[activeTab].company}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 sm:space-y-6 order-1 lg:order-2 flex flex-col justify-center">
              <div>
                <blockquote className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-black leading-relaxed mb-4 sm:mb-6">
                  &ldquo;{caseStudies[activeTab].quote}&rdquo;
                </blockquote>
                <div className="text-[#004324] font-semibold text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
                  {caseStudies[activeTab].description}
                </div>
                <button className="text-[#004324] font-medium hover:underline transition-all duration-200 flex items-center gap-2 text-xs sm:text-sm md:text-base">
                  {caseStudies[activeTab].link}
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-6 sm:mt-8">
          {caseStudies.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                activeTab === index
                  ? 'bg-[#004324] w-6 sm:w-8'
                  : 'bg-gray-300 hover:bg-gray-400 w-2 sm:w-2.5'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
