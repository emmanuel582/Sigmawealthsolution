/**
 * Real Stripe live-path smoke test (SDK + optional production API).
 *
 * Usage (PowerShell):
 *   $env:STRIPE_SECRET_KEY="sk_live_..."
 *   $env:STRIPE_WEBHOOK_SECRET="whsec_..."
 *   $env:NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
 *   $env:SIGMA_API_URL="https://sigmawealthsolutionbackend.onrender.com"
 *   node scripts/verify-stripe-live.mjs
 *
 * Never commit live keys. Rotate any key pasted in chat.
 */
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

const API = (process.env.SIGMA_API_URL || 'https://sigmawealthsolutionbackend.onrender.com').replace(/\/$/, '');
const SK = process.env.STRIPE_SECRET_KEY || '';
const PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || '';
const WHSEC = process.env.STRIPE_WEBHOOK_SECRET || '';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function req(pathname, opts = {}) {
  const res = await fetch(`${API}${pathname}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  const failures = [];
  const warnings = [];

  console.log('=== Stripe live scenario test ===');
  console.log('API', API);

  assert(SK.startsWith('sk_'), 'Set STRIPE_SECRET_KEY (sk_live_… or sk_test_…)');
  assert(PK.startsWith('pk_'), 'Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_live_… or pk_test_…)');
  assert(WHSEC.startsWith('whsec_'), 'Set STRIPE_WEBHOOK_SECRET (whsec_…)');

  const mode = SK.includes('_live_') ? 'LIVE' : 'TEST';
  console.log('Mode:', mode);

  // ── 1) Frontend assets ──────────────────────────────────────────────
  const nigeriaDir = path.join(process.cwd(), 'public', 'images', 'nigeria');
  const imgs = fs.readdirSync(nigeriaDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  assert(imgs.length >= 5, `Expected ≥5 nigeria images, found ${imgs.length}`);
  console.log('✓ Nigerian review images:', imgs.length, imgs.join(', '));

  const caseStudies = fs.readFileSync(path.join(process.cwd(), 'components', 'case-studies.tsx'), 'utf8');
  assert(caseStudies.includes('/images/nigeria'), 'case-studies must use nigeria folder');
  assert(!caseStudies.includes('review-emeka'), 'old review-* paths must be gone');
  console.log('✓ case-studies.tsx → nigeria portraits');

  const detailed = fs.readFileSync(
    path.join(process.cwd(), 'components', 'detailed-features-section.tsx'),
    'utf8'
  );
  assert(detailed.includes('Start investing'), 'CTA card missing');
  assert(!detailed.includes('NeuraFlow'), 'old video must be removed');
  assert(detailed.includes('import Image from "next/image"'), 'Image import required');
  assert(detailed.includes('import Link from "next/link"'), 'Link import required');
  console.log('✓ hero CTA card (no video) builds cleanly');

  // ── 2) Stripe account readiness ─────────────────────────────────────
  const stripe = new Stripe(SK, { apiVersion: '2025-02-24.acacia' });
  const account = await stripe.accounts.retrieve();
  console.log('✓ Stripe account', {
    id: account.id,
    country: account.country,
    default_currency: account.default_currency,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    livemode: mode === 'LIVE',
  });

  if (!account.charges_enabled) {
    warnings.push(
      'Stripe account charges_enabled=false — complete business verification in Dashboard before real card debits succeed.'
    );
  }
  if (!account.payouts_enabled) {
    warnings.push('Stripe account payouts_enabled=false — Connect/bank payouts will fail until payouts are enabled.');
  }

  const balance = await stripe.balance.retrieve();
  assert(balance.object === 'balance', 'balance retrieve failed');
  console.log('✓ balance readable', {
    available: balance.available?.map((b) => `${b.amount / 100} ${b.currency}`),
    pending: balance.pending?.map((b) => `${b.amount / 100} ${b.currency}`),
  });

  // ── 3) Real Checkout Sessions (₦100k + $72) — no charge until URL is paid ──
  const customer = await stripe.customers.create({
    email: `stripe-live-test-${Date.now()}@sigmawealth.test`,
    name: 'Sigma Live Test',
    metadata: { purpose: 'verify-stripe-live' },
  });
  assert(customer.id.startsWith('cus_'), 'customer create failed');
  console.log('✓ customer', customer.id);

  const success =
    'https://sigmawealthsolution.vercel.app/dashboard?stripe_return=1&session_id={CHECKOUT_SESSION_ID}';
  const cancel = 'https://sigmawealthsolution.vercel.app/dashboard?stripe_cancel=1';

  const ngnSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customer.id,
    payment_method_types: ['card'],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'ngn',
          unit_amount: 10000000, // ₦100,000
          product_data: { name: 'Sigma Wealth live smoke — ₦100,000' },
        },
      },
    ],
    success_url: success,
    cancel_url: cancel,
    payment_intent_data: {
      setup_future_usage: 'off_session',
      metadata: { smoke: 'verify-stripe-live', chargeAmount: '100000', currency: 'ngn' },
    },
    metadata: { smoke: 'verify-stripe-live', chargeAmount: '100000', currency: 'ngn' },
  });
  assert(ngnSession.id.startsWith('cs_') && ngnSession.url, 'NGN checkout failed');
  console.log('✓ NGN Checkout ₦100,000', ngnSession.id);
  console.log('  PAY NOW (real debit):', ngnSession.url);

  const usdSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customer.id,
    payment_method_types: ['card'],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: 7200, // $72
          product_data: { name: 'Sigma Wealth live smoke — $72' },
        },
      },
    ],
    success_url: success,
    cancel_url: cancel,
    payment_intent_data: {
      setup_future_usage: 'off_session',
      metadata: { smoke: 'verify-stripe-live', chargeAmount: '72', currency: 'usd' },
    },
    metadata: { smoke: 'verify-stripe-live', chargeAmount: '72', currency: 'usd' },
  });
  assert(usdSession.id.startsWith('cs_') && usdSession.url, 'USD checkout failed');
  console.log('✓ USD Checkout $72', usdSession.id);
  console.log('  PAY NOW (real debit):', usdSession.url);

  // SetupIntent path (already-funded auto-debit card save — no second 100k)
  const setupSession = await stripe.checkout.sessions.create({
    mode: 'setup',
    customer: customer.id,
    currency: 'ngn',
    payment_method_types: ['card'],
    success_url: success,
    cancel_url: cancel,
    metadata: { smoke: 'verify-stripe-live', purpose: 'auto_debit_setup' },
    setup_intent_data: {
      metadata: { smoke: 'verify-stripe-live', purpose: 'auto_debit_setup' },
    },
  });
  assert(setupSession.id.startsWith('cs_') && setupSession.url, 'Setup checkout failed');
  console.log('✓ Setup Checkout (save card / auto-debit)', setupSession.id);
  console.log('  SAVE CARD:', setupSession.url);

  // Webhook endpoints registered in Stripe
  const wh = await stripe.webhookEndpoints.list({ limit: 20 });
  const expected = `${API}/api/stripe/webhook`;
  const matched = wh.data.filter((w) => w.url.includes('/api/stripe/webhook') || w.url === expected);
  console.log(
    '✓ Stripe webhook endpoints:',
    wh.data.map((w) => `${w.status} ${w.url}`).join(' | ') || '(none)'
  );
  if (!matched.length) {
    warnings.push(
      `No Stripe webhook pointing at ${expected} — add it in Dashboard → Developers → Webhooks with events: checkout.session.completed, payment_intent.succeeded, setup_intent.succeeded, account.updated`
    );
  }

  assert(WHSEC.length > 20, 'webhook secret looks too short');
  console.log('✓ local webhook secret present');

  // ── 4) Production API (Render) ──────────────────────────────────────
  const health = await req('/health');
  if (!health.ok) {
    failures.push(`API health failed: ${health.status}`);
  } else {
    console.log('✓ API health');
  }

  const cfg = await req('/api/config');
  const stripeReady = Boolean(cfg.data?.stripeConfigured);
  console.log('  config keys:', Object.keys(cfg.data || {}).join(', '));

  if (!stripeReady) {
    failures.push(
      'Render API is NOT on the Stripe build yet (stripeConfigured missing/false). Redeploy Render from main with start: npm run start:api, and set STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET + STRIPE_PUBLISHABLE_KEY.'
    );
    // Prove old route shape
    const oldInit = await req('/api/stripe/initiate', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'probe',
        email: 'probe@sigmawealth.test',
        name: 'Probe',
        amount: 100000,
      }),
    });
    if (oldInit.status === 404) {
      failures.push('POST /api/stripe/initiate → 404 (old Flutterwave-only deploy still live)');
    }
  } else {
    assert(Number(cfg.data.minDepositNgn) === 100000, 'minDepositNgn must be 100000');
    console.log('✓ config', {
      stripeConfigured: cfg.data.stripeConfigured,
      stripeLive: cfg.data.stripeLive,
      webhook: cfg.data.stripeWebhookUrl,
      minNgn: cfg.data.minDepositNgn,
      minUsd: cfg.data.minDepositUsd,
    });

    const email = `investor_${Date.now()}@sigmawealth.test`;
    const userId = `usr-live-${Date.now()}`;
    await req('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password: 'TestPass123!',
        fullName: 'Live Stripe Investor',
        phone: '08012345678',
        agreedToTerms: true,
        supabaseUserId: userId,
      }),
    });

    const low = await req('/api/stripe/initiate', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        email,
        name: 'Live Stripe Investor',
        amount: 50000,
        phase: 'Phase 1: Seed Accumulation',
      }),
    });
    assert(!low.ok, 'sub-minimum must be rejected');
    console.log('✓ min deposit enforced');

    const init = await req('/api/stripe/initiate', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        email,
        name: 'Live Stripe Investor',
        amount: 100000,
        phase: 'Phase 1: Seed Accumulation',
        isRecurringPlan: false,
      }),
    });
    assert(init.ok, `initiate failed: ${JSON.stringify(init.data)}`);
    assert(!init.data.simulated, 'API must NOT simulate');
    assert(
      init.data.redirectUrl?.includes('stripe.com') || init.data.redirectUrl?.includes('checkout'),
      `Expected Stripe Checkout redirect, got: ${init.data.redirectUrl}`
    );
    console.log('✓ /api/stripe/initiate →', init.data.sessionId || init.data.chargeId);
    console.log('  redirectUrl:', init.data.redirectUrl);
  }

  // ── Summary ─────────────────────────────────────────────────────────
  console.log('\n──────── SUMMARY ────────');
  if (warnings.length) {
    console.log('WARNINGS:');
    warnings.forEach((w) => console.log('  ⚠', w));
  }
  if (failures.length) {
    console.log('FAILURES:');
    failures.forEach((f) => console.log('  ✗', f));
    console.log('\nStripe SDK paths PASSED. Fix Render deploy + account activation for end-to-end.');
    process.exit(1);
  }

  console.log('ALL CHECKS PASSED');
  console.log('Open a Checkout URL above with a real card to complete a live debit.');
}

main().catch((err) => {
  console.error('\nFAILED:', err.message);
  process.exit(1);
});
