"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
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

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f4]">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-[#0d1a12] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(159,232,112,0.12),_transparent_55%)]" />
          <div className="relative w-[95%] max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24">
            <p className="text-[#9fe870] text-sm font-semibold tracking-wide mb-3">About us</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight max-w-2xl">
              About SigmawealthSolution
            </h1>
            <p className="mt-4 text-white/65 text-base sm:text-lg max-w-xl leading-relaxed">
              We help people grow wealth with clear monthly returns — from $100 to unlimited.
            </p>
          </div>
        </section>

        <section className="py-10 sm:py-14 md:py-16">
          <div className="w-[95%] max-w-4xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-5">
            <motion.article
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-[#163300] text-white p-6 sm:p-8 shadow-lg border border-white/5"
            >
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-4">Mission</h2>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base mb-4">
                Our mission is to create a new generation of investment opportunities by connecting investors with
                high-growth strategies across the world&apos;s most dynamic financial markets. Through active market
                participation, innovative approaches, and investor engagement, we aim to transform market volatility into
                opportunities for growth.
              </p>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                We believe investors deserve access to opportunities traditionally reserved for sophisticated market
                participants — made simple, transparent, and accessible.
              </p>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-[#163300] text-white p-6 sm:p-8 shadow-lg border border-white/5"
            >
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-4">Vision</h2>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base mb-4">
                Our vision is to become a leading global investment platform, recognized for innovation, accessibility,
                and exceptional investor experiences.
              </p>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base mb-5">
                We envision a future in which individuals from all backgrounds can participate in dynamic financial
                markets and pursue meaningful wealth creation through a modern digital investment ecosystem.
              </p>
              <p className="text-sm sm:text-base">
                <span className="font-bold text-[#9fe870]">Our philosophy:</span>{" "}
                <em className="text-white/75">
                  &ldquo;Where market volatility becomes opportunity, and opportunity becomes growth.&rdquo;
                </em>
              </p>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-white border border-[#163300]/10 p-6 sm:p-8 shadow-sm"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#163300] mb-4">How investing works</h2>
              <ul className="space-y-3">
                {[
                  "Minimum investment: $100 (unlimited maximum)",
                  "Full return of investment within one month",
                  "50% paid at two weeks · 50% paid at month end",
                  "Fund via Flutterwave debit card, monthly auto-debit, or Opay transfer",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm sm:text-base text-[#163300]/75 leading-relaxed">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#004324] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.article>

            <div className="pt-6 sm:pt-8">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center text-[#163300] mb-8">
                Our Team
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                {teamMembers.map((member) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center text-center bg-white p-6 rounded-2xl border border-[#163300]/8 shadow-sm"
                  >
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      width={120}
                      height={120}
                      className="rounded-full mb-4 object-cover w-[120px] h-[120px]"
                    />
                    <h3 className="text-xl font-semibold text-[#163300]">{member.name}</h3>
                    <p className="text-[#004324] mb-2 text-sm font-medium">{member.role}</p>
                    <p className="text-[#163300]/65 text-sm leading-relaxed">{member.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
