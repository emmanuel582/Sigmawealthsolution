import { NextResponse } from 'next/server'
import { publicStripeConfig } from '@/lib/sigma/stripeServer'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json(publicStripeConfig())
}
