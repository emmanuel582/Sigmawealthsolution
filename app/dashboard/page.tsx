"use client"

import { useEffect } from "react"
import { InvestorDashboard } from "@/components/sigma/InvestorDashboard"
import { AuthPage } from "@/components/sigma/AuthPage"
import { useSigmaNavigate } from "@/lib/sigma/navigate"
import { useAuth } from "@/contexts/AuthContext"

export default function DashboardPage() {
  const onNavigate = useSigmaNavigate()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      // stay on page; AuthPage shown below
    }
  }, [user, isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#edefeb] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#163300] border-t-[#9fe870] rounded-full animate-spin" />
        <span className="text-xs font-semibold text-[#163300]/60">Loading dashboard...</span>
      </div>
    )
  }

  if (!user) {
    return <AuthPage initialMode="login" onNavigate={onNavigate} />
  }

  return <InvestorDashboard onNavigate={onNavigate} />
}
