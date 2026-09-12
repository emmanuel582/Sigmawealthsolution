"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { InvestorDashboard } from "@/components/sigma/InvestorDashboard"
import { useSigmaNavigate } from "@/lib/sigma/navigate"
import { useAuth } from "@/contexts/AuthContext"
import { BrandLoader } from "@/components/BrandLoader"

export default function DashboardPage() {
  const router = useRouter()
  const onNavigate = useSigmaNavigate()
  const { user, isLoading } = useAuth()

  // Guests should use /auth/login — don't replace the landing experience with an embedded login
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login")
    }
  }, [isLoading, user, router])

  if (isLoading || !user) {
    return <BrandLoader />
  }

  return <InvestorDashboard onNavigate={onNavigate} />
}
