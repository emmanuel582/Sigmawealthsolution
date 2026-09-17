"use client"
import Image from "next/image"
import { motion } from "framer-motion"
import { useState, useEffect, useCallback } from "react"

const NIGERIA = "/images/nigeria"

export function CaseStudies() {
  const [activeTab, setActiveTab] = useState(0)

  // One unique Nigerian portrait each — no repeats
  const caseStudies = [
    {
      company: "Tunde A.",
      quote:
        "I started with ₦100,000 and within a month I got my full return — 25% came every week. SigmawealthSolution made investing simple and transparent for me.",
      description: "First-time Investor — Lagos",
      image: `${NIGERIA}/pexels-ansey-20513318.jpg`,
      link: "Read full story",
    },
    {
      company: "Chioma E.",
      quote:
        "The monthly auto-debit feature makes everything seamless. I don't even have to think about it — my investment grows on its own every month.",
      description: "Recurring Investor — Abuja",
      image: `${NIGERIA}/pexels-praise-nnadozie-1081270006-39462601.jpg`,
      link: "Read full story",
    },
    {
      company: "Emeka O.",
      quote:
        "I was skeptical at first, but receiving 25% every week proved this platform is legit. I've now invested over ₦5,000,000.",
      description: "Scaled Investor — Port Harcourt",
      image: `${NIGERIA}/pexels-dboyag-12477590.jpg`,
      link: "Read full story",
    },
    {
      company: "Olumide",
      quote:
        "The investor dashboard shows everything clearly — my total investment, next payout date, and transaction history. It's professional and easy to navigate.",
      description: "Dashboard User — Kano",
      image: `${NIGERIA}/pexels-anchau-1663967297-34286928.jpg`,
      link: "Read full story",
    },
    {
      company: "Funke B.",
      quote:
        "I recommend SigmawealthSolution to all my friends. The weekly 25% payouts give me cash flow I can actually plan with.",
      description: "Referral Advocate — Ibadan",
      image: `${NIGERIA}/pexels-sadeeq-photography-2154278691-33302107.jpg`,
      link: "Read full story",
    },
  ]

  const nextSlide = useCallback(() => {
    setActiveTab((prev) => (prev + 1) % caseStudies.length)
  }, [caseStudies.length])

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return
    }
    const timer = setInterval(nextSlide, 6000)
    return () => clearInterval(timer)
  }, [nextSlide])

  return (
    <section id="testimonials" className="w-full py-12 sm:py-16 md:py-24 bg-[#f0f2f4] scroll-mt-24">
      <div className="w-[95%] max-w-[1080px] mx-auto px-4 sm:px-6 md:px-8 mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-center mb-3 sm:mb-4">
          <span className="text-black">What Our </span>
          <span className="text-[#004324]">Investors</span>
          <span className="text-black"> Say</span>
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 text-center max-w-2xl mx-auto">
          Real stories from Nigerian investors who trust SigmawealthSolution with their money.
        </p>
      </div>

      <div className="mb-8 sm:mb-12 max-w-[1080px] mx-auto px-4">
        <div className="relative">
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 md:gap-8 lg:gap-10 mb-3 px-2">
            {caseStudies.map((study, index) => (
              <button
                key={study.company}
                onClick={() => setActiveTab(index)}
                className={`text-xs sm:text-sm md:text-base font-semibold transition-colors duration-200 pb-2 relative whitespace-nowrap ${
                  activeTab === index
                    ? "text-[#004324] font-bold"
                    : "text-gray-500 hover:text-gray-800"
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
          <div className="mx-auto max-w-2xl h-px bg-gray-200/80" />
        </div>
      </div>

      <div className="w-[95%] max-w-[1080px] mx-auto px-4 sm:px-6 md:px-8">
        <div>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-200/70 shadow-sm"
          >
            <div className="relative order-2 lg:order-1">
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden bg-[#edefeb] aspect-[4/3] flex items-center justify-center">
                <Image
                  src={caseStudies[activeTab].image}
                  alt={`${caseStudies[activeTab].company} — Nigerian investor`}
                  width={640}
                  height={480}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 order-1 lg:order-2 flex flex-col justify-center">
              <div>
                <blockquote className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-black leading-relaxed mb-4 sm:mb-6">
                  &ldquo;{caseStudies[activeTab].quote}&rdquo;
                </blockquote>
                <div className="text-[#004324] font-semibold text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
                  {caseStudies[activeTab].description}
                </div>
                <button
                  type="button"
                  className="text-[#004324] font-medium hover:underline transition-all duration-200 flex items-center gap-2 text-xs sm:text-sm md:text-base"
                >
                  {caseStudies[activeTab].link}
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex justify-center gap-2 mt-6 sm:mt-8">
          {caseStudies.map((study, index) => (
            <button
              key={study.company}
              type="button"
              onClick={() => setActiveTab(index)}
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                activeTab === index
                  ? "bg-[#004324] w-6 sm:w-8"
                  : "bg-gray-300 hover:bg-gray-400 w-2 sm:w-2.5"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
