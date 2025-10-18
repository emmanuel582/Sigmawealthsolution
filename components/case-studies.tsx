"use client"
import Image from "next/image"
import { motion } from "framer-motion"
import { useState } from "react"

export function CaseStudies() {
  const [activeTab, setActiveTab] = useState(0)

  const companies = [
    { name: "Nufi Agro", shortName: "Nufi" },
    { name: "Tad Farms", shortName: "Tad" },
    { name: "Pacific Holdings", shortName: "Pacific" },
    { name: "DMX Logistics", shortName: "DMX" },
    { name: "Denimmuse", shortName: "Denim" },
    { name: "Maffa Couture", shortName: "Maffa" }
  ]

  const caseStudies = [
    {
      company: "Nufi Agro",
      quote: "NexTrend's trend analysis helped us create viral agricultural content that reached 2M+ farmers. Our educational videos now drive real farming innovation.",
      description: "Agricultural Content Creator - Educational Videos",
      image: "/images/case-study-1.jpeg",
      link: "Read study case"
    },
    {
      company: "Tad Farms",
      quote: "Using NexTrend's keyword insights, we grew from 10K to 500K followers in 6 months. Our sustainable farming content is now trending globally.",
      description: "Sustainable Farming Influencer - Social Media Growth",
      image: "/images/case-study-2.jpeg",
      link: "Read study case"
    },
    {
      company: "Pacific Holdings",
      quote: "NexTrend predicted the finance education trend before it exploded. Our investment tutorials now get 1M+ views per video.",
      description: "Financial Education Creator - Investment Content",
      image: "/images/content-example-1.jpeg",
      link: "Read study case"
    },
    {
      company: "DMX Logistics",
      quote: "Our behind-the-scenes logistics content went viral thanks to NexTrend's trend predictions. We've built a community of 800K logistics enthusiasts.",
      description: "Logistics Content Creator - Behind-the-Scenes Videos",
      image: "/images/content-example-2.jpeg",
      link: "Read study case"
    },
    {
      company: "Denimmuse",
      quote: "NexTrend's fashion trend forecasting helped us create content that consistently hits 100K+ views. Our styling videos are always ahead of the curve.",
      description: "Fashion Content Creator - Styling & Trends",
      image: "/images/content-example-3.jpeg",
      link: "Read study case"
    },
    {
      company: "Maffa Couture",
      quote: "Our audience can now browse and buy elegantly. NexTrend brought our African couture content to global audiences with 5M+ reach.",
      description: "Fashion E-commerce Creator - African Couture Content",
      image: "/images/banner_rt_img.webp",
      link: "Read study case"
    }
  ]

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      {/* Tab Navigation - Full width, can extend beyond navbar margins */}
      <div className="mb-12">
        <div className="relative">
          <div className="flex justify-center gap-6 md:gap-8 lg:gap-12 mb-2 px-4">
            {companies.map((company, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`text-xs md:text-sm font-medium transition-colors duration-200 pb-2 relative whitespace-nowrap ${
                  activeTab === index 
                    ? 'text-black' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {company.name}
                {/* Active tab indicator line - positioned directly under each tab */}
                {activeTab === index && (
                  <motion.div
                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#004324]"
                    layoutId="activeTab"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
          
          {/* Tab separator line - With padding */}
          <div className="mx-4 h-px bg-[#fafafa]"></div>
        </div>
      </div>

      {/* Content Container - Aligned with other sections */}
      <div className="w-[95%] max-w-[1080px] mx-auto px-8">

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
        >
          {/* Left side - Image */}
          <div className="relative order-2 lg:order-1">
            <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 aspect-[4/3] flex items-center justify-center">
              <Image
                src={caseStudies[activeTab].image}
                alt={caseStudies[activeTab].company}
                width={400}
                height={300}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right side - Content */}
          <div className="space-y-6 order-1 lg:order-2">
            <div>
              <blockquote className="text-xl md:text-2xl lg:text-3xl font-medium text-black leading-relaxed mb-6">
                "{caseStudies[activeTab].quote}"
              </blockquote>
              <div className="text-[#004324] font-medium text-sm md:text-base mb-6">
                {caseStudies[activeTab].description}
              </div>
              <button className="text-[#004324] font-medium hover:underline transition-all duration-200 flex items-center gap-2 text-sm md:text-base">
                {caseStudies[activeTab].link}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
