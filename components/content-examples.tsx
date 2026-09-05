"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { 
  Wallet, 
  Calendar, 
  CreditCard, 
  BarChart3, 
  ShieldCheck, 
  Landmark,
  Users,
  Gift
} from "lucide-react"

const features = [
  {
    icon: Wallet,
    title: "Start from $100 to Unlimited",
    description: "Invest as little as $100 with zero upper ceiling. Build and scale your investment portfolio on your terms."
  },
  {
    icon: Calendar,
    title: "Twice-Monthly Return Schedule",
    description: "Receive 50% of your returns within the first two weeks, and the remaining 50% at month end without delay."
  },
  {
    icon: CreditCard,
    title: "Seamless Funding & Auto-Debit",
    description: "Fund effortlessly via Paystack debit cards, monthly automated recurring debits, or fast Opay transfers."
  },
  {
    icon: BarChart3,
    title: "Live Portfolio Tracking",
    description: "Monitor your total capital, active investment phase, and next payout schedule in real-time from your dashboard."
  },
  {
    icon: ShieldCheck,
    title: "Bank-Grade Encryption & Safety",
    description: "Every transaction is protected by 256-bit encryption, verified payment webhooks, and strict fraud prevention."
  },
  {
    icon: Landmark,
    title: "Direct Bank Account Payouts",
    description: "Returns are disbursed straight into your verified Nigerian bank account with automated transaction receipts."
  },
  {
    icon: Users,
    title: "Transparent Investor Experience",
    description: "Clear earnings calculations, full transaction history, and 24/7 dedicated support every step of the way."
  },
  {
    icon: Gift,
    title: "10% On Referral",
    description: "Invite your friends and earn an instant 10% commission when they make their first investment."
  }
]

export function ContentExamples() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % features.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length)
  }, [])

  const currentFeature = features[currentIndex]
  const CurrentIcon = currentFeature.icon

  return (
    <section id="investment" className="w-full pt-12 sm:pt-16 md:pt-24 pb-6 sm:pb-8 md:pb-12 bg-[#f0f2f4] scroll-mt-24">
      <div className="w-[95%] max-w-[1080px] mx-auto px-4 sm:px-6 md:px-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
            <span className="text-black">One </span>
            <span className="text-[#004324]">Platform</span>
            <span className="text-black">. Total Financial Growth.</span>
          </h2>
          
          <motion.p 
            className="text-sm sm:text-base md:text-lg lg:text-xl text-black/80 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            SigmawealthSolution provides smart investing tools, guaranteed return timelines, and automated payout systems built for effortless wealth creation.
          </motion.p>
        </motion.div>

        {/* SYSTEM / DESKTOP VIEW: The original grid as it has always been */}
        <motion.div 
          className="hidden md:block mt-14 md:mt-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Top Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Feature 1 */}
            <div className="relative">
              <div className="flex flex-col items-start text-left">
                <div className="w-12 h-12 bg-white border border-gray-200/80 shadow-sm rounded-xl flex items-center justify-center mb-4">
                  <Wallet className="w-6 h-6 text-[#004324]" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  {features[0].title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {features[0].description}
                </p>
              </div>
              <div className="hidden lg:block absolute right-0 top-0 h-full w-px bg-gray-200"></div>
            </div>

            {/* Feature 2 */}
            <div className="relative">
              <div className="flex flex-col items-start text-left">
                <div className="w-12 h-12 bg-white border border-gray-200/80 shadow-sm rounded-xl flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-[#004324]" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  {features[1].title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {features[1].description}
                </p>
              </div>
              <div className="hidden lg:block absolute right-0 top-0 h-full w-px bg-gray-200"></div>
            </div>

            {/* Feature 3 */}
            <div className="relative">
              <div className="flex flex-col items-start text-left">
                <div className="w-12 h-12 bg-white border border-gray-200/80 shadow-sm rounded-xl flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-[#004324]" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  {features[2].title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {features[2].description}
                </p>
              </div>
              <div className="hidden lg:block absolute right-0 top-0 h-full w-px bg-gray-200"></div>
            </div>

            {/* Feature 4 */}
            <div className="relative">
              <div className="flex flex-col items-start text-left">
                <div className="w-12 h-12 bg-white border border-gray-200/80 shadow-sm rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-[#004324]" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  {features[3].title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {features[3].description}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 5 */}
            <div className="relative">
              <div className="flex flex-col items-start text-left">
                <div className="w-12 h-12 bg-white border border-gray-200/80 shadow-sm rounded-xl flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-[#004324]" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  {features[4].title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {features[4].description}
                </p>
              </div>
              <div className="hidden lg:block absolute right-0 top-0 h-full w-px bg-gray-200"></div>
            </div>

            {/* Feature 6 */}
            <div className="relative">
              <div className="flex flex-col items-start text-left">
                <div className="w-12 h-12 bg-white border border-gray-200/80 shadow-sm rounded-xl flex items-center justify-center mb-4">
                  <Landmark className="w-6 h-6 text-[#004324]" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  {features[5].title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {features[5].description}
                </p>
              </div>
              <div className="hidden lg:block absolute right-0 top-0 h-full w-px bg-gray-200"></div>
            </div>

            {/* Feature 7 */}
            <div className="relative">
              <div className="flex flex-col items-start text-left">
                <div className="w-12 h-12 bg-white border border-gray-200/80 shadow-sm rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-[#004324]" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  {features[6].title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {features[6].description}
                </p>
              </div>
              <div className="hidden lg:block absolute right-0 top-0 h-full w-px bg-gray-200"></div>
            </div>

            {/* Feature 8 */}
            <div className="relative">
              <div className="flex flex-col items-start text-left">
                <div className="w-12 h-12 bg-white border border-gray-200/80 shadow-sm rounded-xl flex items-center justify-center mb-4">
                  <Gift className="w-6 h-6 text-[#004324]" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  {features[7].title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {features[7].description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* MOBILE VIEW: Clean carousel with properly fitting controls */}
        <div className="block md:hidden mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-8 text-center shadow-sm min-h-[260px] flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 bg-[#004324]/10 border border-[#004324]/20 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                <CurrentIcon className="w-8 h-8 text-[#004324]" />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">
                {currentFeature.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
                {currentFeature.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-5 px-3">
            <button
              onClick={prevSlide}
              className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm active:scale-95 text-gray-700 hover:text-[#004324] hover:border-[#004324] transition-all duration-200"
              aria-label="Previous feature"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-500">
                {currentIndex + 1} / {features.length}
              </span>
              <div className="flex items-center gap-1.5">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentIndex === index
                        ? 'bg-[#004324] w-6'
                        : 'bg-gray-300 w-2'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={nextSlide}
              className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm active:scale-95 text-gray-700 hover:text-[#004324] hover:border-[#004324] transition-all duration-200"
              aria-label="Next feature"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
