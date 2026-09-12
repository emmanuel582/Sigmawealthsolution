"use client"

import NotFound from "@/app/not-found"

/** Decoy target for blocked /admin probes — looks like a normal 404. */
export default function AdminDecoyPage() {
  return <NotFound />
}
