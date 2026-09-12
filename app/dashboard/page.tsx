"use client"

import { InvestorDashboard } from "@/components/sigma/InvestorDashboard"
import { AuthPage } from "@/components/sigma/AuthPage"
import { useSigmaNavigate } from "@/lib/sigma/navigate"
import { useAuth } from "@/contexts/AuthContext"
import { BrandLoader } from "@/components/BrandLoader"

export default function DashboardPage() {
  const onNavigate = useSigmaNavigate()
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <BrandLoader label="Opening your investor dashboard…" />
  }

  if (!user) {
    return <AuthPage initialMode="login" onNavigate={onNavigate} />
  }

  return <InvestorDashboard onNavigate={onNavigate} />
}
