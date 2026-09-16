# SigmawealthSolution — Frontend

Modern Next.js 15 frontend for SigmawealthSolution (**Vercel**). Express API on **Render**.

---

## Production Stripe (required)

### Callback / webhook URLs (Stripe Dashboard → Developers → Webhooks)

| Purpose | URL |
|--------|-----|
| **Webhook endpoint** | `https://sigmawealthsolutionbackend.onrender.com/api/stripe/webhook` |
| **Checkout success** | `https://sigmawealthsolution.vercel.app/dashboard?stripe_return=1&reference=…&session_id={CHECKOUT_SESSION_ID}` |
| **Checkout cancel** | `https://sigmawealthsolution.vercel.app/dashboard?stripe_cancel=1` |
| **Connect return** | `https://sigmawealthsolution.vercel.app/dashboard?connect_return=1` |
| **Connect refresh** | `https://sigmawealthsolution.vercel.app/dashboard?connect_refresh=1` |

Webhook events: `checkout.session.completed`, `payment_intent.succeeded`, `setup_intent.succeeded`, `account.updated`.

### Render (API) env

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=ngn
FRONTEND_URL=https://sigmawealthsolution.vercel.app
PUBLIC_API_URL=https://sigmawealthsolutionbackend.onrender.com
MIN_DEPOSIT_USD=72
AUTO_DEBIT_SETUP_FEE_NGN=1
```

### Vercel (frontend) env

```
SIGMA_API_URL=https://sigmawealthsolutionbackend.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

**Minimum top-up / monthly auto-debit:** ≈ ₦100,000 / **$72** (EUR/GBP via FX).  
**Already funded + auto-debit:** SetupIntent saves card (no second 100k). Monthly charge = amount they set.  
**Payouts:** Stripe Connect Express — investor connects bank; transfers go to their connected account.

Simulation is **off** in production. Do not set `STRIPE_ALLOW_SIMULATE=1` on live hosts.

---

## Deployment (Vercel)

1. Import this repository into **[Vercel](https://vercel.com)**.
2. Framework: **Next.js**.
3. Set env vars above → Deploy.

---

## Local Development

```bash
npm install
npm run dev:all
```

API: `http://127.0.0.1:4000` · Web: `http://localhost:3000`

---

## Architecture

* Next.js 15 App Router + Tailwind
* Stripe Checkout, off-session auto-debit, Connect payouts
* `next.config.mjs` rewrites `/api/*` → Render (`SIGMA_API_URL`)
* Express API: `server/sigma-api.ts`
