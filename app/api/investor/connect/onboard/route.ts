import { NextRequest, NextResponse } from 'next/server'
import { startConnectOnboarding } from '@/lib/sigma/stripeServer'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await startConnectOnboarding(body)
    return NextResponse.json(result.json, { status: result.status })
  } catch (err: any) {
    console.error('connect onboard', err)
    return NextResponse.json(
      { message: err?.message || 'Failed to start Stripe Connect onboarding' },
      { status: 500 }
    )
  }
}
