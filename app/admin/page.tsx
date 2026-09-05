"use client"

import { AdminPortal } from "@/components/sigma/AdminPortal"
import { useSigmaNavigate } from "@/lib/sigma/navigate"
import { useAuth } from "@/contexts/AuthContext"

export default function AdminPage() {
  const onNavigate = useSigmaNavigate()
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#edefeb] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#163300] border-t-[#9fe870] rounded-full animate-spin" />
        <span className="text-xs font-semibold text-[#163300]/60">Loading admin...</span>
      </div>
    )
  }

  return <AdminPortal onNavigate={onNavigate} />
}
