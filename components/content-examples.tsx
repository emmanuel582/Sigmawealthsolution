"use client"
import { motion } from "framer-motion"
import { 
  TrendingUp, 
  BarChart3, 
  Image as ImageIcon, 
  Users, 
  Bell, 
  Sparkles,
  FolderOpen
} from "lucide-react"

export function ContentExamples() {
  return (
    <section className="w-full pt-16 md:pt-24 pb-8 md:pb-12 bg-white">
      {/* Container aligned with navbar */}
      <div className="w-[95%] max-w-[1080px] mx-auto px-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            <span className="text-black">One </span>
            <span className="text-[#004324]">Platform</span>
            <span className="text-black">. Every Tool You Need.</span>
          </h2>
          
          <motion.p 
            className="text-lg md:text-xl text-black/80 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            NexTrend helps you discover faster, create better, and grow smarter with tools for trend analysis, 
            content creation, keyword research, and viral prediction, built for modern content creators.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="mt-16 md:mt-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Discover Viral Outlier Videos */}
            <div className="relative">
              <div className="flex flex-col items-start text-left">
                <div className="w-12 h-12 bg-[#fafafa] border border-[#fafafa] rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  Discover viral Outlier Videos
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Find content that's outperforming related to where it should be (so your videos can do the same).
                </p>
              </div>
              {/* Vertical divider - hidden on mobile, shown on larger screens */}
              <div className="hidden lg:block absolute right-0 top-0 h-full w-px bg-gray-200"></div>
            </div>

            {/* Research Channel and Video Performance */}
            <div className="relative">
              <div className="flex flex-col items-start text-left">
                <div className="w-12 h-12 bg-[#fafafa] border border-[#fafafa] rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  Research Channel and Video Performance
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Find what drives growth and views with Analytics.
                </p>
              </div>
              {/* Vertical divider */}
              <div className="hidden lg:block absolute right-0 top-0 h-full w-px bg-gray-200"></div>
            </div>

            {/* Analyze Top-Performing Thumbnails */}
            <div className="relative">
              <div className="flex flex-col items-start text-left">
                <div className="w-12 h-12 bg-[#fafafa] border border-[#fafafa] rounded-lg flex items-center justify-center mb-4">
                  <ImageIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  Analyze top-performing thumbnails
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Find what thumbnail styles get clicks in your niche in minutes, not hours.
                </p>
              </div>
              {/* Vertical divider */}
              <div className="hidden lg:block absolute right-0 top-0 h-full w-px bg-gray-200"></div>
            </div>

            {/* Keep up with Competitors */}
            <div className="relative">
              <div className="flex flex-col items-start text-left">
                <div className="w-12 h-12 bg-[#fafafa] border border-[#fafafa] rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  Keep up with your Competitors' channels
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Track what's working for other creators in your niche.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Never Miss a Beat with Alerts */}
            <div className="relative">
              <div className="flex flex-col items-start text-left">
                <div className="w-12 h-12 bg-[#fafafa] border border-[#fafafa] rounded-lg flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  Never miss a beat with Alerts
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Be the first to know when trends emerge in your niche.
                </p>
              </div>
              {/* Vertical divider */}
              <div className="hidden lg:block absolute right-0 top-0 h-full w-px bg-gray-200"></div>
            </div>

            {/* AI Thumbnails Preview */}
            <div className="relative">
              <div className="flex flex-col items-start text-left">
                <div className="w-12 h-12 bg-[#fafafa] border border-[#fafafa] rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  AI Thumbnails Preview
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Find what gets clicks in your niche with Thumbnail Search.
                </p>
              </div>
              {/* Vertical divider */}
              <div className="hidden lg:block absolute right-0 top-0 h-full w-px bg-gray-200"></div>
            </div>

            {/* Build Inspiration and Research Boards */}
            <div className="relative">
              <div className="flex flex-col items-start text-left">
                <div className="w-12 h-12 bg-[#fafafa] border border-[#fafafa] rounded-lg flex items-center justify-center mb-4">
                  <FolderOpen className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  Build inspiration and Research Boards
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Stay organized with Collections.
                </p>
              </div>
              {/* Vertical divider */}
              <div className="hidden lg:block absolute right-0 top-0 h-full w-px bg-gray-200"></div>
            </div>

            {/* Empty column for alignment */}
            <div className="relative hidden lg:block">
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
