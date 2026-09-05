"use client"

import React, { useState, useEffect } from "react"
import { ChevronDown, Menu, X, Wallet, Calendar, Shield, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useDropdown } from "../contexts/DropdownContext"

export function Navbar() {
  const { isFeaturesOpen, setIsFeaturesOpen } = useDropdown()
  const [isGetStartedHovered, setIsGetStartedHovered] = useState(false)
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const features = [
    {
      icon: Wallet,
      title: "Flexible Investing",
      description: "Start from $100 — invest as much as you want",
      href: "/#how-it-works",
    },
    {
      icon: Calendar,
      title: "Twice-Monthly Payouts",
      description: "50% in two weeks, 50% at month end",
      href: "/#returns",
    },
    {
      icon: TrendingUp,
      title: "Full Monthly Returns",
      description: "Complete return of investment every month",
      href: "/#investment",
    },
    {
      icon: Shield,
      title: "Secure Dashboard",
      description: "Track investments, payments & auto-debit",
      href: "/#investment",
    },
  ]

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY
      setIsScrolled(currentScrollY > 8)
      if (currentScrollY < lastScrollY || currentScrollY < 10 || isMobileMenuOpen) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100 && !isFeaturesOpen && !isMobileMenuOpen) {
        setIsVisible(false)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", controlNavbar)
    return () => window.removeEventListener("scroll", controlNavbar)
  }, [lastScrollY, isFeaturesOpen, isMobileMenuOpen])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileMenuOpen])

  const closeMobile = () => {
    setIsMobileMenuOpen(false)
    setIsFeaturesOpen(false)
  }

  return (
    <div>
      <div className="h-[80px] sm:h-[92px]" />
      <nav
        className={`fixed top-0 left-0 right-0 z-[10000] px-3 pt-3 sm:px-4 sm:pt-4 transition-all duration-300 ${
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-[110%] opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`w-[95%] max-w-[1080px] mx-auto px-4 sm:px-6 md:px-8 flex justify-between items-center min-h-[56px] sm:min-h-[60px] py-2.5 sm:py-3 rounded-2xl border transition-all duration-300 ${
            isScrolled || isMobileMenuOpen
              ? "bg-white/75 backdrop-blur-xl border-white/60 shadow-[0_8px_32px_rgba(0,67,36,0.12),0_2px_8px_rgba(0,0,0,0.06)]"
              : "bg-white/55 backdrop-blur-lg border-white/50 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
          }`}
        >
          <div className="flex items-center gap-4 md:gap-6 lg:gap-8 min-w-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0" onClick={closeMobile}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[3px] border-[#004324] flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-black text-[#004324]">S</span>
              </div>
              <div className="flex flex-col items-start min-w-0">
                <h1 className="text-[#004324] text-sm sm:text-lg md:text-xl font-black leading-tight tracking-wide truncate max-w-[140px] sm:max-w-none">
                  Sigmawealth
                </h1>
                <span className="text-[#004324] text-[9px] sm:text-[10px] italic tracking-widest hidden xs:block sm:block">
                  Solution
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-5">
              <Link
                href="/"
                className={`text-base font-medium px-3 py-2 transition-colors ${
                  hoveredLink === "home" ? "text-[#004324]" : "text-black"
                }`}
                onMouseEnter={() => {
                  setHoveredLink("home")
                  setIsFeaturesOpen(false)
                }}
                onMouseLeave={() => setHoveredLink(null)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className={`text-base font-medium px-3 py-2 transition-colors ${
                  hoveredLink === "about" ? "text-[#004324]" : "text-black"
                }`}
                onMouseEnter={() => {
                  setHoveredLink("about")
                  setIsFeaturesOpen(false)
                }}
                onMouseLeave={() => setHoveredLink(null)}
              >
                About
              </Link>
              <div className="relative">
                <button
                  className={`text-base font-medium px-3 py-2 flex items-center gap-1 transition-colors ${
                    hoveredLink === "features" ? "text-[#004324]" : "text-black"
                  }`}
                  onMouseEnter={() => {
                    setIsFeaturesOpen(true)
                    setHoveredLink("features")
                  }}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  Invest
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${isFeaturesOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
              <Link
                href="/contact"
                className={`text-base font-medium px-3 py-2 transition-colors ${
                  hoveredLink === "contact" ? "text-[#004324]" : "text-black"
                }`}
                onMouseEnter={() => {
                  setHoveredLink("contact")
                  setIsFeaturesOpen(false)
                }}
                onMouseLeave={() => setHoveredLink(null)}
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/terms"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-white text-[#004324] border border-[#004324] rounded-md text-xs sm:text-sm font-medium shadow-[0_3px_0_#002a18] hover:translate-y-px hover:shadow-[0_2px_0_#002a18] active:translate-y-[3px] active:shadow-none transition-all"
            >
              Terms
            </Link>
            <Link
              href="/auth/signup"
              className="hidden sm:inline-flex px-3 sm:px-4 py-2 text-white rounded-xl text-xs sm:text-sm font-medium transition-all"
              style={{
                backgroundColor: isGetStartedHovered ? "#004324" : "#303030",
                transform: isGetStartedHovered ? "translateY(1px)" : "translateY(0)",
                boxShadow: isGetStartedHovered ? "0 4px 0 #000000" : "0 6px 0 #000000",
              }}
              onMouseEnter={() => setIsGetStartedHovered(true)}
              onMouseLeave={() => setIsGetStartedHovered(false)}
            >
              Get Started
            </Link>
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg border border-gray-200 text-[#004324]"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => {
                setIsMobileMenuOpen((v) => !v)
                setIsFeaturesOpen(false)
              }}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Desktop features dropdown */}
      <div
        className={`fixed inset-0 top-[80px] bg-black/40 backdrop-blur-sm z-[9980] transition-opacity duration-300 hidden lg:block ${
          isFeaturesOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onMouseEnter={() => setIsFeaturesOpen(false)}
      />
      <div
        className={`fixed top-[80px] left-0 right-0 mx-auto w-[95%] max-w-[1080px] z-[9990] bg-white rounded-b-2xl border border-t-0 border-gray-200 shadow-xl origin-top transition-all duration-300 hidden lg:block ${
          isFeaturesOpen ? "scale-y-100 opacity-100 pointer-events-auto" : "scale-y-0 opacity-0 pointer-events-none"
        }`}
        style={{ height: "calc(50vh - 1rem)" }}
        onMouseEnter={() => setIsFeaturesOpen(true)}
        onMouseLeave={() => setIsFeaturesOpen(false)}
      >
        <div className="grid grid-cols-4 max-w-[1080px] mx-auto h-full items-center px-4 py-8">
          {features.map((feature, index) => (
            <div key={feature.title} className="relative h-full flex items-center">
              <Link
                href={feature.href}
                className="flex flex-col items-center text-center gap-3 px-4 py-6 w-full hover:bg-[#f0f9f4] rounded-xl transition-all duration-300 hover:-translate-y-1"
                onClick={() => setIsFeaturesOpen(false)}
              >
                <feature.icon className="w-8 h-8 text-[#004324]" />
                <h4 className="text-base font-semibold text-gray-900">{feature.title}</h4>
                <p className="text-sm text-gray-500 leading-snug">{feature.description}</p>
              </Link>
              {index < features.length - 1 && (
                <div className="absolute right-0 top-[20%] bottom-[20%] w-px bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile menu — blurred backdrop + left drawer */}
      <div
        className={`fixed inset-0 z-[1002] lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div
          className="absolute inset-0 bg-[#004324]/25 backdrop-blur-md supports-[backdrop-filter]:bg-black/40"
          onClick={closeMobile}
        />
        <div
          className={`absolute top-0 left-0 bottom-0 w-[82%] max-w-[320px] bg-white/95 backdrop-blur-xl border-r border-white/60 shadow-[8px_0_40px_rgba(0,0,0,0.18)] overflow-y-auto transition-transform duration-300 ease-out z-[1003] ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100/80">
            <Link href="/" className="flex items-center gap-2" onClick={closeMobile}>
              <div className="w-9 h-9 rounded-full border-[2px] border-[#004324] flex items-center justify-center">
                <span className="text-lg font-black text-[#004324]">S</span>
              </div>
              <span className="text-[#004324] font-black text-base">Sigmawealth</span>
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMobile}
              className="p-2 rounded-lg text-[#004324] hover:bg-[#f0f9f4] transition-colors"
            >
              <X size={22} />
            </button>
          </div>
          <nav className="flex flex-col px-3 py-4 gap-1">
            <Link href="/" className="px-4 py-3 text-base font-medium text-black rounded-lg hover:bg-[#f0f9f4]" onClick={closeMobile}>
              Home
            </Link>
            <Link href="/about" className="px-4 py-3 text-base font-medium text-black rounded-lg hover:bg-[#f0f9f4]" onClick={closeMobile}>
              About
            </Link>
            <Link href="/#investment" className="px-4 py-3 text-base font-medium text-black rounded-lg hover:bg-[#f0f9f4]" onClick={closeMobile}>
              Investment
            </Link>
            <Link href="/#how-it-works" className="px-4 py-3 text-base font-medium text-black rounded-lg hover:bg-[#f0f9f4]" onClick={closeMobile}>
              How It Works
            </Link>
            <Link href="/#returns" className="px-4 py-3 text-base font-medium text-black rounded-lg hover:bg-[#f0f9f4]" onClick={closeMobile}>
              Returns
            </Link>
            <Link href="/contact" className="px-4 py-3 text-base font-medium text-black rounded-lg hover:bg-[#f0f9f4]" onClick={closeMobile}>
              Contact
            </Link>
            <Link href="/terms" className="px-4 py-3 text-base font-medium text-black rounded-lg hover:bg-[#f0f9f4]" onClick={closeMobile}>
              Terms & Conditions
            </Link>
            <div className="pt-3 mt-2 border-t border-gray-100 px-4 pb-4">
              <Link
                href="/auth/signup"
                className="flex items-center justify-center w-full px-4 py-3 bg-[#303030] text-white rounded-xl text-sm font-medium shadow-[0_4px_0_#000000]"
                onClick={closeMobile}
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </div>
  )
}
