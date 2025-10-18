"use client"
import { motion } from "framer-motion"
import Image from "next/image"

export function FeaturesSection() {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  return (
    <section className="w-full pt-8 md:pt-12 pb-16 md:pb-24 bg-white">
      {/* Container aligned with navbar and content examples */}
      <div className="w-[95%] max-w-[1080px] mx-auto px-8">
        
        {/* First Row - 2 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Card 1: Get Discovered */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardVariants}
            className="bg-[#fafafa] rounded-2xl p-8 flex flex-col"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-black mb-4">
                Get Discovered with our Youtube SEO tools
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Discover what your viewers are searching for before you hit record. Our SEO tools show you the keywords and topics that will get your videos found and watched by the right people.
              </p>
              <div className="space-y-2 mb-6">
                <p className="text-sm font-medium text-[#004324]">What should I make?</p>
                <p className="text-sm font-medium text-[#004324]">Who is it for?</p>
              </div>
            </div>
            <div className="mt-auto">
              <Image
                src="/images/content-example-1.jpeg"
                alt="YouTube SEO tools interface"
                width={400}
                height={200}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          </motion.div>

          {/* Card 2: Make Content Impossible to Ignore */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardVariants}
            className="bg-[#fafafa] rounded-2xl p-8 flex flex-col"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-black mb-4">
                Make Your Content Impossible to Ignore
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Whether you're deep in editing or refining titles and thumbnails, this is where creativity meets precision. Nail the details that make your content stand out and get more clicks.
              </p>
              <p className="text-sm font-medium text-[#004324] mb-6">
                How do I bring this idea to life and make it click?
              </p>
            </div>
            <div className="mt-auto">
              <Image
                src="/images/content-example-2.jpeg"
                alt="Content creation tools"
                width={400}
                height={200}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          </motion.div>
        </div>

        {/* Second Row - 1 Long Card */}
        <div className="mb-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardVariants}
            className="bg-[#fafafa] rounded-2xl p-8"
          >
            <div className="flex flex-col lg:flex-row items-start gap-8">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-black mb-4">
                  Focus on creating, not managing
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Handle the repetitive stuff in minutes, not hours. Our productivity tools streamline your workflow so you spend more time making videos and less time managing your channel.
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#004324]">Where should I take it next?</p>
                  <p className="text-sm font-medium text-[#004324]">How is it doing?</p>
                </div>
              </div>
              <div className="w-full lg:w-96">
                <Image
                  src="/images/content-example-3.jpeg"
                  alt="Productivity tools dashboard"
                  width={400}
                  height={250}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Third Row - 2 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 4: Refine, Grow, and Repeat */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardVariants}
            className="bg-[#fafafa] rounded-2xl p-8 flex flex-col"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-black mb-4">
                Refine, Grow, and Repeat
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                See exactly which content drives views, subscribers, and revenue. Our strategy tools reveal the patterns behind your niche and top content so you can create more of what your audience loves.
              </p>
              <p className="text-sm font-medium text-[#004324] mb-6">
                How do I evolve and scale?
              </p>
            </div>
            <div className="mt-auto">
              <Image
                src="/images/case-study-1.jpeg"
                alt="Analytics and growth tools"
                width={400}
                height={200}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          </motion.div>

          {/* Card 5: Trend Prediction */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardVariants}
            className="bg-[#fafafa] rounded-2xl p-8 flex flex-col"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-black mb-4">
                Predict Trends Before They Blow Up
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Stay ahead of the curve with AI-powered trend prediction. Discover what's about to go viral before your competitors even know it exists.
              </p>
              <p className="text-sm font-medium text-[#004324] mb-6">
                What's trending next?
              </p>
            </div>
            <div className="mt-auto">
              <Image
                src="/images/case-study-2.jpeg"
                alt="Trend prediction dashboard"
                width={400}
                height={200}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
