import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  isStripeConfigured,
  isStripeLiveMode,
  isStripeTestMode,
  getStripePublishableKey,
  ensureStripeCustomer,
  createCheckoutSession,
  createSetupCheckoutSession,
  retrieveCheckoutSession,
  retrievePaymentIntent,
  retrieveSetupIntent,
  cardBrandLast4FromPaymentMethod,
  createConnectExpressAccount,
  createConnectOnboardingLink,
  assertMinDepositMajor,
  minDepositMajor,
  setupFeeMajor,
  fromMinorUnits,
  getFrontendBaseUrl,
  getStripeWebhookUrl,
  getStripeSuccessUrl,
  getStripeCancelUrl,
  productionStripeHints,
  STRIPE_CURRENCY,
  MIN_DEPOSIT_NGN,
  MIN_DEPOSIT_USD,
  currencyForCountry,
} from '@/server/lib/stripePayments'

const FRONTEND_CURRENCY = 'ngn'

function admin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!url || !key || key.length < 40) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
}

export function publicStripeConfig() {
  const hints = productionStripeHints()
  const secretPresent = isStripeConfigured()
  const publishable = getStripePublishableKey() || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
  return {
    stripeConfigured: secretPresent,
    stripeLive: isStripeLiveMode(),
    stripeSimulate: false,
    stripeTestMode: isStripeTestMode(),
    stripePublishableKey: publishable,
    stripeCurrency: FRONTEND_CURRENCY,
    stripeSecretPresent: secretPresent,
    stripePublishablePresent: Boolean(publishable.startsWith('pk_')),
    flutterwaveConfigured: secretPresent,
    flutterwaveSandbox: false,
    opayAccountName: process.env.OPAY_ACCOUNT_NAME || 'SigmawealthSolution',
    opayAccountNumber: process.env.OPAY_ACCOUNT_NUMBER || '',
    opayBankName: process.env.OPAY_BANK_NAME || 'OPay',
    isSupabaseLive: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    minDepositNgn: MIN_DEPOSIT_NGN,
    minDepositUsd: MIN_DEPOSIT_USD,
    minDepositByCurrency: {
      ngn: MIN_DEPOSIT_NGN,
      usd: MIN_DEPOSIT_USD,
    },
    autoDebitSetupFeeNgn: Number(process.env.AUTO_DEBIT_SETUP_FEE_NGN || 1),
    referralRate: 0.05,
    frontendUrl: getFrontendBaseUrl(),
    stripeWebhookUrl: getStripeWebhookUrl(),
    stripeSuccessUrlTemplate: hints.successUrlExample,
    stripeCancelUrl: hints.cancelUrl,
    stripeConnectReturnUrl: hints.connectReturnUrl,
    payoutHint: hints.note,
  }
}

async function investorAlreadyFunded(userId?: string, email?: string): Promise<boolean> {
  const sb = admin()
  if (!sb || !userId || !isUuid(userId)) return false
  const { data: profile } = await sb.from('profiles').select('total_invested').eq('id', userId).maybeSingle()
  if (Number(profile?.total_invested || 0) > 0) return true
  const { data: pays } = await sb
    .from('payments')
    .select('id, amount, status')
    .eq('user_id', userId)
    .eq('status', 'successful')
    .limit(5)
  return Boolean(pays?.some((p) => Number(p.amount || 0) > 0))
}

async function hasSavedCard(userId?: string): Promise<boolean> {
  const sb = admin()
  if (!sb || !userId || !isUuid(userId)) return false
  const { data } = await sb
    .from('card_details')
    .select('stripe_payment_method_id, flutterwave_card_token')
    .eq('user_id', userId)
    .maybeSingle()
  return Boolean(data?.stripe_payment_method_id || data?.flutterwave_card_token)
}

export async function initiateStripeCheckout(body: {
  userId?: string
  email?: string
  name?: string
  amount?: number
  phase?: string
  isRecurringPlan?: boolean
  monthlyPlanAmount?: number
  saveCard?: boolean
  setupMode?: boolean
  currency?: string
}) {
  if (!body.email) {
    return { status: 400, json: { message: 'Valid email is required.' } }
  }
  if (!isStripeConfigured()) {
    return {
      status: 503,
      json: {
        message:
          'Stripe is not configured on Vercel. Set STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.',
        webhookUrl: getStripeWebhookUrl(),
      },
    }
  }

  // Frontend always settles in Naira
  const currency = FRONTEND_CURRENCY
  const isRecurring = Boolean(body.isRecurringPlan)
  const planAmount = Number(body.monthlyPlanAmount || body.amount || 0)
  const chargeAmount = Number(body.amount || 0)
  const userId = body.userId || ''
  const alreadyFunded = await investorAlreadyFunded(userId, body.email)
  const cardOnFile = await hasSavedCard(userId)

  if (isRecurring && cardOnFile && planAmount > 0) {
    const minErr = assertMinDepositMajor(planAmount, currency)
    if (minErr) return { status: 400, json: { message: minErr } }
    const sb = admin()
    const now = new Date()
    const nextCharge = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
      .toISOString()
      .split('T')[0]
    const reminder = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate() - 1)
      .toISOString()
      .split('T')[0]
    const plan = {
      user_id: userId,
      amount: planAmount,
      currency: 'NGN',
      active: true,
      next_charge_date: nextCharge,
      reminder_date: reminder,
      updated_at: new Date().toISOString(),
    }
    if (sb && isUuid(userId)) {
      await sb.from('profiles').update({ payment_plan_id: `auto-${planAmount}` }).eq('id', userId)
      // best-effort; table may not exist on older schemas
      try {
        await sb.from('auto_debit_plans').upsert({ ...plan, created_at: new Date().toISOString() })
      } catch {
        /* optional table */
      }
    }
    return {
      status: 200,
      json: {
        success: true,
        completed: true,
        redirectUrl: null,
        amountCharged: 0,
        monthlyPlanAmount: planAmount,
        message: 'Auto-debit activated on your saved card. No extra charge.',
        plan,
      },
    }
  }

  if (isRecurring) {
    const minErr = assertMinDepositMajor(planAmount, currency)
    if (minErr) return { status: 400, json: { message: minErr } }
  } else {
    if (!chargeAmount || chargeAmount <= 0) {
      return { status: 400, json: { message: 'Valid amount is required.' } }
    }
    const minErr = assertMinDepositMajor(chargeAmount, currency)
    if (minErr) return { status: 400, json: { message: minErr } }
  }

  const useSetupOnly = Boolean(body.setupMode) || (isRecurring && alreadyFunded)
  const setupFee = setupFeeMajor(currency)
  const effectiveCharge = useSetupOnly
    ? process.env.AUTO_DEBIT_USE_SETUP_INTENT === '0'
      ? setupFee
      : 0
    : isRecurring
      ? minDepositMajor(currency)
      : chargeAmount

  const reference = `SIGMA${Date.now()}${Math.random().toString(36).slice(2, 10)}`

  const sb = admin()
  let existingCustomerId: string | null = null
  if (sb && userId && isUuid(userId)) {
    const { data: card } = await sb
      .from('card_details')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle()
    existingCustomerId = card?.stripe_customer_id || null
  }

  const customerId = await ensureStripeCustomer({
    customerId: existingCustomerId,
    email: String(body.email).trim(),
    name: body.name || 'Investor',
    metadata: { userId: String(userId || '') },
  })

  const metadata = {
    userId: String(userId || ''),
    reference,
    phase: String(body.phase || 'Active Plan'),
    isRecurringPlan: isRecurring ? 'true' : 'false',
    monthlyPlanAmount: String(isRecurring ? planAmount : ''),
    chargeAmount: String(effectiveCharge),
    currency,
    setupOnly: useSetupOnly ? 'true' : 'false',
    creditInvestment: useSetupOnly ? 'false' : 'true',
  }

  const successUrl = getStripeSuccessUrl(reference)
  const cancelUrl = getStripeCancelUrl()

  let session: { sessionId: string; url: string | null; mode: string }

  if (useSetupOnly && process.env.AUTO_DEBIT_USE_SETUP_INTENT !== '0') {
    session = await createSetupCheckoutSession({
      customerId,
      email: String(body.email).trim(),
      successUrl,
      cancelUrl,
      metadata,
      currency,
    })
  } else if (useSetupOnly) {
    session = await createCheckoutSession({
      amountMajor: setupFee,
      currency,
      customerId,
      email: String(body.email).trim(),
      successUrl,
      cancelUrl,
      metadata: { ...metadata, chargeAmount: String(setupFee), creditInvestment: 'false' },
      saveCard: true,
      productName: `Auto-debit card setup (₦${setupFee})`,
    })
  } else {
    session = await createCheckoutSession({
      amountMajor: effectiveCharge,
      currency,
      customerId,
      email: String(body.email).trim(),
      successUrl,
      cancelUrl,
      metadata,
      saveCard: isRecurring || Boolean(body.saveCard),
      productName: isRecurring
        ? `Auto-debit enrollment ₦${effectiveCharge.toLocaleString()}`
        : `Investment deposit ₦${effectiveCharge.toLocaleString()}`,
    })
  }

  if (sb && userId && isUuid(userId)) {
    await sb.from('card_details').upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    })
  }

  return {
    status: 200,
    json: {
      success: true,
      chargeId: session.sessionId,
      sessionId: session.sessionId,
      reference,
      status: 'pending',
      redirectUrl: session.url,
      completed: false,
      amountCharged: effectiveCharge,
      monthlyPlanAmount: isRecurring ? planAmount : null,
      setupOnly: useSetupOnly,
      mode: session.mode,
      currency: 'NGN',
      webhookUrl: getStripeWebhookUrl(),
      successUrl,
      cancelUrl,
    },
  }
}

export async function verifyStripeCheckout(body: {
  chargeId?: string
  sessionId?: string
  transactionId?: string
  txRef?: string
  userId?: string
  email?: string
  name?: string
  amount?: number
  phase?: string
  isRecurringPlan?: boolean
  monthlyPlanAmount?: number
}) {
  if (!body.userId && !body.email) {
    return { status: 400, json: { message: 'Missing user identification' } }
  }
  if (!isStripeConfigured()) {
    return { status: 503, json: { message: 'Stripe is not configured.' } }
  }

  const resolvedSessionId =
    body.sessionId || (String(body.chargeId || '').startsWith('cs_') ? body.chargeId : null)

  let verifiedAmount = Number(body.amount) || 0
  let resolvedTxRef = body.txRef || `SIGMA_${Date.now()}`
  let resolvedPi = ''
  let cardLast4 = '****'
  let cardBrand = 'Card'
  let cardToken: string | null = null
  let customerId: string | null = null
  let recurring = Boolean(body.isRecurringPlan)
  let planAmt = Number(body.monthlyPlanAmount || 0) || undefined
  let creditInvestment = true
  let currency = FRONTEND_CURRENCY

  if (resolvedSessionId) {
    const session = await retrieveCheckoutSession(String(resolvedSessionId))
    if (session.status === 'open') {
      return { status: 402, json: { message: 'Payment not completed yet.' } }
    }
    const meta = (session.metadata || {}) as Record<string, string>
    resolvedTxRef = meta.reference || resolvedTxRef
    recurring = meta.isRecurringPlan === 'true' || recurring
    planAmt = Number(meta.monthlyPlanAmount || planAmt || 0) || undefined
    currency = (meta.currency || FRONTEND_CURRENCY).toLowerCase()
    creditInvestment = meta.creditInvestment !== 'false' && meta.setupOnly !== 'true' && session.mode !== 'setup'
    customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || null

    if (session.mode === 'setup') {
      creditInvestment = false
      const si =
        typeof session.setup_intent === 'string'
          ? await retrieveSetupIntent(session.setup_intent)
          : session.setup_intent
      if (si && typeof si !== 'string') {
        const pm = si.payment_method
        const info = cardBrandLast4FromPaymentMethod(typeof pm === 'string' ? pm : pm)
        cardBrand = info.brand
        cardLast4 = info.last4
        cardToken = info.paymentMethodId
        customerId = (typeof si.customer === 'string' ? si.customer : si.customer?.id) || customerId
      }
    } else {
      verifiedAmount =
        session.amount_total != null
          ? fromMinorUnits(session.amount_total, currency)
          : Number(meta.chargeAmount || verifiedAmount || 0)
      const pi =
        typeof session.payment_intent === 'string'
          ? await retrievePaymentIntent(session.payment_intent)
          : session.payment_intent
      if (pi && typeof pi !== 'string') {
        resolvedPi = pi.id
        const pm = pi.payment_method
        const info = cardBrandLast4FromPaymentMethod(typeof pm === 'string' ? pm : pm)
        cardBrand = info.brand
        cardLast4 = info.last4
        cardToken = info.paymentMethodId
      }
    }
  } else if (body.chargeId || body.transactionId) {
    const pi = await retrievePaymentIntent(String(body.transactionId || body.chargeId))
    resolvedPi = pi.id
    currency = (pi.currency || FRONTEND_CURRENCY).toLowerCase()
    verifiedAmount = fromMinorUnits(pi.amount, currency)
    const meta = (pi.metadata || {}) as Record<string, string>
    resolvedTxRef = meta.reference || resolvedTxRef
    creditInvestment = meta.creditInvestment !== 'false'
    const info = cardBrandLast4FromPaymentMethod(pi.payment_method as any)
    cardBrand = info.brand
    cardLast4 = info.last4
    cardToken = info.paymentMethodId
    customerId = typeof pi.customer === 'string' ? pi.customer : null
  } else {
    return { status: 400, json: { message: 'sessionId or chargeId required' } }
  }

  const userId = body.userId || ''
  const sb = admin()
  const creditAmt = creditInvestment ? verifiedAmount : 0

  let profile: any = null
  let investment: any = null
  let payment: any = null

  if (sb && userId && isUuid(userId)) {
    const { data: existingProfile } = await sb.from('profiles').select('*').eq('id', userId).maybeSingle()
    const prevInvested = Number(existingProfile?.total_invested || 0)
    const nextInvested = prevInvested + creditAmt
    const phase = body.phase || existingProfile?.current_phase || 'Active Plan'

    await sb.from('profiles').upsert({
      id: userId,
      name: body.name || existingProfile?.name || 'Investor',
      email: body.email || existingProfile?.email || '',
      total_invested: nextInvested,
      current_phase: phase,
      updated_at: new Date().toISOString(),
    })

    profile = {
      id: userId,
      name: body.name || existingProfile?.name,
      email: body.email || existingProfile?.email,
      total_invested: nextInvested,
      current_phase: phase,
    }

    if (creditAmt > 0) {
      const start = new Date().toISOString().split('T')[0]
      const nextPay = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
      const invPayload: any = {
        user_id: userId,
        amount: nextInvested,
        phase,
        type: recurring ? 'recurring' : 'one-time',
        status: 'active',
        start_date: start,
        next_payment_date: nextPay,
        cycle_count: 1,
      }
      await sb.from('investments').upsert(invPayload, { onConflict: 'user_id' })
      investment = invPayload

      payment = {
        id: crypto.randomUUID(),
        user_id: userId,
        amount: creditAmt,
        method: 'card',
        flutterwave_tx_ref: resolvedTxRef,
        status: 'successful',
        notes: `Stripe ${resolvedPi || resolvedSessionId}`,
        created_at: new Date().toISOString(),
      }
      await sb.from('payments').insert(payment)
    }

    if (cardToken || customerId) {
      await sb.from('card_details').upsert({
        user_id: userId,
        card_last4: cardLast4,
        card_brand: cardBrand,
        stripe_payment_method_id: cardToken,
        stripe_customer_id: customerId,
        flutterwave_card_token: cardToken,
        flutterwave_customer_id: customerId,
        updated_at: new Date().toISOString(),
      })
    }

    if (recurring && planAmt && planAmt > 0) {
      try {
        const now = new Date()
        await sb.from('auto_debit_plans').upsert({
          user_id: userId,
          amount: planAmt,
          currency: 'NGN',
          active: true,
          next_charge_date: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
            .toISOString()
            .split('T')[0],
          updated_at: new Date().toISOString(),
        })
      } catch {
        /* optional */
      }
    }
  }

  return {
    status: 200,
    json: {
      success: true,
      message: creditInvestment
        ? `Payment of ₦${Number(creditAmt).toLocaleString()} confirmed.`
        : 'Card saved for auto-debit.',
      payment,
      investment,
      profile,
      amountCharged: creditAmt,
      monthlyPlanAmount: planAmt || null,
      currency: 'NGN',
    },
  }
}

export async function startConnectOnboarding(body: {
  userId?: string
  email?: string
  country?: string
  accountName?: string
}) {
  if (!body.userId || !body.email) {
    return { status: 400, json: { message: 'userId and email are required' } }
  }
  if (!isStripeConfigured()) {
    return { status: 503, json: { message: 'Stripe is not configured on Vercel. Set STRIPE_SECRET_KEY.' } }
  }

  const destCountry = String(body.country || 'NG').toUpperCase()
  const sb = admin()
  let accountId: string | undefined

  if (sb && isUuid(body.userId)) {
    const { data: bank } = await sb
      .from('bank_details')
      .select('*')
      .eq('user_id', body.userId)
      .maybeSingle()
    accountId = bank?.stripe_account_id || undefined
  }

  if (!accountId) {
    accountId = await createConnectExpressAccount({
      email: String(body.email).trim(),
      country: destCountry,
      userId: String(body.userId),
    })
  }

  const frontend = getFrontendBaseUrl()
  const url = await createConnectOnboardingLink({
    accountId,
    refreshUrl: `${frontend}/dashboard?connect_refresh=1`,
    returnUrl: `${frontend}/dashboard?connect_return=1`,
  })

  if (sb && isUuid(body.userId)) {
    await sb.from('bank_details').upsert({
      user_id: body.userId,
      country: destCountry,
      currency: currencyForCountry(destCountry),
      account_name: body.accountName || 'Investor',
      stripe_account_id: accountId,
      updated_at: new Date().toISOString(),
    })
  }

  return {
    status: 200,
    json: {
      success: true,
      stripeAccountId: accountId,
      onboardingUrl: url,
      message: 'Complete Stripe Connect onboarding to link your bank for payouts.',
    },
  }
}
