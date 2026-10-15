"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase, isSupabaseConfigured } from "@/lib/sigma/supabaseClient"
import { authErrorCode } from "@/lib/sigma/authRedirects"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    const retry = (code: string) => {
      if (!cancelled) router.replace(`/auth/login?auth_error=${code}`)
    }
    async function finish() {
      const reportedError = authErrorCode(new URL(window.location.href))
      if (reportedError) { retry(reportedError); return }
      if (!isSupabaseConfigured) { retry("oauth_failed"); return }
      try {
        // The singleton SDK owns URL detection and the one-time PKCE exchange.
        // Reusing its initialization promise also handles React Strict Mode.
        const { error: initError } = await supabase.auth.initialize()
        if (initError) { retry("oauth_expired"); return }
        const { data, error } = await supabase.auth.getSession()
        if (error || !data.session) { retry("oauth_expired"); return }
        if (!cancelled) router.replace("/dashboard")
      } catch { retry("oauth_failed") }
    }
    void finish()
    return () => { cancelled = true }
  }, [router])

  return (
    <div className="min-h-screen bg-[#edefeb] flex flex-col items-center justify-center gap-3 px-4">
      <div className="w-10 h-10 border-4 border-[#163300] border-t-[#9fe870] rounded-full animate-spin" />
      <p role="status" className="text-sm font-semibold text-[#163300]/70 text-center">Completing secure sign-in…</p>
    </div>
  )
}
