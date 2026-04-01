# EstateIQ — Estate Settlement Guidance App

## Tech Stack
- **Framework:** Next.js 16 (App Router, React 19, TypeScript 5)
- **Styling:** Tailwind CSS v4 (inline `@theme` in globals.css, no tailwind.config)
- **Database:** Supabase (PostgreSQL + Auth + Row Level Security)
- **Hosting:** Vercel (auto-deploys from `main` branch)
- **Package Manager:** npm

## Project Structure
```
app/              → Pages (App Router, file-based routing)
components/       → Reusable components
  ui/             → Generic UI primitives (Button, ProgressBar, RadioCard, NumberInput)
  intake/         → Multi-step intake form steps + StrategyReport
lib/              → Utilities (supabaseClient.ts)
data/             → Static data (states.ts — 50-state probate rules)
types/            → TypeScript interfaces (intake.ts)
supabase/         → Migrations and config
workflows/        → Process documentation and flow designs
  small-estate-settlement/  → Small estate (below probate threshold) workflow
public/           → Static assets
```

## Key Routes
- `/` — Landing page (server-rendered)
- `/intake` — 5-step intake form + strategy report (client)
- `/login` — Email/password auth (client)
- `/dashboard` — User's task dashboard (client, protected)
- `/about`, `/how-it-works`, `/admin` — Stubs (coming soon)

## Database Schema (Supabase)
- **profiles** — Auto-created on signup via trigger, linked to auth.users
- **estates** — Stores intake data (JSONB), legal path, risk level, task lists
- RLS enforced: users only access their own data

## Conventions
- PascalCase for component files, camelCase for utilities
- `'use client'` only on pages with interactivity
- Local React state (`useState`) — no global state library
- Parent components lift state; children receive `onUpdate`/`onNext`/`onBack` callbacks
- Tailwind inline classes only — no CSS modules or styled-components
- Navy/cyan/slate color palette with 3 theme variants (trust, estate, intelligence)
- Mobile-first responsive design (sm/md/lg breakpoints)
- CSS keyframe animations for step transitions (`animate-fade-in-up`)

## Auth Flow
1. Supabase email/password auth
2. `AuthNav` component listens for auth state changes
3. Dashboard redirects to `/intake` if no session
4. Intake `SaveProgressCard` handles signup + estate record creation

## Business Logic
- `data/states.ts` contains probate thresholds and rules for all 50 states
- `StrategyReport.tsx` computes legal path (no-probate / small-estate / formal-probate) and risk level based on intake data
- Task generation is contextual: based on state, assets, legal path, and safety flags

## Workflows (`workflows/`)
Process documentation and flow designs for each legal path. These define the post-intake guided experience.

### Small Estate Settlement (`workflows/small-estate-settlement/`)
For estates below the state's probate threshold. 7-phase guided flow:
- **Phase 0 — Secure & Stabilize:** Conditional urgent actions (vacant property, pets, vehicles)
- **Phase 1 — Gather Essentials:** Death certificates, will, SSA notification. Branch: will filing deadline
- **Phase 2 — Document & Value:** Collect detailed account/vehicle/property/debt info. Branch: value recheck (may redirect to formal probate if estimates were wrong)
- **Phase 3 — Prepare Affidavit:** Branch: out-of-court notarization vs. court-filed Summary Administration (state-dependent)
- **Phase 4 — Collect Assets:** Parallel tracks per asset type (bank, vehicle, real estate, other)
- **Phase 5 — Settle Debts:** Pay in priority order. Branch: insolvent estate → attorney referral
- **Phase 6 — Distribute to Heirs:** Branch: will (per terms) vs. intestacy (per state law)
- **Phase 7 — Close Out:** Final tax returns, cancel accounts, store records

Key files:
- `small-estate-settlement.md` — Reference: typical small estate process
- `small-estate-post-intake-flow.md` — Detailed flow spec with branching points, gates, and data collection requirements
- `small-estate-flow-diagram.html` — Visual workflow diagram

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Development
```bash
npm run dev     # Start dev server
npm run build   # Production build
npm run lint    # ESLint
```

## Guidelines
- Always read existing code before modifying — understand the pattern first
- Keep components focused and small
- Use existing UI primitives from `components/ui/` before creating new ones
- All database changes need a new migration file in `supabase/migrations/`
- Never commit `.env.local` or expose Supabase keys beyond NEXT_PUBLIC_ ones
