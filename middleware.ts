import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ADMIN_APP_PATH } from "@/lib/sigma/adminPath"
import { authErrorCode } from "@/lib/sigma/authRedirects"

/** Block obvious admin URLs so strangers can't casually open /admin. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authError = authErrorCode(request.nextUrl)
  if (authError && pathname !== "/auth/reset-password") {
    const login = new URL("/auth/login", request.url)
    login.searchParams.set("auth_error", authError)
    return NextResponse.redirect(login)
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.rewrite(new URL("/not-found-decoy", request.url))
  }

  if (pathname === ADMIN_APP_PATH || pathname.startsWith(`${ADMIN_APP_PATH}/`)) {
    const res = NextResponse.next()
    res.headers.set("Referrer-Policy", "no-referrer")
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive")
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/auth/:path*", "/dashboard", "/admin", "/admin/:path*", "/sws-ops-k9m2x", "/sws-ops-k9m2x/:path*"],
}
