
# Zenetrix — Build Plan

A production-grade fintech identity verification app with two surfaces in one codebase: a mobile-first **User Wallet** and a desktop-first **Analyst Admin Console**. Fully mocked auth and data — runs entirely in the browser. Visual bar set to **Stripe × Ramp × Revolut**: investor-demo quality.

## Stack adaptation

The spec calls for React Router v6 + Vite SPA. This project uses **TanStack Start** with file-based routing — functionally equivalent. All routes preserved 1:1; only routing primitives change (`createFileRoute`, `<Link>`). Everything else maps directly:

- Tailwind v4, shadcn/ui (already installed)
- Zustand (auth, onboarding, ui stores)
- TanStack Query (server state, even for mocks)
- React Hook Form + Zod
- Recharts (admin KPI charts)
- Framer Motion (page transitions, modals, success states)
- Lucide React

New deps: `zustand`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, `recharts`, `framer-motion`, `axios`.

## Visual language — Stripe × Ramp × Revolut

This is the part that makes it feel investor-grade. Locked into `src/styles.css` as semantic tokens (oklch):

**Palette**
- **Navy** `#1A3A5C` → `--primary` — deep, trustworthy, used for headers and primary CTAs
- **Accent Sky** `#0EA5E9` → `--accent` — links, focus rings, data highlights
- **Verified Green** `#16A34A` → `--success`
- **Risk Red** `#DC2626` → `--destructive`
- Layered neutrals: ink (text), slate (secondary), porcelain (surfaces), mist (backgrounds), hairline borders at 8% opacity
- Subtle gradient meshes (navy → indigo → sky at 6–10% opacity) behind hero sections, dashboard headers, and credential cards — the Ramp/Stripe signature look

**Typography (real type system, not just font swaps)**
- **DM Sans** for headings — tight tracking on display sizes (-0.02em), confident weights (500/600)
- **Inter** for body — optical sizing on, 14/16/18 with 1.5 line-height
- **JetBrains Mono** for IDs, hashes, credential numbers — Ramp uses mono for amounts; we use it for identity primitives
- A clear scale: Display 48 → H1 32 → H2 24 → H3 20 → Body 16 → Small 14 → Micro 12, all with deliberate weight pairings

**Surfaces & glassmorphism (subtle, never gimmicky)**
- Cards: white surface, 1px hairline border, layered shadow (Stripe's recipe: a tight 0/1/2 shadow + a soft 0/8/24 ambient)
- Glass panels on the wallet credential card and admin top utility bar: `backdrop-blur-xl` over a tinted gradient with 60–70% opacity, 1px inner highlight border. Used sparingly — credential card front, modal overlays, sticky nav on scroll
- Dashboards use elevated cards on a `bg-muted/40` canvas — the Ramp dashboard pattern

**Motion**
- Framer Motion page transitions: 200ms fade + 6px rise
- Number counters animate on dashboard tiles (Revolut-style)
- Credential card has a soft parallax shimmer on hover
- Liveness ring pulses, OTP boxes scale-in per digit, success states use a confetti burst with restrained physics
- Every interactive element has a 150ms ease-out hover state — no jarring jumps

**Data viz (Recharts, themed)**
- Custom theme: brand-tinted gradients for area fills, rounded bar tops, soft grid lines, monospace tick labels for figures
- Risk score uses a radial meter with a green→amber→red gradient sweep
- Sparklines on KPI tiles

**Iconography & spacing**
- Lucide at 1.5px stroke for a refined feel
- 8pt spacing grid; section padding 24/32/48; card padding 20/24
- Generous whitespace — investor decks live or die on breathing room

## Two distinct shells

```text
src/routes/
  __root.tsx                     -> providers (QueryClient, Tooltip, Toaster, fonts)
  index.tsx                      -> marketing landing
  register.tsx, login.tsx
  admin.login.tsx

  _wallet.tsx                    -> WalletShell (mobile-first)
    _wallet.wallet.tsx
    _wallet.wallet.credential.$id.tsx
    _wallet.onboarding.start.tsx
    _wallet.onboarding.identity.tsx
    _wallet.onboarding.liveness.tsx
    _wallet.onboarding.review.tsx
    _wallet.onboarding.success.tsx
    _wallet.consent.tsx
    _wallet.consent.active.tsx
    _wallet.consent.$id.tsx
    _wallet.rekyc.tsx
    _wallet.activity.tsx
    _wallet.settings.tsx
    _wallet.help.tsx

  _admin.tsx                     -> AdminShell (desktop)
    _admin.admin.dashboard.tsx
    _admin.admin.sessions.tsx
    _admin.admin.sessions.$id.tsx
    _admin.admin.cases.tsx
    _admin.admin.audit.tsx
    _admin.admin.credentials.tsx
    _admin.admin.settings.tsx
```

**WalletShell** — translucent top brand bar that solidifies on scroll, fixed bottom tab nav (Wallet, Consent, Activity, Settings) with active-pill indicator that slides between tabs, max-w-md container, safe-area insets, ≥44px touch targets.

**AdminShell** — collapsible left sidebar with Zenetrix wordmark, grouped nav with section labels, top utility bar (global search ⌘K-style, environment pill, user menu), dense multi-column layouts. Sidebar collapses to icon-only at md.

Both shells gate behind `authStore` (`role: 'user' | 'admin'`); unauthenticated → redirect to `/login` or `/admin/login`.

## Feature build-out

### User Wallet
- **Landing `/`** — hero with gradient mesh, animated trust strip (RBI-style compliance badges), 3-step "How it works" with sequential reveal, testimonial slab, dual CTA
- **Register/Login** — phone + 6-digit OTP (any code accepted), animated OTP boxes with focus migration, resend countdown
- **Onboarding wizard** — 5-step flow with a slim progress rail across the top (Stripe Checkout pattern): start → identity (Aadhaar/PAN form + drag-drop document upload with live preview, masked numbers) → liveness (mock camera with countdown ring, "blink / turn head" prompts) → review (summary card with edit-in-place) → success (confetti, issued credential reveal animation)
- **Wallet** — featured credential card front-and-center with glassmorphism, gradient mesh, mono identity number, holographic shimmer on hover; secondary cards stack below; tap → detail with QR share sheet, claims breakdown, expiry, revoke history
- **Consent** — pending requests with institution logo, scope chips, expiry; approve/revoke with confirm modal; active grants list; detail page with full claim breakdown
- **Re-KYC** — status tracker with circular progress, last completed/next due, trigger reuses onboarding wizard
- **Activity** — chronological feed with grouped day headers, icon per event type, filter chips
- **Settings** — profile, language (EN/HI/TA stub), accessibility (text size, high contrast), notifications, sign-out
- **Help** — FAQ accordion, contact support form

### Admin Console
- **Dashboard** — 4 KPI tiles with animated counters and sparklines (sessions today, approval rate, avg risk, pending), 2 hero charts: approvals trend (gradient area) + risk distribution (rounded bars), recent activity rail
- **Sessions queue** — dense table with sticky header, filters (status, risk band, date range), sort, pagination, row hover preview, bulk actions
- **Session detail** — split layout: left = applicant + document evidence viewer with zoom/pan, right = radial risk meter, liveness frames strip, decision panel (Approve / Reject / Escalate with reason + notes)
- **Cases** — escalated sessions with assignee, SLA timer pill, threaded notes
- **Audit log** — searchable immutable list with mono hashes, CSV export
- **Credentials registry** — issued credentials table, revoke with confirm modal
- **Settings** — read-only policy view (thresholds, retention, providers)

### Shared components (`src/components/`)
AppShell wrappers, TopBar, **CredentialCard** (the hero component — glass + gradient + holographic shimmer), StatusBadge, LoadingSpinner, SkeletonCard, SessionsTable, **RiskScoreMeter** (radial gradient), EvidencePanel, ConfirmModal, FilterSidebar, ConsentRequestCard, LivenessCamera (mock), ActivityItem, KpiTile, GradientMesh, GlassPanel.

## Mock data layer

```text
src/mocks/
  client.ts          -> axios instance + 300–800ms latency wrapper
  fixtures/          -> users, sessions, credentials, consents, activity, audit
  handlers/          -> per-resource mock handlers
  index.ts           -> useApi hook
```

`VITE_USE_MOCKS=true` is the default. Every page goes through TanStack Query so loading skeletons, error retry, and empty states are all real.

## State stores (Zustand)

- **authStore** — `{ user, role, token, login, loginAdmin, logout }` persisted to localStorage
- **onboardingStore** — wizard step, form draft, document blob URLs, liveness result
- **uiStore** — sidebar collapsed, theme, language, toast queue

## UX guarantees

- Loading skeleton, error retry, empty illustration on every async surface
- Modals/sheets keyboard-trapped, ESC-dismissible
- Touch targets ≥ 44×44 on wallet
- AnimatePresence page transitions
- Wallet caps at `max-w-md` centered on desktop; admin uses full width with graceful tablet degradation

## Build order

1. Install deps, design tokens + fonts + gradient mesh utility, providers in `__root.tsx`
2. Mock data layer + Zustand stores + auth gates
3. WalletShell + landing/login/register + wallet (hero credential card built first — sets the visual bar)
4. Onboarding wizard, consent, re-KYC, activity, settings, help
5. AdminShell + dashboard (KPI tiles + charts) + sessions list/detail
6. Cases, audit (with CSV export), credentials, admin settings
7. Polish pass: motion timing, empty states, a11y sweep, responsive QA

## Out of scope (mock build)

Real OCR, real liveness ML, real OTP delivery, backend persistence, full i18n string extraction, PWA service worker (structure ready, registration deferred).

The result: a fully navigable, demo-ready Zenetrix app with every route from the spec implemented and styled to a level you can drop into an investor deck.
