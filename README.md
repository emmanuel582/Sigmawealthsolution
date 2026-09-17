# SigmawealthSolution — Frontend

Modern Next.js 15 frontend for SigmawealthSolution (**Vercel**). Express API on **Render**.

---

## Production Stripe (required)

### Callback / webhook URLs (Stripe Dashboard → Developers → Webhooks)

| Purpose | URL |
|--------|-----|
| **Webhook endpoint** | `https://sigmawealthsolution.vercel.app/api/stripe/webhook` |
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

### Vercel (frontend + Stripe live routes) env

```
SIGMA_API_URL=https://sigmawealthsolutionbackend.onrender.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_CURRENCY=ngn
FRONTEND_URL=https://sigmawealthsolution.vercel.app
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Stripe **initiate / verify / webhook / Connect onboard / config** run on Vercel (not Render) so payments work even if the Render API is stale.
Minimum fund / monthly auto-debit on the site: **₦100,000** (Naira only in the UI).

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
