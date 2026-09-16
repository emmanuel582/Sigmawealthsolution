import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
/** Charge / settle currency — default NGN; override with STRIPE_CURRENCY=usd if your Stripe account requires it */
export const STRIPE_CURRENCY = (process.env.STRIPE_CURRENCY || 'ngn').toLowerCase();

let stripeSingleton: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(STRIPE_SECRET_KEY && STRIPE_SECRET_KEY.startsWith('sk_'));
}

export function isStripeTestMode(): boolean {
  return STRIPE_SECRET_KEY.includes('_test_') || process.env.STRIPE_MODE === 'test';
}

/** Local/dev without keys — payments complete in-process so flows can be tested */
export function isStripeSimulateMode(): boolean {
  if (process.env.STRIPE_SIMULATE_PAYMENTS === '1') return true;
  if (process.env.STRIPE_SIMULATE_PAYMENTS === '0') return false;
  return !isStripeConfigured();
}

export function getStripe(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY.');
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
      typescript: true,
    });
  }
  return stripeSingleton;
}

export function getStripePublishableKey(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || '';
}

export function toMinorUnits(amountMajor: number): number {
  return Math.round(Number(amountMajor) * 100);
}

export function fromMinorUnits(amountMinor: number): number {
  return Math.round(Number(amountMinor)) / 100;
}

export async function ensureStripeCustomer(params: {
  customerId?: string | null;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}): Promise<string> {
  if (isStripeSimulateMode()) {
    return params.customerId || `cus_sim_${Buffer.from(params.email).toString('hex').slice(0, 14)}`;
  }
  const stripe = getStripe();
  if (params.customerId) {
    try {
      const existing = await stripe.customers.retrieve(params.customerId);
      if (!('deleted' in existing) || !existing.deleted) return existing.id;
    } catch {
      /* create new */
    }
  }
  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name || undefined,
    metadata: params.metadata || {},
  });
  return customer.id;
}

/** One-time or first recurring fund — saves card when setup_future_usage is set */
export async function createFundPaymentIntent(params: {
  amountMajor: number;
  customerId: string;
  email: string;
  metadata: Record<string, string>;
  saveCard?: boolean;
}): Promise<{ clientSecret: string; paymentIntentId: string; simulated?: boolean }> {
  if (isStripeSimulateMode()) {
    const paymentIntentId = `pi_sim_${Date.now()}`;
    return {
      clientSecret: `${paymentIntentId}_secret_sim`,
      paymentIntentId,
      simulated: true,
    };
  }
  const stripe = getStripe();
  const intent = await stripe.paymentIntents.create({
    amount: toMinorUnits(params.amountMajor),
    currency: STRIPE_CURRENCY,
    customer: params.customerId,
    receipt_email: params.email,
    automatic_payment_methods: { enabled: true },
    setup_future_usage: params.saveCard ? 'off_session' : undefined,
    metadata: params.metadata,
  });
  if (!intent.client_secret) throw new Error('Stripe did not return a client secret');
  return { clientSecret: intent.client_secret, paymentIntentId: intent.id };
}

/**
 * Hosted Checkout — best UX for card + 3DS. Saves PM when saveCard is true.
 */
export async function createCheckoutSession(params: {
  amountMajor: number;
  customerId: string;
  email: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
  saveCard?: boolean;
  productName?: string;
}): Promise<{ sessionId: string; url: string | null; simulated?: boolean; paymentIntentId?: string }> {
  if (isStripeSimulateMode()) {
    const sessionId = `cs_sim_${Date.now()}`;
    const paymentIntentId = `pi_sim_${Date.now()}`;
    return {
      sessionId,
      url: null,
      simulated: true,
      paymentIntentId,
    };
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: params.customerId,
    customer_email: undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: STRIPE_CURRENCY,
          unit_amount: toMinorUnits(params.amountMajor),
          product_data: {
            name: params.productName || 'Sigma Wealth investment',
          },
        },
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    payment_intent_data: {
      setup_future_usage: params.saveCard ? 'off_session' : undefined,
      metadata: params.metadata,
      receipt_email: params.email,
    },
    metadata: params.metadata,
  });

  return { sessionId: session.id, url: session.url };
}

/**
 * Auto-debit enrollment: charge the minimum now (card is saved) and attach PM for future off-session charges.
 */
export async function createAutoDebitEnrollmentIntent(params: {
  minChargeMajor: number;
  customerId: string;
  email: string;
  metadata: Record<string, string>;
}): Promise<{ clientSecret: string; paymentIntentId: string; simulated?: boolean }> {
  return createFundPaymentIntent({
    amountMajor: params.minChargeMajor,
    customerId: params.customerId,
    email: params.email,
    metadata: params.metadata,
    saveCard: true,
  });
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  if (isStripeSimulateMode() || paymentIntentId.startsWith('pi_sim_')) {
    return {
      id: paymentIntentId,
      status: 'succeeded',
      amount: 0,
      currency: STRIPE_CURRENCY,
      payment_method: `pm_sim_${paymentIntentId.slice(-8)}`,
      customer: null,
      metadata: {},
      latest_charge: null,
    } as unknown as Stripe.PaymentIntent;
  }
  return getStripe().paymentIntents.retrieve(paymentIntentId, {
    expand: ['payment_method', 'latest_charge'],
  });
}

export async function retrieveCheckoutSession(sessionId: string) {
  if (isStripeSimulateMode() || sessionId.startsWith('cs_sim_')) {
    return {
      id: sessionId,
      payment_status: 'paid',
      status: 'complete',
      amount_total: 0,
      currency: STRIPE_CURRENCY,
      payment_intent: `pi_sim_${sessionId.slice(-10)}`,
      customer: null,
      metadata: {},
    } as unknown as Stripe.Checkout.Session;
  }
  return getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent', 'payment_intent.payment_method'],
  });
}

export async function chargeSavedPaymentMethodOffSession(params: {
  amountMajor: number;
  customerId: string;
  paymentMethodId: string;
  metadata: Record<string, string>;
}): Promise<Stripe.PaymentIntent> {
  if (isStripeSimulateMode() || params.paymentMethodId.startsWith('pm_sim_')) {
    return {
      id: `pi_sim_ad_${Date.now()}`,
      status: 'succeeded',
      amount: toMinorUnits(params.amountMajor),
      currency: STRIPE_CURRENCY,
      payment_method: params.paymentMethodId,
      customer: params.customerId,
      metadata: params.metadata,
    } as unknown as Stripe.PaymentIntent;
  }
  const stripe = getStripe();
  return stripe.paymentIntents.create({
    amount: toMinorUnits(params.amountMajor),
    currency: STRIPE_CURRENCY,
    customer: params.customerId,
    payment_method: params.paymentMethodId,
    off_session: true,
    confirm: true,
    metadata: params.metadata,
  });
}

export function constructStripeWebhookEvent(rawBody: Buffer | string, signature: string): Stripe.Event {
  const stripe = getStripe();
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }
  return stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
}

export function cardBrandLast4FromPaymentMethod(pm: Stripe.PaymentMethod | string | null | undefined): {
  brand: string;
  last4: string;
  paymentMethodId: string | null;
} {
  if (!pm || typeof pm === 'string') {
    return { brand: 'Card', last4: '****', paymentMethodId: typeof pm === 'string' ? pm : null };
  }
  return {
    brand: pm.card?.brand || 'Card',
    last4: pm.card?.last4 || '****',
    paymentMethodId: pm.id,
  };
}

/**
 * Stripe cannot send to arbitrary Nigerian NUBAN accounts from a standard Stripe balance
 * without Connect / Global Payouts. We store destination details and:
 * - test mode / STRIPE_SIMULATE_PAYOUTS=1 → mark transfer successful for ops testing
 * - live with STRIPE_CONNECT_ENABLED → create a Transfer to connected account if stripe_account_id exists
 *
 * Destinations Stripe can pay (via Connect / Global Payouts):
 * - US: routing number + account number (ACH)
 * - NG: NUBAN + bank code (Global Payouts where enabled)
 * - EU/UK/others: IBAN (+ BIC/SWIFT)
 */
export async function sendInvestorPayout(params: {
  amountMajor: number;
  currency?: string;
  stripeAccountId?: string | null;
  description: string;
  metadata?: Record<string, string>;
}): Promise<{ success: boolean; transferId: string; simulated: boolean; message?: string }> {
  const simulate =
    isStripeTestMode() ||
    isStripeSimulateMode() ||
    process.env.STRIPE_SIMULATE_PAYOUTS === '1' ||
    process.env.NODE_ENV !== 'production';

  if (params.stripeAccountId && process.env.STRIPE_CONNECT_ENABLED === '1' && isStripeConfigured()) {
    try {
      const transfer = await getStripe().transfers.create({
        amount: toMinorUnits(params.amountMajor),
        currency: (params.currency || STRIPE_CURRENCY).toLowerCase(),
        destination: params.stripeAccountId,
        description: params.description.slice(0, 500),
        metadata: params.metadata || {},
      });
      return { success: true, transferId: transfer.id, simulated: false };
    } catch (err: any) {
      if (!simulate) {
        return {
          success: false,
          transferId: '',
          simulated: false,
          message: err.message || 'Stripe transfer failed',
        };
      }
    }
  }

  if (simulate || !isStripeConfigured()) {
    return {
      success: true,
      transferId: `sim_po_${Date.now()}`,
      simulated: true,
      message:
        'Payout recorded. Live bank deposits require Stripe Connect / Global Payouts (US: routing+account; NG: NUBAN via Global Payouts; EU: IBAN).',
    };
  }

  return {
    success: false,
    transferId: '',
    simulated: false,
    message:
      'Live investor bank payouts need Stripe Connect or Global Payouts. Set STRIPE_CONNECT_ENABLED=1 with connected accounts, or STRIPE_SIMULATE_PAYOUTS=1 for ops simulation.',
  };
}

export type PayoutDestinationInput = {
  country: string;
  currency: string;
  accountHolderName: string;
  /** US */
  routingNumber?: string;
  accountNumber?: string;
  /** NG */
  bankCode?: string;
  bankName?: string;
  /** EU / UK / others */
  iban?: string;
  bic?: string;
  stripeAccountId?: string | null;
};

export function validatePayoutDestination(d: PayoutDestinationInput): string | null {
  const country = String(d.country || '').toUpperCase();
  if (!d.accountHolderName?.trim()) return 'Account holder name is required';
  if (!country || country.length !== 2) return 'Select a valid country (ISO-2, e.g. NG, US, GB)';

  if (country === 'US') {
    if (!d.routingNumber || !/^\d{9}$/.test(d.routingNumber)) return 'US routing number must be 9 digits';
    if (!d.accountNumber || d.accountNumber.replace(/\D/g, '').length < 4) return 'US account number is required';
    return null;
  }
  if (country === 'NG') {
    if (!d.accountNumber || !/^\d{10}$/.test(d.accountNumber)) return 'Nigerian NUBAN must be 10 digits';
    if (!d.bankCode && !d.bankName) return 'Select a Nigerian bank';
    return null;
  }
  if (d.iban && d.iban.replace(/\s/g, '').length >= 15) return null;
  if (d.accountNumber && d.bic) return null;
  return 'Provide IBAN (recommended) or account number + BIC/SWIFT for this country';
}

export function hasValidPayoutDestination(bank: any): boolean {
  if (!bank) return false;
  const country = String(bank.country || 'NG').toUpperCase();
  if (country === 'US') {
    return Boolean(bank.routing_number && bank.account_number && bank.account_name);
  }
  if (country === 'NG') {
    return Boolean(bank.account_number && (bank.bank_code || bank.bank_name) && bank.account_name);
  }
  return Boolean((bank.iban && String(bank.iban).replace(/\s/g, '').length >= 15) || (bank.account_number && bank.bic));
}
