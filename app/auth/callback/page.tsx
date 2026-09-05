"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase, isSupabaseConfigured } from "@/lib/sigma/supabaseClient"

/**
 * OAuth return URL for Google (and other providers).
 * Completes the PKCE session exchange, then sends the user to the dashboard.
 */
export default function AuthCallbackPage() {
  const router = useRouter()
  const [message, setMessage] = useState("Completing secure sign-in…")

  useEffect(() => {
    let cancelled = false

    async function finish() {
      if (!isSupabaseConfigured) {
        setMessage("Auth is not configured.")
        router.replace("/auth/login")
        return
      }

      try {
        // Handle hash/query tokens from Google → Supabase redirect
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error

        if (!data.session) {
          // Exchange code if present in URL (PKCE)
          const params = new URLSearchParams(window.location.search)
          const code = params.get("code")
          if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
            if (exchangeError) throw exchangeError
          }
        }

        const { data: again } = await supabase.auth.getSession()
        if (cancelled) return

        if (again.session?.user) {
          // Ensure investor profile exists
          const u = again.session.user
          await fetch("/api/investor/register-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: u.id,
              email: u.email,
              name:
                u.user_metadata?.full_name ||
                u.user_metadata?.name ||
                u.email?.split("@")[0] ||
                "Investor",
              phone: u.user_metadata?.phone || "",
              referralCode:
                localStorage.getItem("sigma_ref") ||
                document.cookie
                  .split("; ")
                  .find((c) => c.startsWith("sigma_ref="))
                  ?.split("=")[1],
            }),
          }).catch(() => {})

          router.replace("/dashboard")
          return
        }

        setMessage("Sign-in incomplete. Try again.")
        router.replace("/auth/login")
      } catch (err: any) {
        if (!cancelled) {
          setMessage(err?.message || "Google sign-in failed.")
          setTimeout(() => router.replace("/auth/login"), 2000)
        }
      }
    }

    finish()
    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[#edefeb] flex flex-col items-center justify-center gap-3 px-4">
      <div className="w-10 h-10 border-4 border-[#163300] border-t-[#9fe870] rounded-full animate-spin" />
      <p className="text-sm font-semibold text-[#163300]/70 text-center">{message}</p>
    </div>
  )
}
