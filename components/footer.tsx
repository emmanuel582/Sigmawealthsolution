import Link from "next/link"
import { Instagram, Linkedin, Facebook, Twitter } from "lucide-react"
import { BrandLogo } from "@/components/BrandLogo"

export function Footer() {
  return (
    <footer className="bg-[#2a2e33] md:bg-white text-white md:text-gray-900 py-12 sm:py-14 md:py-20 md:border-t md:border-gray-200">
      <div className="w-[95%] max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Desktop & Mobile Main Content */}
        <div className="flex flex-col md:flex-row md:justify-between md:gap-16 mb-10 sm:mb-12 md:mb-16">
          
          {/* Brand Column */}
          <div className="md:w-1/3 lg:w-1/4 mb-10 md:mb-0">
            <Link href="/" className="flex items-center gap-2.5 mb-4 md:mb-6" prefetch={false}>
              <BrandLogo size={40} className="rounded-xl shrink-0" />
              <span className="text-lg sm:text-xl font-bold tracking-tight md:text-gray-900 text-white">sigmawealth</span>
            </Link>
            
            {/* Mobile description */}
            <p className="text-sm text-white/60 mt-3 max-w-[220px] leading-snug md:hidden">
              The better way to grow and invest.
            </p>
            
            {/* Desktop description */}
            <p className="hidden md:block text-sm text-gray-500 mt-5 leading-relaxed mb-8 pr-4">
              One Platform Every Tool You Need. Sigmawealth helps you discover trends faster, create better content, and scale smarter — with tools for trend analysis, content creation, and audience insights, built for creators and brands.
            </p>
            
            {/* Socials - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="#" className="text-gray-400 hover:text-gray-900 transition-colors bg-gray-100 p-2.5 rounded-full" aria-label="Instagram" prefetch={false}>
                <Instagram className="h-4 w-4" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-gray-900 transition-colors bg-gray-100 p-2.5 rounded-full" aria-label="LinkedIn" prefetch={false}>
                <Linkedin className="h-4 w-4" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-gray-900 transition-colors bg-gray-100 p-2.5 rounded-full" aria-label="Facebook" prefetch={false}>
                <Facebook className="h-4 w-4" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-gray-900 transition-colors bg-gray-100 p-2.5 rounded-full" aria-label="Twitter" prefetch={false}>
                <Twitter className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10 md:gap-x-12 md:flex-1">
            
            {/* Mobile Column 1 (Products & Company) | Desktop Column 1 (Products/Quick Links) */}
            <div className="space-y-10 md:space-y-0">
              <div>
                <h3 className="text-sm font-semibold text-white md:text-gray-900 mb-4 md:mb-6">Products</h3>
                <nav className="space-y-3 md:space-y-4">
                  <Link href="/#investment" className="block text-sm text-white/55 md:text-gray-500 hover:text-white md:hover:text-[#004324] transition-colors" prefetch={false}>Invest from $100</Link>
                  <Link href="/#returns" className="block text-sm text-white/55 md:text-gray-500 hover:text-white md:hover:text-[#004324] transition-colors" prefetch={false}>Twice-monthly payouts</Link>
                  <Link href="/#how-it-works" className="block text-sm text-white/55 md:text-gray-500 hover:text-white md:hover:text-[#004324] transition-colors" prefetch={false}>Auto-debit</Link>
                  <Link href="/#how-it-works" className="block text-sm text-white/55 md:text-gray-500 hover:text-white md:hover:text-[#004324] transition-colors" prefetch={false}>One-time deposits</Link>
                  <Link href="/dashboard" className="block text-sm text-white/55 md:text-gray-500 hover:text-white md:hover:text-[#004324] transition-colors" prefetch={false}>Investor dashboard</Link>
                </nav>
              </div>
              
              {/* Mobile Only: Company */}
              <div className="md:hidden">
                <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
                <nav className="space-y-3">
                  <Link href="/about" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>About</Link>
                  <Link href="/contact" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>Contact</Link>
                  <Link href="/#testimonials" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>Testimonials</Link>
                  <Link href="/auth/signup" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>Get Started</Link>
                </nav>
              </div>
            </div>

            {/* Mobile Column 2 (Resources & Legal) | Desktop Column 2 (Addresses) */}
            <div className="space-y-10 md:space-y-10">
              
              {/* Desktop Only: Addresses */}
              <div className="hidden md:block">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 md:mb-6">Contact</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Adetipe Adesanmi<br/><br/>
                  Harmony Gold estate olonde<br/>
                  Lagos, Nigeria.<br/><br/>
                  <a href="tel:+358465560087" className="hover:text-[#004324] transition-colors">+358 46 5560087</a>
                </p>
              </div>
              <div className="hidden md:block">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 md:mb-6">Support</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Email:{' '}
                  <a href="mailto:hello@sigmawealthsolution.com" className="hover:text-[#004324] transition-colors">
                    hello@sigmawealthsolution.com
                  </a>
                  <br/><br/>
                  Live chat available on the website.
                </p>
              </div>

              {/* Mobile Only: Resources */}
              <div className="md:hidden">
                <h3 className="text-sm font-semibold text-white mb-4">Resources</h3>
                <nav className="space-y-3">
                  <Link href="/#how-it-works" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>How It Works</Link>
                  <Link href="/#returns" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>Returns</Link>
                  <Link href="/#investment" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>Payment options</Link>
                  <Link href="/contact" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>Support</Link>
                </nav>
              </div>

              {/* Mobile Only: Legal */}
              <div className="md:hidden">
                <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
                <nav className="space-y-3">
                  <Link href="/privacy" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>Privacy</Link>
                  <Link href="/terms" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>Terms</Link>
                  <Link href="/terms" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>Security</Link>
                </nav>
              </div>
            </div>

            {/* Desktop Only: Column 3 (Resources & Company) */}
            <div className="hidden md:flex md:flex-col md:gap-10">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 md:mb-6">Resources</h3>
                <nav className="space-y-3 md:space-y-4">
                  <Link href="/contact" className="block text-sm text-gray-500 hover:text-[#004324] transition-colors" prefetch={false}>Help Center</Link>
                  <Link href="/#how-it-works" className="block text-sm text-gray-500 hover:text-[#004324] transition-colors" prefetch={false}>How It Works</Link>
                  <Link href="/#investment" className="block text-sm text-gray-500 hover:text-[#004324] transition-colors" prefetch={false}>Business</Link>
                </nav>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 md:mb-6">Company</h3>
                <nav className="space-y-3 md:space-y-4">
                  <Link href="/about" className="block text-sm text-gray-500 hover:text-[#004324] transition-colors" prefetch={false}>About Us</Link>
                  <Link href="/contact" className="block text-sm text-gray-500 hover:text-[#004324] transition-colors" prefetch={false}>Contact Us</Link>
                  <Link href="/contact" className="block text-sm text-gray-500 hover:text-[#004324] transition-colors" prefetch={false}>Careers</Link>
                </nav>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-2 md:pt-8 md:border-t md:border-gray-200 flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-6">
          
          {/* Mobile Only: Socials & Address */}
          <div className="flex md:hidden items-center gap-4 mb-5">
            <Link href="#" className="text-white/55 hover:text-white transition-colors" aria-label="Facebook" prefetch={false}><Facebook className="h-5 w-5" /></Link>
            <Link href="#" className="text-white/55 hover:text-white transition-colors" aria-label="Instagram" prefetch={false}><Instagram className="h-5 w-5" /></Link>
            <Link href="#" className="text-white/55 hover:text-white transition-colors" aria-label="Twitter" prefetch={false}><Twitter className="h-5 w-5" /></Link>
            <Link href="#" className="text-white/55 hover:text-white transition-colors" aria-label="LinkedIn" prefetch={false}><Linkedin className="h-5 w-5" /></Link>
          </div>
          <p className="text-sm text-white/55 md:hidden leading-relaxed max-w-md">
            Adetipe Adesanmi · +358 46 5560087 · Harmony Gold estate olonde, Lagos, Nigeria.
          </p>

          {/* Desktop Only: Legal Links */}
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-500 font-medium">
            <Link href="/terms" className="hover:text-[#004324] transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-[#004324] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#004324] transition-colors">Legal Notice</Link>
            <Link href="/terms" className="hover:text-[#004324] transition-colors">Cookie Setting</Link>
          </div>
          
          {/* Copyright */}
          <p className="text-xs text-white/40 md:text-sm md:text-gray-500 md:font-medium mt-4 md:mt-0">
            © {new Date().getFullYear()} — SIGMAWEALTH TECHNOLOGIES LIMITED.
          </p>
        </div>
        
      </div>
    </footer>
  )
}
