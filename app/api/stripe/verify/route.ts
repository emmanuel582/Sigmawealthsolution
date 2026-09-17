import { NextRequest, NextResponse } from 'next/server'
import { verifyStripeCheckout } from '@/lib/sigma/stripeServer'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await verifyStripeCheckout(body)
    return NextResponse.json(result.json, { status: result.status })
  } catch (err: any) {
    console.error('stripe verify', err)
    return NextResponse.json(
      { message: err?.message || 'Payment verification failed' },
      { status: 500 }
    )
  }
}
