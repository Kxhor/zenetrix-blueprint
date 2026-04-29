# Zenetrix — Trusted Financial Identity, Instantly Verifiable

Zenetrix is a financial identity verification platform built for regulated Indian financial services. It lets customers complete KYC once, then share verifiable credentials with banks, NBFCs, brokers, insurers, and exchanges — all with consent, audit trails, and bank-grade security.

## Tech Stack

| Layer | Technology |
|-------|-------------|
| Framework | [TanStack Start](https://tanstack.com/start) (React 19, TypeScript) |
| API | [Hono](https://hono.dev) (Cloudflare Workers) |
| Database | [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite) |
| ORM | [Drizzle ORM](https://orm.drizzle.team) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) with OKLCH design tokens |
| Auth | JWT (jose) + OTP (SMS-ready) |
| State | TanStack Query, Zustand |
| Build | Vite 7 + Cloudflare Vite Plugin |

## Features

- **60-second KYC onboarding** — Aadhaar, PAN, liveness check, guided wizard
- **Verifiable credentials wallet** — store KYC, address-proof, income-proof on-device
- **Granular consent** — scope-bound, time-bound, one-tap revocable
- **Admin console** — session review, approval/rejection, risk scoring, audit logs
- **Audit trail** — tamper-evident append-only log with hash chains
- **Design system** — OKLCH tokens, glassmorphism, animations (Stripe × Ramp × Revolut aesthetic)

## Project Structure

```
src/
├── api/                  # Hono API (Cloudflare Worker)
│   ├── index.ts          # App setup, CORS, error handler
│   ├── api-worker.ts     # Worker entry
│   ├── lib/             # auth, db, utils
│   ├── middleware/       # auth middleware, role guards
│   ├── routes/          # auth, credentials, consents, sessions, dashboard, audit
│   ├── schema.ts        # Drizzle D1 schema
│   └── types/           # Shared API types
├── routes/              # TanStack Start pages
│   ├── _admin/          # Admin console (dashboard, sessions, audit, settings)
│   ├── _wallet/         # User wallet (credentials, consents, activity)
│   ├── login.tsx         # OTP login
│   ├── register.tsx      # Registration
│   └── index.tsx        # Landing page
├── components/           # Shared UI components
├── stores/              # Zustand stores (auth, onboarding, UI)
├── hooks/               # Custom hooks
├── router.tsx           # TanStack Router setup
├── server.ts            # Combined worker entry (API + frontend)
└── styles.css           # Design system tokens & utilities
```

## Prerequisites

- [Node.js](https://nodejs.org) >= 18
- [Bun](https://bun.sh) (runtime, optional — npm works too)
- [Cloudflare account](https://dash.cloudflare.com/sign-up) (for D1 + Workers)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (included)

## Setup

```bash
# Clone & install
git clone <repo-url> && cd zenetrix-blueprint
bun install   # or: npm install

# Configure environment
cp .env.example .env
```

Edit `.env` with your values:

```env
JWT_SECRET=openssl rand -base64 32
D1_DATABASE_ID=your-d1-database-id
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
```

## Development

```bash
# Start everything (API + frontend)
bun run dev:all

# Or separately:
bun run dev        # Frontend only (http://localhost:5173)
bun run dev:api   # API only (http://localhost:8787)
```

The Vite dev server proxies `/api/*` requests to the local Worker.

## Build & Deploy

```bash
# Production build
bun run build

# Deploy to Cloudflare Workers
bunx wrangler deploy

# Database migrations
bun run db:migrate          # Local
bun run db:migrate:prod      # Remote
```

## Database

Schema defined in `src/api/schema.ts` with 7 tables:

| Table | Purpose |
|-------|---------|
| `users` | Registered users (role: user/admin) |
| `otp_codes` | Short-lived OTP for login |
| `credentials` | KYC verifiable credentials |
| `consents` | User consent grants to institutions |
| `sessions` | KYC sessions (status, risk, liveness) |
| `activities` | User-facing activity feed |
| `audit_log` | Append-only admin audit trail |

```bash
# Generate migration files
bun run db:generate

# Seed with demo data
bun run db:seed

# Open Drizzle Studio
bun run db:studio
```

## API Endpoints

### Auth
- `POST /api/auth/otp/send` — Send OTP to phone
- `POST /api/auth/otp/verify` — Verify OTP, get JWT
- `POST /api/auth/register` — Register new user
- `POST /api/auth/admin/login` — Admin login

### Credentials
- `GET /api/credentials` — List credentials (user sees own, admin sees all)
- `GET /api/credentials/:id` — Get credential by ID
- `POST /api/credentials/:id/revoke` — Revoke credential

### Consents
- `GET /api/consents?status=pending` — List consents
- `GET /api/consents/:id` — Get consent by ID
- `POST /api/consents/:id/respond` — Approve/reject consent

### Sessions (Admin)
- `GET /api/sessions?status=all&risk=low&page=1` — List KYC sessions
- `GET /api/sessions/:id` — Get session details
- `POST /api/sessions/:id/decide` — Approve/reject/escalate

### Activity & Dashboard
- `GET /api/activity` — User activity feed
- `GET /api/admin/dashboard` — Admin KPIs + trends
- `GET /api/admin/audit` — Audit log
- `GET /api/health` — Health check

All protected routes require `Authorization: Bearer <JWT>` header.

## Design System

Design tokens defined in `src/styles.css` using OKLCH color space:

```css
/* Brand */
--primary: oklch(0.32 0.05 248);   /* Navy #1A3A5C */
--accent: oklch(0.7 0.14 230);    /* Sky #0EA5E9 */
--primary-glow: oklch(0.42 0.08 248);

/* Status */
--success: oklch(0.62 0.16 148);
--warning: oklch(0.78 0.15 75);
--destructive: oklch(0.58 0.22 27);
```

Utility classes: `.glass`, `.glass-strong`, `.gradient-mesh`, `.gradient-card`, `.shadow-card`, `.shadow-glow`, `.animate-fade-up`, `.animate-scale-in`, `.animate-float`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Secret for signing JWTs (32+ chars) |
| `D1_DATABASE_ID` | Deploy | Cloudflare D1 database ID |
| `CLOUDFLARE_ACCOUNT_ID` | Deploy | Cloudflare account ID |
| `CLOUDFLARE_API_TOKEN` | Deploy | Cloudflare API token with D1 permissions |
| `VITE_API_URL` | No | Override API URL for frontend |

## Scripts

| Command | Description |
|---------|-------------|
| `dev` | Start Vite dev server |
| `dev:api` | Start Wrangler dev (API worker) |
| `dev:all` | Start both in parallel |
| `build` | Production build (client + server) |
| `preview` | Preview production build |
| `typecheck` | TypeScript type checking |
| `lint` | ESLint + Prettier check |
| `format` | Format code with Prettier |
| `db:generate` | Generate Drizzle migrations |
| `db:migrate` | Run migrations (local) |
| `db:migrate:prod` | Run migrations (remote) |
| `db:seed` | Seed database with demo data |
| `db:studio` | Open Drizzle Studio |

## License

MIT
