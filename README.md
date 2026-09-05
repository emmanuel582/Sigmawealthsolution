# SigmawealthSolution

Professional investment platform built with Next.js 15, TypeScript, Tailwind CSS, Supabase, and an Express API backend.

---

## Architecture Overview

The codebase is organized into two distinct domains:

### 1. Frontend (`app/`, `components/`, `contexts/`, `lib/`, `public/`)
* **Framework**: Next.js 15 App Router with TypeScript & Tailwind CSS.
* **`app/`**: Application routes and pages:
  * `/`: Marketing landing page (Hero, Features, Returns Calculator, Testimonials, FAQ, Footer)
  * `/auth/login`, `/auth/signup`, `/auth/callback`: Investor and admin authentication flows
  * `/dashboard`: Investor portal with live returns, portfolio tracking, and payment methods
  * `/admin`: Administrator control center for approving investments and disbursements
  * `/about`, `/contact`, `/terms`, `/privacy`: Information and legal pages
* **`components/`**: Modular UI components:
  * `components/`: Landing page sections (`hero-section.tsx`, `content-examples.tsx`, `features-section.tsx`, `detailed-features-section.tsx`, `case-studies.tsx`, `faq-section.tsx`, `navbar.tsx`, `footer.tsx`)
  * `components/sigma/`: Investor dashboard (`InvestorDashboard.tsx`), admin portal (`AdminPortal.tsx`), auth page (`AuthPage.tsx`), and bottom navigation
  * `components/ui/`: Reusable Radix UI primitives and styled components
* **`contexts/`**: Shared state (`AuthContext.tsx`, `DropdownContext.tsx`).
* **`lib/`**: Client utilities and Supabase browser client (`lib/sigma/supabaseClient.ts`, `lib/sigma/api.ts`).
* **`public/`**: Static assets, brand icons, and service worker unregister handler.

### 2. Server & Backend (`server/`, `supabase/`)
* **Express API Engine** (`server/sigma-api.ts`):
  * Running concurrently on port `4000` (proxied seamlessly through Next.js rewrites at `/api/*`).
  * Handles investor profile synchronization, payment sessions, and admin allowlist authentication.
  * Robust fallback handling for bank listings and offline resiliency.
* **Payment Gateway** (`server/lib/flutterwaveV4.ts`):
  * Handles card charges, auto-debit tokenization, and payout disbursements via Flutterwave v4 API.
* **Database Schema** (`supabase/schema.sql`):
  * PostgreSQL schemas, RLS policies, tables, and views for investments, payouts, and admin controls.

---

## Getting Started

### Development
```bash
# Install dependencies
npm install

# Start both Next.js Web (port 3000) and Express Server (port 4000) concurrently
npm run dev

# Or with Turbopack for ultra-fast compilation:
npm run dev:turbo
```

### Build & Testing
```bash
# Build production bundle
npm run build

# Run test suite
npm test
```
