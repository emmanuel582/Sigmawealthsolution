"use client"

import { AdminPortal } from "@/components/sigma/AdminPortal"
import { useSigmaNavigate } from "@/lib/sigma/navigate"
import { useAuth } from "@/contexts/AuthContext"
import { BrandLoader } from "@/components/BrandLoader"

export default function HiddenOpsConsolePage() {
  const onNavigate = useSigmaNavigate()
  const { isLoading } = useAuth()

  if (isLoading) {
    return <BrandLoader label="Verifying secure access…" />
  }

  return <AdminPortal onNavigate={onNavigate} />
}
