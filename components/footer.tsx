import Link from "next/link"
import { Instagram, Linkedin, Facebook } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-white py-12 md:py-16">
      <div className="w-[95%] max-w-[1080px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo and Description */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3" prefetch={false}>
              <div className="w-12 h-12 rounded-full border-[3px] border-[#004324] flex items-center justify-center bg-transparent">
                <span className="text-2xl font-black text-[#004324]">N</span>
              </div>
              <h1 className="text-[#004324] text-xl font-black tracking-wide">NEXTREND</h1>
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
              One Platform Every Tool You Need. NexTrend helps you discover trends faster, create better content, and scale smarter — with tools for trend analysis, content creation, and audience insights, built for creators and brands.
            </p>
            <div className="flex gap-3">
              <Link href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors" prefetch={false}>
                <Instagram className="h-5 w-5 text-gray-600" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors" prefetch={false}>
                <Linkedin className="h-5 w-5 text-gray-600" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors" prefetch={false}>
                <Facebook className="h-5 w-5 text-gray-600" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-black text-sm">Quick Links</h3>
            <nav className="space-y-3">
              <Link href="/" className="text-sm text-gray-600 hover:text-[#004324] transition-colors block" prefetch={false}>
                Home
              </Link>
              <Link href="/features" className="text-sm text-gray-600 hover:text-[#004324] transition-colors block" prefetch={false}>
                Features
              </Link>
              <Link href="/pricing" className="text-sm text-gray-600 hover:text-[#004324] transition-colors block" prefetch={false}>
                Plans & Pricing
              </Link>
            </nav>
          </div>

          {/* Lagos Address */}
          <div className="space-y-4">
            <h3 className="font-semibold text-black text-sm">Lagos Address</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>NexTrend Technologies Limited</p>
              <p>Office 10 Ikeja,<br />Modern Market<br />Lagos,<br />Nigeria.</p>
              <p>+234 812 384 3076</p>
              <div className="pt-2">
                <p className="font-medium text-black">Ogbomosho Office</p>
                <p className="mt-1">NEXTREND TECHNOLOGIES INC.</p>
                <p>Lautech Nigeria</p>
              </div>
            </div>
          </div>

          {/* Resources & Company */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-black text-sm">Resources</h3>
              <nav className="space-y-3">
                <Link href="/help" className="text-sm text-gray-600 hover:text-[#004324] transition-colors block" prefetch={false}>
                  Help Center
                </Link>
                <Link href="/how-it-works" className="text-sm text-gray-600 hover:text-[#004324] transition-colors block" prefetch={false}>
                  How It Works
                </Link>
                <Link href="/business" className="text-sm text-gray-600 hover:text-[#004324] transition-colors block" prefetch={false}>
                  Business
                </Link>
              </nav>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-black text-sm">Company</h3>
              <nav className="space-y-3">
                <Link href="/about" className="text-sm text-gray-600 hover:text-[#004324] transition-colors block" prefetch={false}>
                  About Us
                </Link>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-[#004324] transition-colors block" prefetch={false}>
                  Contact Us
                </Link>
                <Link href="/careers" className="text-sm text-gray-600 hover:text-[#004324] transition-colors block" prefetch={false}>
                  Careers
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200 gap-4">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <Link href="/terms" className="hover:text-[#004324] transition-colors" prefetch={false}>
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-[#004324] transition-colors" prefetch={false}>
              Privacy Policy
            </Link>
            <Link href="/legal" className="hover:text-[#004324] transition-colors" prefetch={false}>
              Legal Notice
            </Link>
            <Link href="/cookies" className="hover:text-[#004324] transition-colors" prefetch={false}>
              Cookie Setting
            </Link>
          </div>
          <p className="text-sm text-gray-600">© 2025 – NEXTREND TECHNOLOGIES LIMITED.</p>
        </div>
      </div>
    </footer>
  )
}
