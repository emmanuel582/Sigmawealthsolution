# SigmawealthSolution Frontend

This repository deploys the Next.js frontend at https://sigmawealthsolution.com.
The Express API is in the separate [Sigmawealthsolutionbackend repository](https://github.com/emmanuel582/Sigmawealthsolutionbackend) and deploys at https://sigmawealthsolutionbackend.onrender.com.
The API owns Bachs checkout, webhooks, saved cards, recurring debits, investor payouts and financial migrations. Private payment credentials belong on Render, never in frontend source.

## Frontend deployment

Use Node 22. Set SIGMA_API_URL=https://sigmawealthsolutionbackend.onrender.com and the existing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY on the frontend host. Production rewrites default to that backend URL if the override is absent. Build with npm ci and npm run build. Run npm start for a Node deployment; Vercel uses the normal Next.js build.

Deploy the backend repository first, then this frontend. Apply the backend repository's supabase/bachs.sql and supabase/financial-permissions.sql in Supabase before enabling payments. Complete provider business approval, account activation, Connect onboarding and end-to-end settlement testing. The hourly runner lives only in the backend repository and remains disabled pending readiness.

## Fixed funding plans

Only NGN 64,000, 98,550, 135,000, 540,000 or 2,160,000 may be selected. The API independently validates amounts, matching monthly enrollment and company-paid fees. lib/sigma/fundingPlans.ts and lib/sigma/money.ts are shared contracts copied to the backend. Run npm run sync:backend-contract after changing either file, then test both repositories.

## Local development

Keep this checkout and Sigmawealthsolutionbackend as sibling folders. npm run dev starts the frontend. npm run dev:api starts the sibling backend with the ignored local environment; npm run dev:all starts both. If the backend has its own .env it is used; otherwise the frontend checkout's ignored .env is loaded for local development. No secrets are copied or committed.

## Verification

npm run typecheck
npm run lint
npm run build
node scripts/check-production-ui.mjs
npm run check:secrets

Run npm test and npm run check:bachs in the backend repository for payment, access-control and readiness checks. The real-key test results and required provider/hosting updates are recorded in reports/production-readiness.txt and the backend's reports directory. Live automatic payments are not activated by publishing these repositories.
