import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ADMIN_APP_PATH } from "@/lib/sigma/adminPath"

/** Block obvious admin URLs so strangers can't casually open /admin. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
  matcher: ["/admin", "/admin/:path*", "/sws-ops-k9m2x", "/sws-ops-k9m2x/:path*"],
}
