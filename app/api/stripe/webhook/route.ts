import { NextRequest, NextResponse } from 'next/server'
import {
  constructStripeWebhookEvent,
  retrieveCheckoutSession,
  fromMinorUnits,
  isStripeConfigured,
} from '@/server/lib/stripePayments'
import { verifyStripeCheckout } from '@/lib/sigma/stripeServer'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ message: 'Stripe not configured' }, { status: 503 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ message: 'Missing stripe-signature' }, { status: 400 })
  }

  try {
    const rawBody = Buffer.from(await req.arrayBuffer())
    const event = constructStripeWebhookEvent(rawBody, signature)

    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      const session = event.data.object as any
      const meta = (session.metadata || {}) as Record<string, string>
      const full = await retrieveCheckoutSession(session.id)
      const currency = (meta.currency || full.currency || 'ngn').toLowerCase()
      const amount =
        full.amount_total != null
          ? fromMinorUnits(full.amount_total, currency)
          : Number(meta.chargeAmount || 0)

      await verifyStripeCheckout({
        sessionId: session.id,
        userId: meta.userId,
        email: full.customer_details?.email || full.customer_email || undefined,
        amount,
        phase: meta.phase,
        isRecurringPlan: meta.isRecurringPlan === 'true',
        monthlyPlanAmount: meta.monthlyPlanAmount ? Number(meta.monthlyPlanAmount) : undefined,
        txRef: meta.reference,
      })
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('stripe webhook', err)
    return NextResponse.json({ message: err?.message || 'Webhook error' }, { status: 400 })
  }
}
