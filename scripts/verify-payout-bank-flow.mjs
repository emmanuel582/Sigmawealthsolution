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

async function main() {
  const health = await req('/health');
  if (health.status !== 200) throw new Error('API down');

  const cfg = await req('/api/config');
  console.log('CONFIG', {
    flutterwaveConfigured: cfg.data.flutterwaveConfigured,
    flutterwaveSandbox: cfg.data.flutterwaveSandbox,
    minDepositNgn: cfg.data.minDepositNgn,
  });

  // Manual
  const manualUid = `manual_${Date.now()}`;
  await req('/api/investor/register-profile', {
    method: 'POST',
    body: JSON.stringify({ id: manualUid, email: `${manualUid}@ex.com`, name: 'Manual Check', phone: '08011112222' }),
  });
  await req('/api/admin/dev/seed-investment', {
    method: 'POST',
    body: JSON.stringify({ userId: manualUid, amount: 400000, dueToday: true, payoutPhase: 'week1' }),
  });
  const manual = await req('/api/admin/payouts/manual-pay', {
    method: 'POST',
    body: JSON.stringify({ userId: manualUid, adminName: 'Tester', referenceNote: 'VERIFY_MANUAL_BANK_FLOW' }),
  });
  console.log('MANUAL', { status: manual.status, amount: manual.data.amount, success: manual.data.success, message: manual.data.message });

  // Automatic with bank details
  const autoUid = `auto_${Date.now()}`;
  await req('/api/investor/register-profile', {
    method: 'POST',
    body: JSON.stringify({ id: autoUid, email: `${autoUid}@ex.com`, name: 'Auto Check', phone: '08033334444' }),
  });
  await req('/api/investor/bank-details', {
    method: 'POST',
    body: JSON.stringify({
      userId: autoUid,
      accountNumber: '0123456789',
      bankCode: '058',
      bankName: 'GTBank',
      accountName: 'Auto Check',
    }),
  });
  await req('/api/admin/dev/seed-investment', {
    method: 'POST',
    body: JSON.stringify({ userId: autoUid, amount: 400000, dueToday: true, payoutPhase: 'week1' }),
  });
  await req('/api/admin/payout-mode', {
    method: 'POST',
    body: JSON.stringify({ mode: 'automatic', adminName: 'Tester' }),
  });
  const cron = await req('/api/payouts/run-cron', {
    method: 'POST',
    body: JSON.stringify({ adminName: 'Tester' }),
  });
  const logs = (cron.data.logs || []).filter((l) =>
    /SUCCESS|FAILED|SANDBOX|LOCAL|Flutterwave|Transferred|Simulated/i.test(l)
  );
  console.log('AUTOMATIC', {
    status: cron.status,
    successfulTransfers: cron.data.successfulTransfers,
    failedTransfers: cron.data.failedTransfers,
    payoutMode: cron.data.payoutMode,
    keyLogs: logs.slice(-10),
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
