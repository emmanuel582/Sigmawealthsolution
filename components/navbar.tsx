"use client"

import React, { useState, useEffect, useRef } from "react"
import { ChevronDown, Menu, X, Wallet, Calendar, Shield, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useDropdown } from "../contexts/DropdownContext"
import { BrandLogo } from "@/components/BrandLogo"

export function Navbar() {
  const { isFeaturesOpen, setIsFeaturesOpen } = useDropdown()
  const [isGetStartedHovered, setIsGetStartedHovered] = useState(false)
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onChat = (e: Event) => {
      const detail = (e as CustomEvent).detail
      setChatOpen(Boolean(detail?.open))
      if (detail?.open) setIsMobileMenuOpen(false)
    }
    window.addEventListener("sigma-chat-open", onChat as EventListener)
    return () => window.removeEventListener("sigma-chat-open", onChat as EventListener)
  }, [])

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
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
        setIsFeaturesOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false)
        setIsFeaturesOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside)
      window.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isMobileMenuOpen, setIsFeaturesOpen])

  const closeMobile = () => {
    setIsMobileMenuOpen(false)
    setIsFeaturesOpen(false)
  }

  return (
    <div>
      <div className="h-[80px] sm:h-[92px]" />
      {/* Soft lit glass wash so content beneath the nav reads through when scrolled */}
      <div
        aria-hidden
        className={`fixed top-0 left-0 right-0 z-[9990] pointer-events-none transition-opacity duration-500 ${
          chatOpen || !isVisible ? "opacity-0" : isScrolled ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="h-28 bg-gradient-to-b from-white/70 via-white/35 to-transparent backdrop-blur-[2px]" />
        <div className="absolute inset-x-0 top-0 h-20 bg-[radial-gradient(ellipse_at_top,_rgba(159,232,112,0.18),_transparent_65%)]" />
      </div>

      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-[10000] px-3 pt-3 sm:px-4 sm:pt-4 transition-all duration-300 ${
          chatOpen
            ? "-translate-y-[140%] opacity-0 pointer-events-none"
            : isVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-[110%] opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`w-[95%] max-w-[1080px] mx-auto rounded-2xl border transition-all duration-300 ${
            isScrolled || isMobileMenuOpen
              ? "bg-white/55 backdrop-blur-2xl border-white/70 shadow-[0_12px_40px_rgba(0,67,36,0.14),0_2px_8px_rgba(255,255,255,0.5)_inset] ring-1 ring-[#9fe870]/25"
              : "bg-white/75 backdrop-blur-lg border-white/50 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
          }`}
        >
          <div className="px-4 sm:px-6 md:px-8 flex justify-between items-center min-h-[56px] sm:min-h-[60px] py-2.5 sm:py-3">
            <div className="flex items-center gap-4 md:gap-6 lg:gap-8 min-w-0">
              <Link href="/" className="flex items-center gap-2.5 sm:gap-3.5 shrink-0" onClick={closeMobile}>
                <BrandLogo
                  size={56}
                  priority
                  className="rounded-xl w-12 h-12 sm:w-14 sm:h-14 md:w-[3.75rem] md:h-[3.75rem]"
                />
                <div className="flex flex-col items-start min-w-0">
                  <h1 className="text-[#004324] text-base sm:text-xl md:text-2xl font-black leading-tight tracking-wide truncate max-w-[160px] sm:max-w-none">
                    Sigmawealth
                  </h1>
                  <span className="text-[#004324] text-[10px] sm:text-xs italic tracking-widest hidden xs:block sm:block">
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
                className="lg:hidden p-2 rounded-lg border border-gray-200 text-[#004324] hover:bg-[#f0f9f4] transition-colors"
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

          {/* Mobile Menu Dropdown inside the Navbar */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-100/90 px-4 sm:px-6 pt-2 pb-5 max-h-[calc(85vh-80px)] overflow-y-auto">
              <nav className="flex flex-col gap-1 pt-1">
                <Link
                  href="/"
                  className="px-3.5 py-2.5 text-base font-medium text-gray-800 rounded-xl hover:bg-[#f0f9f4] hover:text-[#004324] transition-colors"
                  onClick={closeMobile}
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="px-3.5 py-2.5 text-base font-medium text-gray-800 rounded-xl hover:bg-[#f0f9f4] hover:text-[#004324] transition-colors"
                  onClick={closeMobile}
                >
                  About
                </Link>
                <Link
                  href="/#investment"
                  className="px-3.5 py-2.5 text-base font-medium text-gray-800 rounded-xl hover:bg-[#f0f9f4] hover:text-[#004324] transition-colors"
                  onClick={closeMobile}
                >
                  Investment
                </Link>
                <Link
                  href="/#how-it-works"
                  className="px-3.5 py-2.5 text-base font-medium text-gray-800 rounded-xl hover:bg-[#f0f9f4] hover:text-[#004324] transition-colors"
                  onClick={closeMobile}
                >
                  How It Works
                </Link>
                <Link
                  href="/#returns"
                  className="px-3.5 py-2.5 text-base font-medium text-gray-800 rounded-xl hover:bg-[#f0f9f4] hover:text-[#004324] transition-colors"
                  onClick={closeMobile}
                >
                  Returns
                </Link>
                <Link
                  href="/contact"
                  className="px-3.5 py-2.5 text-base font-medium text-gray-800 rounded-xl hover:bg-[#f0f9f4] hover:text-[#004324] transition-colors"
                  onClick={closeMobile}
                >
                  Contact
                </Link>
                <Link
                  href="/terms"
                  className="px-3.5 py-2.5 text-base font-medium text-gray-800 rounded-xl hover:bg-[#f0f9f4] hover:text-[#004324] transition-colors"
                  onClick={closeMobile}
                >
                  Terms & Conditions
                </Link>
                <div className="pt-3 mt-1 border-t border-gray-100 flex flex-col gap-2">
                  <Link
                    href="/auth/signup"
                    className="flex items-center justify-center w-full px-4 py-3 bg-[#004324] hover:bg-[#00331c] text-white rounded-xl text-sm font-semibold shadow-[0_3px_0_#002011] active:translate-y-0.5 active:shadow-none transition-all"
                    onClick={closeMobile}
                  >
                    Get Started
                  </Link>
                </div>
              </nav>
            </div>
          )}
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
    </div>
  )
}
