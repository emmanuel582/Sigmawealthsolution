"use client"
import { motion } from "framer-motion"
import Image from "next/image"

export function FeaturesSection() {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  return (
    <section id="how-it-works" className="w-full pt-8 md:pt-12 pb-12 sm:pb-16 md:pb-24 bg-[#f0f2f4] scroll-mt-24">
      <div className="w-[95%] max-w-[1080px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardVariants}
            className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col"
          >
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-black mb-4">
                Phase 1 — Open your investment
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Create your SigmawealthSolution account, choose your amount (from $100 upward), and fund with Paystack debit card, auto-debit, or Opay transfer.
              </p>
              <div className="space-y-2 mb-6">
                <p className="text-sm font-medium text-[#004324]">How much can I invest?</p>
                <p className="text-sm font-medium text-[#004324]">How do I fund my account?</p>
              </div>
            </div>
            <div className="mt-auto">
              <Image
                src="/images/content-example-1.jpeg"
                alt="Open an investment"
                width={400}
                height={200}
                className="w-full h-40 sm:h-48 object-cover rounded-lg"
              />
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardVariants}
            className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col"
          >
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-black mb-4">
                Phase 2 — First payout in 2 weeks
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                At the half-month mark, you receive 50% of your return. Track your next payment date and total invested from your investor dashboard.
              </p>
              <p className="text-sm font-medium text-[#004324] mb-6">
                When is my first payout?
              </p>
            </div>
            <div className="mt-auto">
              <Image
                src="/images/content-example-2.jpeg"
                alt="First investment payout"
                width={400}
                height={200}
                className="w-full h-40 sm:h-48 object-cover rounded-lg"
              />
            </div>
          </motion.div>
        </div>

        <div className="mb-6 sm:mb-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardVariants}
            className="bg-white rounded-2xl p-6 sm:p-8"
          >
            <div className="flex flex-col lg:flex-row items-start gap-6 sm:gap-8">
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-black mb-4">
                  Phase 3 — Full return by month end
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  At the end of the month you receive the remaining 50% — completing your full return of investment. Then reinvest, adjust auto-debit, or take a one-time deposit.
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#004324]">What happens at month end?</p>
                  <p className="text-sm font-medium text-[#004324]">Can I reinvest automatically?</p>
                </div>
              </div>
              <div className="w-full lg:w-96">
                <Image
                  src="/images/content-example-3.jpeg"
                  alt="Full monthly investment return"
                  width={400}
                  height={250}
                  className="w-full h-48 sm:h-64 object-cover rounded-lg"
                />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardVariants}
            className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col"
          >
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-black mb-4">
                Auto-debit or one-time pay
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Set a monthly auto-investment amount, or pay once whenever you are ready. Your debit card stays secure through Paystack.
              </p>
              <p className="text-sm font-medium text-[#004324] mb-6">
                Which payment option is right for me?
              </p>
            </div>
            <div className="mt-auto">
              <Image
                src="/images/case-study-1.jpeg"
                alt="Investment payment options"
                width={400}
                height={200}
                className="w-full h-40 sm:h-48 object-cover rounded-lg"
              />
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardVariants}
            className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col"
          >
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-black mb-4">
                Clear terms & full control
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Review terms and conditions before you invest. Monitor every deposit and payout, and manage your plan from a simple investor portal.
              </p>
              <p className="text-sm font-medium text-[#004324] mb-6">
                Where can I read the terms?
              </p>
            </div>
            <div className="mt-auto">
              <Image
                src="/images/case-study-2.jpeg"
                alt="Investment terms and control"
                width={400}
                height={200}
                className="w-full h-40 sm:h-48 object-cover rounded-lg"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
