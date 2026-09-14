const fs = require('fs');
const path = 'server/sigma-api.ts';
let s = fs.readFileSync(path, 'utf8');

s = s.replace(/payout_phase: 'mid'/g, "payout_phase: 'week1'");
s = s.replace(/addDaysIso\(now, 14\)/g, 'addDaysIso(now, 7)');

s = s.replace(
  /due\.phase === 'mid' \? 'Mid-cycle payout received' : 'Month-end payout received'/g,
  "`Week ${normalizePayoutWeek(due.phase)} payout received`"
);

s = s.replace(
  /due\.phase === 'mid' \? 'Mid-cycle payout sent' : 'Month-end payout \+ interest sent'/g,
  "due.week === 4 ? 'Week 4 payout + interest sent' : `Week ${due.week} payout sent`"
);

if (!s.includes('minDepositNgn: MIN_DEPOSIT_NGN')) {
  s = s.replace(
    'isSupabaseLive: isLiveSupabase,\n  });',
    'isSupabaseLive: isLiveSupabase,\n    minDepositNgn: MIN_DEPOSIT_NGN,\n  });'
  );
}

// Min deposit on flutterwave initiate
if (!s.includes('assertMinDeposit(Number(amount))')) {
  s = s.replace(
    "app.post('/api/flutterwave/initiate', async (req: Request, res: Response) => {\n  const { email, name, amount, userId, phase, isRecurringPlan } = req.body;\n  if (!email || !amount || Number(amount) <= 0) {\n    return res.status(400).json({ message: 'Valid email and amount are required' });\n  }",
    `app.post('/api/flutterwave/initiate', async (req: Request, res: Response) => {
  const { email, name, amount, userId, phase, isRecurringPlan } = req.body;
  if (!email || !amount || Number(amount) <= 0) {
    return res.status(400).json({ message: 'Valid email and amount are required' });
  }
  const minErr = assertMinDeposit(Number(amount));
  if (minErr) return res.status(400).json({ message: minErr });`
  );
}

// Min deposit on auto-debit save
s = s.replace(
  /app\.post\('\/api\/investor\/auto-debit-plan'[\s\S]*?if \(!userId \|\| !amount \|\| Number\(amount\) <= 0\) \{\n    return res\.status\(400\)\.json\(\{ message: '[^']+' \}\);\n  \}/,
  (block) => {
    if (block.includes('assertMinDeposit')) return block;
    return block.replace(
      /return res\.status\(400\)\.json\(\{ message: '[^']+' \}\);\n  \}/,
      (m) => `${m}\n  const minErr = assertMinDeposit(Number(amount));\n  if (minErr) return res.status(400).json({ message: minErr });`
    );
  }
);

fs.writeFileSync(path, s);
console.log('server patched');
