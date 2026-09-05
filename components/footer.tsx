import Link from "next/link"
import { Instagram, Linkedin, Facebook, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#2a2e33] text-white py-12 sm:py-14 md:py-16">
      <div className="w-[95%] max-w-[1080px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Top: brand + badge */}
        <div className="flex items-start gap-4 mb-10 sm:mb-12">
          <div className="min-w-0">
            <Link href="/" className="flex items-center gap-2.5" prefetch={false}>
              <div className="w-10 h-10 rounded-full border-2 border-[#004324] bg-[#004324] flex items-center justify-center shrink-0">
                <span className="text-lg font-black text-white">S</span>
              </div>
              <span className="text-lg sm:text-xl font-bold tracking-tight">sigmawealth</span>
            </Link>
            <p className="text-sm text-white/60 mt-3 max-w-[220px] leading-snug">
              The better way to grow and invest.
            </p>
          </div>
        </div>

        {/* 2-column link grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 mb-12">
          <div className="space-y-10">
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Products</h3>
              <nav className="space-y-3">
                <Link href="/#investment" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>
                  Invest from $100
                </Link>
                <Link href="/#returns" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>
                  Twice-monthly payouts
                </Link>
                <Link href="/#how-it-works" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>
                  Auto-debit
                </Link>
                <Link href="/#how-it-works" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>
                  One-time deposits
                </Link>
                <Link href="/dashboard" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>
                  Investor dashboard
                </Link>
              </nav>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
              <nav className="space-y-3">
                <Link href="/about" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>
                  About
                </Link>
                <Link href="/contact" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>
                  Contact
                </Link>
                <Link href="/#testimonials" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>
                  Testimonials
                </Link>
                <Link href="/auth/signup" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>
                  Get Started
                </Link>
              </nav>
            </div>
          </div>

          <div className="space-y-10">
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Resources</h3>
              <nav className="space-y-3">
                <Link href="/#how-it-works" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>
                  How It Works
                </Link>
                <Link href="/#returns" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>
                  Returns
                </Link>
                <Link href="/#investment" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>
                  Payment options
                </Link>
                <Link href="/contact" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>
                  Support
                </Link>
              </nav>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
              <nav className="space-y-3">
                <Link href="/privacy" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>
                  Privacy
                </Link>
                <Link href="/terms" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>
                  Terms
                </Link>
                <Link href="/terms" className="block text-sm text-white/55 hover:text-white transition-colors" prefetch={false}>
                  Security
                </Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center gap-4 mb-5">
            <Link href="#" className="text-white/55 hover:text-white transition-colors" aria-label="Facebook" prefetch={false}>
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-white/55 hover:text-white transition-colors" aria-label="Instagram" prefetch={false}>
              <Instagram className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-white/55 hover:text-white transition-colors" aria-label="Twitter" prefetch={false}>
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-white/55 hover:text-white transition-colors" aria-label="LinkedIn" prefetch={false}>
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
          <p className="text-sm text-white/55 leading-relaxed max-w-md">
            Harmony Gold estate olonde, Lagos, Nigeria.
          </p>
          <p className="text-xs text-white/40 mt-4">© 2026 SigmawealthSolution.</p>
        </div>
      </div>
    </footer>
  )
}
