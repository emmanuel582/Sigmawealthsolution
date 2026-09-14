const fs = require('fs');
const replacements = [
  ['app/layout.tsx', [
    ["Invest from $100 to unlimited with SigmawealthSolution. Full monthly returns — 50% in two weeks, remaining at month end with interest.",
     "Invest from ₦100,000 with SigmawealthSolution. Full monthly returns — 25% paid every week for 4 weeks; week 4 includes your interest."],
  ]],
  ['components/hero-section.tsx', [
    ["Invest from $100 to unlimited. Get your full return every month — 50% paid in the first two weeks, and the rest at month end.",
     "Invest from ₦100,000. Get your full return every month — 25% paid every week for 4 weeks, with interest included in week 4."],
  ]],
  ['components/navbar.tsx', [
    ["Start from $100 — invest as much as you want", "Start from ₦100,000 — invest as much as you want"],
    ["Twice-Monthly Payouts", "Weekly Payouts"],
    ["50% in two weeks, 50% at month end", "25% every week for 4 weeks (week 4 includes interest)"],
  ]],
  ['components/footer.tsx', [
    ["Invest from $100", "Invest from ₦100,000"],
    ["Twice-monthly payouts", "Weekly payouts (25% × 4)"],
  ]],
  ['components/features-section.tsx', [
    ["Create your SigmawealthSolution account, choose your amount (from $100 upward), and fund with Paystack debit card, auto-debit, or Opay transfer.",
     "Create your SigmawealthSolution account, choose your amount (from ₦100,000 upward), and fund with Flutterwave debit card or monthly auto-debit."],
    ["Phase 2 — First payout in 2 weeks", "Phase 2 — Weekly 25% payouts"],
    ["At the half-month mark, you receive 50% of your return. Track your next payment date and total invested from your investor dashboard.",
     "Every week you receive 25% of your deposit. Track your next payment date and total invested from your investor dashboard."],
    ["Phase 3 — Full return by month end", "Phase 3 — Week 4 completes your return"],
    ["At the end of the month you receive the remaining 50% — completing your full return of investment. Then reinvest, adjust auto-debit, or take a one-time deposit.",
     "In week 4 you receive the final 25% plus interest — completing your full return. Then reinvest, adjust auto-debit, or make another deposit."],
  ]],
  ['components/content-examples.tsx', [
    ["Start from $100 to Unlimited", "Start from ₦100,000"],
    ["Invest as little as $100 with zero upper ceiling. Build and scale your investment portfolio on your terms.",
     "Invest from ₦100,000 with no upper ceiling. Build and scale your investment portfolio on your terms."],
    ["Twice-Monthly Return Schedule", "Weekly Return Schedule"],
    ["Receive 50% of your returns within the first two weeks, and the remaining 50% at month end without delay.",
     "Receive 25% of your deposit every week for 4 weeks — week 4 also includes your interest."],
  ]],
  ['components/faq-section.tsx', [
    ["SigmawealthSolution is an investment platform where you can invest from $100 to unlimited amounts and receive your full return of investment within one month — paid in two parts.",
     "SigmawealthSolution is an investment platform where you can invest from ₦100,000 and receive your full return within one month — paid weekly in four parts."],
    ["Returns are paid twice every month: 50% within the first two weeks (half month), and the remaining 50% plus interest at the end of the month.",
     "Returns are paid every week for 4 weeks: 25% of your deposit each week. Week 4 includes the final 25% plus interest."],
    ["The minimum investment is $100.", "The minimum investment is ₦100,000. Amounts below this are not accepted."],
  ]],
  ['components/case-studies.tsx', [
    ["I started with just $100 and within a month I got my full return — half came in two weeks. SigmawealthSolution made investing simple and transparent for me.",
     "I started with ₦100,000 and within a month I got my full return — 25% came every week. SigmawealthSolution made investing simple and transparent for me."],
    ["I was skeptical at first, but receiving 50% of my returns within two weeks proved this platform is legit. I've now invested over $5,000.",
     "I was skeptical at first, but receiving 25% every week proved this platform is legit. I've now invested over ₦5,000,000."],
    ["I recommend SigmawealthSolution to all my friends. The split payout system — 50% early, 50% at month end — gives me cash flow I can actually plan with.",
     "I recommend SigmawealthSolution to all my friends. The weekly 25% payouts give me cash flow I can actually plan with."],
  ]],
  ['app/about/page.tsx', [
    ["We help people grow wealth with clear monthly returns — from $100 to unlimited.",
     "We help people grow wealth with clear monthly returns — from ₦100,000 upward."],
    ['"Minimum investment: $100 (unlimited maximum)"', '"Minimum investment: ₦100,000 (unlimited maximum)"'],
    ['"50% paid at two weeks · 50% paid at month end"', '"25% paid every week for 4 weeks · week 4 includes interest"'],
  ]],
  ['app/terms/page.tsx', [
    ["SigmawealthSolution is an investment platform. Investors may contribute from a minimum of $100 with no maximum limit. Full return of investment is structured over one month, paid twice: 50% within the first two weeks, and 50% at the end of the month.",
     "SigmawealthSolution is an investment platform. Investors may contribute from a minimum of ₦100,000 with no maximum limit. Full return of investment is structured over one month, paid weekly: 25% of deposit each week for 4 weeks, with interest included in week 4."],
    ["Minimum investment: $100 USD (or equivalent).", "Minimum investment: ₦100,000 (Naira only)."],
    ["Payout schedule: 50% of deposit at ~2 weeks; remaining 50% plus interest at month end.",
     "Payout schedule: 25% of deposit every week for 4 weeks; week 4 also includes interest."],
  ]],
  ['components/sigma/AdminPortal.tsx', [
    ["Mid-cycle = 50% of deposit · Month-end = remaining 50% + interest · Local banks (Opay, First Bank, etc.)",
     "Weekly = 25% of deposit · Week 4 = 25% + interest · Local banks (Opay, First Bank, etc.)"],
  ]],
];

for (const [file, pairs] of replacements) {
  if (!fs.existsSync(file)) { console.log('missing', file); continue; }
  let s = fs.readFileSync(file, 'utf8');
  let n = 0;
  for (const [a, b] of pairs) {
    if (s.includes(a)) { s = s.split(a).join(b); n++; }
    else console.log('NO MATCH', file, a.slice(0, 60));
  }
  fs.writeFileSync(file, s);
  console.log(file, n, 'replacements');
}
