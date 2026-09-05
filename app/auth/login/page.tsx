"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { AuthPage } from "@/components/sigma/AuthPage"
import { useSigmaNavigate } from "@/lib/sigma/navigate"
import { useAuth } from "@/contexts/AuthContext"

function LoginContent() {
  const onNavigate = useSigmaNavigate()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()
  const mode = searchParams.get("mode") === "forgot" ? "forgot" : "login"

  useEffect(() => {
    if (!isLoading && user) onNavigate("dashboard")
  }, [user, isLoading, onNavigate])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#edefeb] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#163300] border-t-[#9fe870] rounded-full animate-spin" />
        <span className="text-xs font-semibold text-[#163300]/60">Loading...</span>
      </div>
    )
  }

  return <AuthPage initialMode={mode} onNavigate={onNavigate} />
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#edefeb] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#163300] border-t-[#9fe870] rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
