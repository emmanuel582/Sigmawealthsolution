"use client"

import { useEffect } from "react"
import { AuthPage } from "@/components/sigma/AuthPage"
import { useSigmaNavigate } from "@/lib/sigma/navigate"
import { useAuth } from "@/contexts/AuthContext"

function captureReferralCookie() {
  if (typeof window === "undefined") return
  const params = new URLSearchParams(window.location.search)
  const ref = (params.get("ref") || "").trim().toUpperCase()
  if (!ref) return
  localStorage.setItem("sigma_ref", ref)
  const expires = new Date()
  expires.setDate(expires.getDate() + 30)
  document.cookie = `sigma_ref=${encodeURIComponent(ref)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

export default function SignupPage() {
  const onNavigate = useSigmaNavigate()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    captureReferralCookie()
  }, [])

  useEffect(() => {
    if (!isLoading && user) onNavigate("dashboard")
  }, [user, isLoading, onNavigate])

  return <AuthPage initialMode="signup" onNavigate={onNavigate} />
}
