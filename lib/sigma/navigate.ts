"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { ADMIN_APP_PATH } from "@/lib/sigma/adminPath"

const VIEW_ROUTES: Record<string, string> = {
  landing: "/",
  terms: "/terms",
  "auth-login": "/auth/login",
  "auth-signup": "/auth/signup",
  "auth-forgot": "/auth/login?mode=forgot",
  dashboard: "/dashboard",
  admin: ADMIN_APP_PATH,
}

/** Maps legacy apex onNavigate(view) calls to Next.js routes */
export function useSigmaNavigate() {
  const router = useRouter()
  return useCallback((view: string) => {
    const path = VIEW_ROUTES[view] || "/"
    router.push(path)
  }, [router])
}
