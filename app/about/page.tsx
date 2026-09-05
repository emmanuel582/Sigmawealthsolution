"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import Image from "next/image"
import { motion } from "framer-motion"

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Darasimi",
      role: "Product & Investment Systems",
      description:
        "Leads product vision, investment workflows, payout automation, and the systems that keep investor returns on schedule.",
      avatar: "/images/darasimi.jpg",
    },
    {
      name: "Jerry",
      role: "App Developer",
      description:
        "Builds and maintains the investor and admin portals, payment integrations, and a smooth experience across devices.",
      avatar: "/images/jerry.jpg",
    },
    {
      name: "Bismark Enoch",
      role: "UI/UX & Frontend",
      description:
        "Designs and develops the SigmawealthSolution experience so investing feels clear, trustworthy, and mobile-friendly.",
      avatar: "/images/enoch.jpg",
    },
  ]

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f4]">
      <Navbar />
      <main className="flex-1">
        <PageHeader
          title="About SigmawealthSolution"
          description="We help people grow wealth with clear monthly returns — from $100 to unlimited."
          imageUrl="/images/about-header.jpeg"
        />

        <motion.section
          className="py-12 md:py-24 lg:py-32 bg-[#f0f2f4] scroll-mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <div className="w-[95%] max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
            <motion.div variants={itemVariants}>
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Our Mission</h2>
                <p className="text-base sm:text-lg text-gray-700">
                  To make investing simple and transparent. With SigmawealthSolution you invest from $100 upward,
                  receive 50% of your return in the first two weeks, and the remaining 50% at month end — a full
                  return cycle every month.
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Who We Serve</h2>
                <ul className="list-disc list-inside text-base sm:text-lg text-gray-700 space-y-2">
                  <li>First-time and growing investors</li>
                  <li>People who want twice-monthly payouts</li>
                  <li>Investors who prefer auto-debit or one-time deposits</li>
                  <li>Anyone seeking a clear, dashboard-driven investment experience</li>
                </ul>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">How Investing Works</h2>
                <ul className="list-disc list-inside text-base sm:text-lg text-gray-700 space-y-2">
                  <li>Minimum investment: $100 (unlimited maximum)</li>
                  <li>Full return of investment within one month</li>
                  <li>50% paid at two weeks · 50% paid at month end</li>
                  <li>Fund via Paystack debit card, monthly auto-debit, or Opay transfer</li>
                </ul>
              </div>
            </motion.div>

            <div className="space-y-8">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center text-gray-900">Our Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={itemVariants}
                  >
                    <div className="flex flex-col items-center text-center bg-gray-50 p-6 rounded-2xl transition-all duration-300 hover:shadow-lg">
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        width={120}
                        height={120}
                        className="rounded-full mb-4 object-cover"
                      />
                      <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-[#004324] mb-2">{member.role}</p>
                      <p className="text-gray-700 text-sm">{member.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  )
}
