/**
 * Real Stripe live-path smoke test (API + Checkout session creation).
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
  console.log('=== Stripe live scenario test ===');
  console.log('API', API);

  assert(SK.startsWith('sk_'), 'Set STRIPE_SECRET_KEY (sk_live_… or sk_test_…)');
  assert(PK.startsWith('pk_'), 'Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_live_… or pk_test_…)');
  assert(WHSEC.startsWith('whsec_'), 'Set STRIPE_WEBHOOK_SECRET (whsec_…)');

  const mode = SK.includes('_live_') ? 'LIVE' : 'TEST';
  console.log('Mode:', mode);
  if (mode === 'LIVE') {
    console.log('⚠ LIVE keys — creating a real Checkout Session (not charging unless someone pays).');
  }

  // 1) Nigerian review images present
  const nigeriaDir = path.join(process.cwd(), 'public', 'images', 'nigeria');
  const imgs = fs.readdirSync(nigeriaDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  assert(imgs.length >= 5, `Expected ≥5 nigeria images, found ${imgs.length}`);
  console.log('✓ Nigerian review images:', imgs.length);

  const caseStudies = fs.readFileSync(path.join(process.cwd(), 'components', 'case-studies.tsx'), 'utf8');
  assert(caseStudies.includes('/images/nigeria/'), 'case-studies must use nigeria folder');
  assert(!caseStudies.includes('review-emeka'), 'old review-* paths must be gone');
  console.log('✓ case-studies.tsx points at nigeria portraits');

  const detailed = fs.readFileSync(
    path.join(process.cwd(), 'components', 'detailed-features-section.tsx'),
    'utf8'
  );
  assert(detailed.includes('Start investing'), 'CTA card missing');
  assert(!detailed.includes('NeuraFlow'), 'old video must be removed');
  assert(detailed.includes('import Image from "next/image"'), 'Image import required');
  assert(detailed.includes('import Link from "next/link"'), 'Link import required');
  console.log('✓ hero CTA card (no video) is valid');

  // 2) Backend health + config
  const health = await req('/health');
  assert(health.ok, `API health failed: ${health.status}`);
  console.log('✓ API health');

  const cfg = await req('/api/config');
  assert(cfg.ok, `config failed: ${cfg.status} ${JSON.stringify(cfg.data)}`);
  assert(cfg.data.stripeConfigured === true, 'Backend stripeConfigured must be true (set STRIPE_SECRET_KEY on Render)');
  assert(Number(cfg.data.minDepositNgn) === 100000, 'minDepositNgn must be 100000');
  assert(Number(cfg.data.minDepositUsd) === 72 || Number(cfg.data.minDepositUsd) >= 70, 'minDepositUsd ~72');
  assert(cfg.data.stripeWebhookUrl?.includes('/api/stripe/webhook'), 'webhook URL missing in config');
  console.log('✓ config', {
    stripeConfigured: cfg.data.stripeConfigured,
    stripeLive: cfg.data.stripeLive,
    webhook: cfg.data.stripeWebhookUrl,
    minNgn: cfg.data.minDepositNgn,
    minUsd: cfg.data.minDepositUsd,
  });

  // 3) Stripe SDK: customer + checkout session (real Stripe API)
  const stripe = new Stripe(SK, { apiVersion: '2025-02-24.acacia' });
  const customer = await stripe.customers.create({
    email: `stripe-live-test-${Date.now()}@sigmawealth.test`,
    name: 'Sigma Live Test',
    metadata: { purpose: 'verify-stripe-live' },
  });
  assert(customer.id.startsWith('cus_'), 'customer create failed');
  console.log('✓ Stripe customer', customer.id);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customer.id,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'ngn',
          unit_amount: 10000000, // ₦100,000 in kobo
          product_data: { name: 'Sigma Wealth live smoke deposit' },
        },
      },
    ],
    success_url: 'https://sigmawealthsolution.vercel.app/dashboard?stripe_return=1&session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://sigmawealthsolution.vercel.app/dashboard?stripe_cancel=1',
    payment_intent_data: {
      setup_future_usage: 'off_session',
      metadata: { smoke: 'verify-stripe-live', creditInvestment: 'true' },
    },
    metadata: { smoke: 'verify-stripe-live', chargeAmount: '100000' },
  });
  assert(session.id.startsWith('cs_'), 'checkout session create failed');
  assert(Boolean(session.url), 'checkout session missing URL');
  console.log('✓ Checkout Session', session.id);
  console.log('  Pay URL (open to complete a real debit):', session.url);

  // 4) Backend initiate path (must redirect to Stripe, not simulate)
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
  console.log('✓ min deposit enforced via API');

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
  assert(!init.data.simulated, 'API must NOT simulate — use real Stripe keys on Render');
  assert(init.data.redirectUrl?.includes('stripe.com') || init.data.redirectUrl?.includes('checkout'),
    `Expected Stripe Checkout redirect, got: ${init.data.redirectUrl}`);
  console.log('✓ /api/stripe/initiate → real Checkout', init.data.sessionId || init.data.chargeId);
  console.log('  redirectUrl:', init.data.redirectUrl);

  // 5) Auto-debit setup path (already funded scenario uses setup / tiny fee)
  const fundFirst = await req('/api/stripe/initiate', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      email,
      name: 'Live Stripe Investor',
      amount: 100000,
      phase: 'Active Plan',
      isRecurringPlan: false,
    }),
  });
  assert(fundFirst.ok && fundFirst.data.redirectUrl, 'fund initiate should return Stripe URL');

  // Webhook secret shape check (cannot forge live signature without body from Stripe)
  assert(WHSEC.length > 20, 'webhook secret looks too short');
  console.log('✓ webhook secret present (configure same value on Render STRIPE_WEBHOOK_SECRET)');

  console.log('\nALL CHECKS PASSED');
  console.log('Next: open a Checkout URL above with a real card to complete a live debit.');
  console.log('Ensure Render has STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET and Vercel has NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.');
}

main().catch((err) => {
  console.error('\nFAILED:', err.message);
  process.exit(1);
});
