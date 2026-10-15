"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { AuthPage } from "@/components/sigma/AuthPage"
import { useSigmaNavigate } from "@/lib/sigma/navigate"
import { useAuth } from "@/contexts/AuthContext"
import { authErrorMessage } from "@/lib/sigma/authRedirects"

function LoginContent() {
  const onNavigate = useSigmaNavigate()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()
  const mode = searchParams.get("mode") === "forgot" ? "forgot" : "login"

  useEffect(() => {
    if (!isLoading && user) onNavigate("dashboard")
  }, [user, isLoading, onNavigate])

  return <AuthPage initialMode={mode} initialError={authErrorMessage(searchParams.get("auth_error"))} onNavigate={onNavigate} />
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
