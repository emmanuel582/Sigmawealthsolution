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
      <div className="min-h-screen bg-[#edefeb]">
        {/* Skeleton Header */}
        <div className="bg-[#004324] px-4 sm:px-6 md:px-8 py-6 sm:py-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse" />
                <div className="h-5 w-32 bg-white/20 rounded animate-pulse" />
              </div>
              <div className="h-9 w-24 bg-white/20 rounded-lg animate-pulse" />
            </div>
            <div className="h-8 w-48 bg-white/15 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
        
        {/* Skeleton Stats Cards */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 -mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-3" />
                <div className="h-7 w-28 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Skeleton Main Content */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pb-8">
          {/* Chart Area */}
          <div className="md:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-20 bg-gray-100 rounded-lg animate-pulse" />
            </div>
            <div className="h-48 sm:h-64 bg-gray-50 rounded-lg animate-pulse" />
          </div>

          {/* Side Panel */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 w-full bg-gray-200 rounded animate-pulse mb-1.5" />
                    <div className="h-2.5 w-2/3 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage initialMode="login" onNavigate={onNavigate} />
  }

  return <InvestorDashboard onNavigate={onNavigate} />
}
