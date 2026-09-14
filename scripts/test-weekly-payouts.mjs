/**
 * Solid payout + min-deposit regression test against local Express API.
 * Run: node scripts/test-weekly-payouts.mjs
 */
const API = process.env.SIGMA_API_URL || 'http://127.0.0.1:4000';

async function req(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { status: res.status, data };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  console.log('API', API);
  const health = await req('/health');
  assert(health.status === 200, 'API health failed');

  const cfg = await req('/api/config');
  assert(cfg.data.minDepositNgn === 100000, `minDepositNgn expected 100000 got ${cfg.data.minDepositNgn}`);

  // Reject under-min deposit
  const low = await req('/api/flutterwave/initiate', {
    method: 'POST',
    body: JSON.stringify({ email: 'test@example.com', name: 'T', amount: 50000 }),
  });
  assert(low.status === 400, 'under-min initiate should 400');
  assert(String(low.data.message || '').includes('100'), `min message: ${low.data.message}`);

  // Create/register investor via seed path — need a profile first
  const email = `payout_test_${Date.now()}@example.com`;
  const signup = await req('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password: 'TestPass123!', fullName: 'Payout Tester', phone: '08012345678' }),
  });
  // signup may vary — also try register-profile
  let userId = signup.data?.user?.id || signup.data?.id || `local-${Date.now()}`;
  await req('/api/investor/register-profile', {
    method: 'POST',
    body: JSON.stringify({ id: userId, email, name: 'Payout Tester', phone: '08012345678' }),
  });

  // Seed 400,000 NGN investment due today week1
  const seed = await req('/api/admin/dev/seed-investment', {
    method: 'POST',
    body: JSON.stringify({ userId, amount: 400000, dueToday: true, payoutPhase: 'week1' }),
  });
  assert(seed.status === 200 || seed.data?.success, `seed failed ${seed.status} ${JSON.stringify(seed.data)}`);
  assert(seed.data.nextDue.amount === 100000, `week1 amount ${seed.data.nextDue.amount}`);
  assert(seed.data.nextDue.week === 1 || seed.data.nextDue.phase === 'week1', 'phase week1');

  // Manual pay week1
  const pay1 = await req('/api/admin/payouts/manual-pay', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      adminName: 'TestAdmin',
      referenceNote: 'TEST_WEEK1_MANUAL',
    }),
  });
  assert(pay1.status === 200 && pay1.data?.amount === 100000, `manual week1 failed ${JSON.stringify(pay1.data)}`);

  // Advance through weeks 2-3
  for (const week of [2, 3]) {
    const seedW = await req('/api/admin/dev/seed-investment', {
      method: 'POST',
      body: JSON.stringify({ userId, amount: 0.01, dueToday: true, payoutPhase: `week${week}` }),
    });
    // Better: fetch payouts due and set phase on existing investment via another seed overwrite
  }

  // Re-seed full principal for week4 math check in isolation
  const seed4 = await req('/api/admin/dev/seed-investment', {
    method: 'POST',
    body: JSON.stringify({ userId, amount: 400000, dueToday: true, payoutPhase: 'week4' }),
  });
  // Wait - seed ADDS amount. Use dedicated user for week4
  const email4 = `payout_w4_${Date.now()}@example.com`;
  const uid4 = `local-w4-${Date.now()}`;
  await req('/api/investor/register-profile', {
    method: 'POST',
    body: JSON.stringify({ id: uid4, email: email4, name: 'Week4 Tester', phone: '08099999999' }),
  });
  const s4 = await req('/api/admin/dev/seed-investment', {
    method: 'POST',
    body: JSON.stringify({ userId: uid4, amount: 400000, dueToday: true, payoutPhase: 'week4' }),
  });
  assert(s4.data.nextDue.amount === 160000, `week4 should be 100k+60k interest=160k got ${s4.data.nextDue.amount}`);
  const pay4 = await req('/api/admin/payouts/manual-pay', {
    method: 'POST',
    body: JSON.stringify({
      userId: uid4,
      adminName: 'TestAdmin',
      referenceNote: 'TEST_WEEK4_MANUAL',
    }),
  });
  assert(pay4.status === 200 && pay4.data?.amount === 160000, `manual week4 failed ${JSON.stringify(pay4.data)}`);

  // Batch pay-all-due
  const uidB = `local-batch-${Date.now()}`;
  await req('/api/investor/register-profile', {
    method: 'POST',
    body: JSON.stringify({ id: uidB, email: `batch_${Date.now()}@ex.com`, name: 'Batch', phone: '08011112222' }),
  });
  await req('/api/investor/bank-details', {
    method: 'POST',
    body: JSON.stringify({
      userId: uidB,
      accountNumber: '0123456789',
      bankCode: '058',
      bankName: 'GTBank',
      accountName: 'Batch Tester',
    }),
  });
  await req('/api/admin/dev/seed-investment', {
    method: 'POST',
    body: JSON.stringify({ userId: uidB, amount: 200000, dueToday: true, payoutPhase: 'week2' }),
  });
  const batch = await req('/api/admin/payouts/manual-batch', {
    method: 'POST',
    body: JSON.stringify({
      userIds: [uidB],
      adminName: 'TestAdmin',
      referenceNote: 'TEST_BATCH',
    }),
  });
  assert(batch.status === 200 && batch.data.paid >= 1, `batch failed ${JSON.stringify(batch.data)}`);

  // Auto mode + cron
  const mode = await req('/api/admin/payout-mode', {
    method: 'POST',
    body: JSON.stringify({ mode: 'automatic', adminName: 'TestAdmin' }),
  });
  assert(mode.status === 200 || mode.data?.success || mode.data?.mode === 'automatic', `mode ${JSON.stringify(mode.data)}`);

  const uidA = `local-auto-${Date.now()}`;
  await req('/api/investor/register-profile', {
    method: 'POST',
    body: JSON.stringify({ id: uidA, email: `auto_${Date.now()}@ex.com`, name: 'Auto', phone: '08033334444' }),
  });
  await req('/api/investor/bank-details', {
    method: 'POST',
    body: JSON.stringify({
      userId: uidA,
      accountNumber: '0123456789',
      bankCode: '058',
      bankName: 'GTBank',
      accountName: 'Auto Tester',
    }),
  });

  await req('/api/admin/dev/seed-investment', {
    method: 'POST',
    body: JSON.stringify({ userId: uidA, amount: 400000, dueToday: true, payoutPhase: 'week1' }),
  });

  const cron = await req('/api/payouts/run-cron', {
    method: 'POST',
    body: JSON.stringify({ adminName: 'TestAdmin' }),
  });
  assert(cron.status === 200, `cron failed ${cron.status} ${JSON.stringify(cron.data)}`);
  assert(
    Number(cron.data.successfulTransfers || 0) + Number(cron.data.failedTransfers || 0) > 0,
    'cron should process at least one payout'
  );

  // Auto-debit min
  const adLow = await req('/api/investor/auto-debit-plan', {
    method: 'POST',
    body: JSON.stringify({ userId: uidA, amount: 1000 }),
  });
  assert(adLow.status === 400, 'auto-debit under min should 400');

  // Auto-debit without saved card should fail (after min check passes)
  const adNoCard = await req('/api/investor/auto-debit-plan', {
    method: 'POST',
    body: JSON.stringify({ userId: uidA, amount: 100000 }),
  });
  assert(adNoCard.status === 400, 'auto-debit without card should 400');

  console.log('ALL TESTS PASSED');
  console.log(JSON.stringify({
    week1: 100000,
    week4: 160000,
    minDeposit: 100000,
    cron: {
      successfulTransfers: cron.data.successfulTransfers,
      failedTransfers: cron.data.failedTransfers,
      queuedForManual: cron.data.queuedForManual,
    },
    batch: { paid: batch.data.paid, failed: batch.data.failed },
  }, null, 2));
}

main().catch((e) => {
  console.error('TEST FAILED:', e.message);
  process.exit(1);
});
