# SigmawealthSolution — Frontend

Modern Next.js 15 frontend application for SigmawealthSolution, designed for deployment on **Vercel**.

---

## Deployment (Vercel)

1. Import this repository into **[Vercel](https://vercel.com)**.
2. Set Framework to **Next.js**.
3. Add the following **Environment Variables**:
   * `SIGMA_API_URL`: URL of your Render backend (e.g. `https://sigmawealthsolutionbackend.onrender.com`)
   * `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key
4. Click **Deploy**.

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or with Turbopack:
npm run dev:turbo
```

---

## Architecture

* **Framework**: Next.js 15 (App Router)
* **Styling**: Tailwind CSS with custom design tokens
* **State Management**: React Context (`AuthContext.tsx`, `DropdownContext.tsx`)
* **API Communication**: Next.js rewrites in `next.config.mjs` transparently proxy `/api/*` calls to the Render backend (`SIGMA_API_URL`) with zero CORS overhead.
* **Backend Repository**: [Sigmawealthsolutionbackend](https://github.com/emmanuel582/Sigmawealthsolutionbackend) (Deployed on Render)
