import { NextRequest, NextResponse } from 'next/server'
import { initiateStripeCheckout } from '@/lib/sigma/stripeServer'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await initiateStripeCheckout(body)
    return NextResponse.json(result.json, { status: result.status })
  } catch (err: any) {
    console.error('stripe initiate', err)
    return NextResponse.json(
      { message: err?.message || 'Failed to initiate payment' },
      { status: 500 }
    )
  }
}
