"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import NotFound from "@/app/not-found"

/** Old /admin URL — never reveal the real console. */
export default function LegacyAdminTrap() {
  const router = useRouter()
  useEffect(() => {
    // Soft-replace so the address bar doesn't advertise an admin area
    router.replace("/")
  }, [router])
  return <NotFound />
}
