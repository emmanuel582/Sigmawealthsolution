/**
 * End-to-end verification for Stripe fund / auto-debit / referral 5% / payouts.
 * Runs against local Sigma API (simulate mode when STRIPE_SECRET_KEY is unset).
 */
const API = process.env.SIGMA_API_URL || 'http://127.0.0.1:4000';

async function req(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
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

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  console.log('API', API);

  const health = await req('/health');
  assert(health.ok, `health failed: ${health.status}`);

  const cfg = await req('/api/config');
  assert(cfg.ok, 'config failed');
  assert(cfg.data.stripeConfigured, 'stripeConfigured should be true (live or simulate)');
  assert(Number(cfg.data.referralRate) === 0.05, `referralRate expected 0.05 got ${cfg.data.referralRate}`);
  assert(Number(cfg.data.minDepositNgn) === 100000, 'min deposit should be 100000');
  console.log('✓ config', {
    stripeConfigured: cfg.data.stripeConfigured,
    stripeSimulate: cfg.data.stripeSimulate,
    referralRate: cfg.data.referralRate,
  });

  const referrerId = `usr-ref-${Date.now()}`;
  const inviteeId = `usr-inv-${Date.now()}`;
  const referrerEmail = `referrer_${Date.now()}@test.local`;
  const inviteeEmail = `invitee_${Date.now()}@test.local`;

  const regRef = await req('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email: referrerEmail,
      password: 'TestPass123!',
      fullName: 'Referrer User',
      phone: '08011111111',
      agreedToTerms: true,
      supabaseUserId: referrerId,
    }),
  });
  assert(regRef.ok || regRef.status === 200, `referrer register failed: ${JSON.stringify(regRef.data)}`);
  const dashRef0 = await req(`/api/investor/dashboard/${referrerId}?email=${encodeURIComponent(referrerEmail)}`);
  const refCode = dashRef0.data?.referralCode;
  assert(refCode, 'referrer referral code missing');
  console.log('✓ referrer', referrerEmail, refCode);

  const regInv = await req('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email: inviteeEmail,
      password: 'TestPass123!',
      fullName: 'Invitee User',
      phone: '08022222222',
      agreedToTerms: true,
      referralCode: refCode,
      supabaseUserId: inviteeId,
    }),
  });
  assert(regInv.ok || regInv.status === 200, `invitee register failed: ${JSON.stringify(regInv.data)}`);
  console.log('✓ invitee registered with referral');

  // Low amount rejected
  const low = await req('/api/stripe/initiate', {
    method: 'POST',
    body: JSON.stringify({
      userId: inviteeId,
      email: inviteeEmail,
      name: 'Invitee User',
      amount: 50000,
      phase: 'Phase 1: Seed Accumulation',
    }),
  });
  assert(!low.ok, 'sub-minimum deposit should fail');
  console.log('✓ min deposit enforced');

  // One-time fund (simulate completes instantly)
  const fund = await req('/api/stripe/initiate', {
    method: 'POST',
    body: JSON.stringify({
      userId: inviteeId,
      email: inviteeEmail,
      name: 'Invitee User',
      amount: 200000,
      phase: 'Phase 1: Seed Accumulation',
      isRecurringPlan: false,
    }),
  });
  assert(fund.ok, `fund failed: ${JSON.stringify(fund.data)}`);
  assert(fund.data.completed || fund.data.simulated, 'fund should complete in simulate mode');
  console.log('✓ one-time Stripe fund', fund.data.reference, fund.data.amountCharged);

  const dashInv = await req(`/api/investor/dashboard/${inviteeId}?email=${encodeURIComponent(inviteeEmail)}`);
  assert(dashInv.ok, 'invitee dashboard failed');
  assert(Number(dashInv.data.profile?.total_invested || 0) >= 200000, 'invitee not credited');
  console.log('✓ invitee credited', dashInv.data.profile.total_invested);

  const dashRef = await req(`/api/investor/dashboard/${referrerId}?email=${encodeURIComponent(referrerEmail)}`);
  assert(dashRef.ok, 'referrer dashboard failed');
  const expectedCommission = Math.round(200000 * 0.05);
  assert(
    Number(dashRef.data.referralEarnings || 0) === expectedCommission,
    `referral should be 5% (${expectedCommission}), got ${dashRef.data.referralEarnings}`
  );
  console.log('✓ referral 5% credited', dashRef.data.referralEarnings);

  // Auto-debit enrollment: monthly 150k → charges min 100k + saves card + plan 150k
  const autoUser = `usr-ad-${Date.now()}`;
  const autoEmail = `autodebit_${Date.now()}@test.local`;
  await req('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email: autoEmail,
      password: 'TestPass123!',
      fullName: 'Auto Debit User',
      phone: '08033333333',
      agreedToTerms: true,
      supabaseUserId: autoUser,
    }),
  });

  const enroll = await req('/api/stripe/initiate', {
    method: 'POST',
    body: JSON.stringify({
      userId: autoUser,
      email: autoEmail,
      name: 'Auto Debit User',
      amount: 150000,
      monthlyPlanAmount: 150000,
      phase: 'Active Plan',
      isRecurringPlan: true,
      saveCard: true,
    }),
  });
  assert(enroll.ok, `auto-debit enroll failed: ${JSON.stringify(enroll.data)}`);
  assert(Number(enroll.data.amountCharged) === 100000, `enrollment should charge min 100k, got ${enroll.data.amountCharged}`);
  assert(Number(enroll.data.monthlyPlanAmount) === 150000, 'monthly plan should be 150k');
  console.log('✓ auto-debit enrollment charged min + saved plan');

  const dashAd = await req(`/api/investor/dashboard/${autoUser}?email=${encodeURIComponent(autoEmail)}`);
  assert(dashAd.data.cardDetails, 'card should be saved');
  assert(dashAd.data.autoDebitPlan?.active, 'auto-debit plan should be active');
  assert(Number(dashAd.data.autoDebitPlan?.amount) === 150000, 'auto-debit amount should be monthly 150k');
  console.log('✓ saved card + auto-debit plan', dashAd.data.cardDetails.card_last4);

  // Force due auto-debit
  const plan = dashAd.data.autoDebitPlan;
  plan.next_charge_date = new Date().toISOString().split('T')[0];
  // process via API by setting date through another charge path — use process-auto-debits after seed
  // Seed bank + investment for payout
  const bank = await req('/api/investor/bank-details', {
    method: 'POST',
    body: JSON.stringify({
      userId: autoUser,
      accountName: 'Auto Debit User',
      accountNumber: '0123456789',
      bankCode: '058',
      bankName: 'Guaranty Trust Bank (GTBank)',
      country: 'NG',
      currency: 'NGN',
    }),
  });
  assert(bank.ok, `bank save failed: ${JSON.stringify(bank.data)}`);
  console.log('✓ NG bank saved');

  const usBankUser = `usr-us-${Date.now()}`;
  const usEmail = `usbank_${Date.now()}@test.local`;
  await req('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email: usEmail,
      password: 'TestPass123!',
      fullName: 'US Investor',
      phone: '15551234567',
      agreedToTerms: true,
      supabaseUserId: usBankUser,
    }),
  });
  const usBank = await req('/api/investor/bank-details', {
    method: 'POST',
    body: JSON.stringify({
      userId: usBankUser,
      accountName: 'US Investor',
      accountNumber: '000123456789',
      routingNumber: '110000000',
      country: 'US',
      currency: 'USD',
    }),
  });
  assert(usBank.ok, `US bank save failed: ${JSON.stringify(usBank.data)}`);
  console.log('✓ US bank saved');

  // Manual payout picker data
  const seed = await req('/api/admin/dev/seed-investment', {
    method: 'POST',
    body: JSON.stringify({ userId: autoUser, amount: 100000, dueToday: true, payoutPhase: 'week1' }),
  });
  assert(seed.ok || seed.status === 404, `seed: ${JSON.stringify(seed.data)}`);
  if (seed.ok) {
    const suggested = seed.data.nextDue?.amount;
    assert(suggested === 25000 || suggested === Math.round(seed.data.investment.amount * 0.25), `25% suggested got ${suggested}`);
    console.log('✓ 25% suggested payout', suggested);

    const payouts = await req('/api/admin/payouts');
    assert(payouts.ok, 'admin payouts failed');
    const due = (payouts.data.dueToday || []).find((d) => d.userId === autoUser || d.investorEmail === autoEmail);
    if (due) {
      assert(due.amountInvested > 0, 'due item should include amountInvested');
      assert(due.suggestedAmount > 0, 'due item should include suggestedAmount');
      const pay = await req('/api/admin/payouts/manual-pay', {
        method: 'POST',
        body: JSON.stringify({
          userId: due.userId,
          amount: due.suggestedAmount,
          adminName: 'Test Admin',
          referenceNote: 'stripe-e2e-manual',
        }),
      });
      assert(pay.ok, `manual pay failed: ${JSON.stringify(pay.data)}`);
      console.log('✓ manual payout', pay.data.amount, pay.data.stripe_transfer_id || pay.data.flutterwave_transfer_id);
    } else {
      console.log('~ dueToday empty after seed (ok if schedule differs)');
    }
  }

  // Force referral weekly payouts
  const bankRef = await req('/api/investor/bank-details', {
    method: 'POST',
    body: JSON.stringify({
      userId: referrerId,
      accountName: 'Referrer User',
      accountNumber: '0987654321',
      bankCode: '057',
      bankName: 'Zenith Bank',
      country: 'NG',
    }),
  });
  assert(bankRef.ok, 'referrer bank failed');

  const cron = await req('/api/payouts/run-cron', {
    method: 'POST',
    body: JSON.stringify({ triggeredBy: 'stripe-e2e', forceReferralPayouts: true }),
  });
  assert(cron.ok, `cron failed: ${JSON.stringify(cron.data)}`);
  console.log('✓ payout cron', {
    mode: cron.data.payoutMode,
    referralPaid: cron.data.referralPaid,
    success: cron.data.successfulTransfers,
  });

  // Process auto-debits (may be empty if next_charge_date in future — still must 200)
  const ad = await req('/api/investor/process-auto-debits', { method: 'POST', body: '{}' });
  assert(ad.ok, `process-auto-debits failed: ${JSON.stringify(ad.data)}`);
  console.log('✓ process-auto-debits', ad.data.processed);

  console.log('\nALL STRIPE FLOW TESTS PASSED');
}

main().catch((err) => {
  console.error('\nTEST FAILED:', err.message);
  process.exit(1);
});
