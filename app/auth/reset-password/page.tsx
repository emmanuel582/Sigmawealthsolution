"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { AppIcon } from "@/components/sigma/ui/AppIcon"
import { PressableButton } from "@/components/sigma/ui/Pressable"
import { BrandLogo } from "@/components/BrandLogo"
import { AuthHeroPanel } from "@/components/sigma/AuthPage"
import { useSigmaNavigate } from "@/lib/sigma/navigate"
import { supabase, isSupabaseConfigured } from "@/lib/sigma/supabaseClient"

const pillInput =
  "w-full h-[48px] pl-11 pr-11 rounded-full bg-white text-[#163300] text-sm placeholder:text-[#163300]/40 border border-[#163300]/8 shadow-[0_2px_12px_rgba(22,51,0,0.04)] focus:outline-none focus:ring-2 focus:ring-[#9fe870] focus:border-[#9fe870]/50 transition-all duration-200"

const EXPIRED_MSG = "This reset link is invalid or has expired. Please request a new one."

export default function ResetPasswordPage() {
  const onNavigate = useSigmaNavigate()

  const [checking, setChecking] = useState(true)
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const ran = useRef(false)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError("Password reset requires Supabase configuration.")
      setChecking(false)
      return
    }

    // Recovery link → Supabase fires PASSWORD_RECOVERY once the session is established
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true)
        setError(null)
        setChecking(false)
      }
    })

    // Run the link check only once (strict mode runs effects twice in dev,
    // and a PKCE code can only be exchanged one time)
    if (!ran.current) {
      ran.current = true
      ;(async () => {
        try {
          const url = new URL(window.location.href)
          const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""))

          if (url.searchParams.get("error_description") || hash.get("error_description")) {
            setError(EXPIRED_MSG)
            return
          }

          // PKCE flow: link arrives as ?code=...
          const code = url.searchParams.get("code")
          if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
            if (exchangeError) throw exchangeError
            window.history.replaceState({}, "", url.pathname)
          }

          // Implicit flow: tokens in the #hash are picked up by the client automatically
          const { data } = await supabase.auth.getSession()
          if (data.session) setReady(true)
          else setError(EXPIRED_MSG)
        } catch {
          setError(EXPIRED_MSG)
        } finally {
          setChecking(false)
        }
      })()
    }

    return () => sub.subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setSubmitting(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      // Make them log in fresh with the new password
      await supabase.auth.signOut()
      setDone(true)
    } catch (err: any) {
      setError(err.message || "Could not update your password. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const heading = done
    ? { title: "Password Updated", sub: "You can now log in with your new password." }
    : { title: "Set a New Password", sub: "Choose a strong password for your investor account." }

  return (
    <div className="min-h-screen min-h-[100dvh] w-full flex flex-col lg:flex-row bg-[#edefeb] overflow-x-hidden">
      {/* ─── FORM PANEL ─── */}
      <div className="flex-1 flex flex-col justify-center lg:w-[48%] xl:w-[44%] min-h-full py-8 sm:py-10 px-5 sm:px-8 lg:px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full mx-auto lg:mx-0 max-w-[420px] lg:max-w-[400px]"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-5 lg:mb-6">
            <div className="w-11 h-11 rounded-2xl overflow-hidden bg-[#163300] flex items-center justify-center shadow-lg shrink-0 border border-[#9fe870]/20">
              <BrandLogo size={40} className="rounded-xl" />
            </div>
            <div>
              <p className="font-bold text-[#163300] text-lg leading-tight">Sigma Wealth</p>
              <p className="text-[10px] text-[#163300]/50 uppercase tracking-widest font-semibold">Investor Portal</p>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#163300] tracking-tight">{heading.title}</h1>
          <p className="text-sm text-[#163300]/55 mt-1 mb-5 leading-relaxed">{heading.sub}</p>

          {/* Verifying */}
          {checking && (
            <div className="flex items-center gap-2 text-xs text-[#163300]/60 font-medium">
              <AppIcon name="refresh" className="w-4 h-4" spin />
              <span>Verifying your reset link…</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-3 p-3 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-xs flex items-start gap-2">
              <AppIcon name="circleExclamation" className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Expired / invalid link */}
          {!checking && !ready && !done && (
            <a href="/auth/login?mode=forgot" className="block">
              <PressableButton type="button" fullWidth className="!h-[48px] !rounded-full !text-[#9fe870] mt-1">
                <span>Request a new reset link</span>
              </PressableButton>
            </a>
          )}

          {/* New password form */}
          {ready && !done && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="relative">
                <AppIcon name="lock" className="w-4 h-4 text-[#163300]/35 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
                <input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  className={pillInput}
                  autoComplete="new-password"
                />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#163300]/35 hover:text-[#163300]"
                >
                  <AppIcon name={showPassword ? "eyeSlash" : "eye"} className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="relative">
                <AppIcon name="lock" className="w-4 h-4 text-[#163300]/35 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={pillInput}
                  autoComplete="new-password"
                />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#163300]/35 hover:text-[#163300]"
                >
                  <AppIcon name={showConfirmPassword ? "eyeSlash" : "eye"} className="w-4 h-4" />
                </motion.button>
              </div>

              <PressableButton
                type="submit"
                id="reset-submit-btn"
                disabled={submitting}
                fullWidth
                className="!h-[48px] !rounded-full !text-[#9fe870] mt-1"
              >
                {submitting ? (
                  <>
                    <AppIcon name="refresh" className="w-4 h-4" spin />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </PressableButton>
            </form>
          )}

          {/* Success */}
          {done && (
            <div>
              <div className="mb-3 p-3 rounded-2xl bg-[#9fe870]/20 border border-[#9fe870]/40 text-[#163300] text-xs flex items-start gap-2">
                <AppIcon name="circleCheck" className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Your password has been updated.</span>
              </div>
              <PressableButton
                type="button"
                onClick={() => onNavigate("auth-login")}
                fullWidth
                className="!h-[48px] !rounded-full !text-[#9fe870] mt-1"
              >
                <span>Go to Login</span>
              </PressableButton>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 mt-6 text-[10px] text-[#163300]/35">
            <AppIcon name="shield" className="w-3.5 h-3.5 text-[#9fe870]" />
            <span>Secured by Supabase with Row Level Security</span>
          </div>
        </motion.div>
      </div>

      {/* ─── HERO PANEL (desktop) ─── */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-6 xl:p-8 bg-[#edefeb]">
        <AuthHeroPanel />
      </div>
    </div>
  )
}
