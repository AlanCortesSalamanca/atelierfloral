# Atelier Floral Web

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwindcss&logoColor=fff)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_DB_Storage-3FCF8E?logo=supabase&logoColor=111)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)

Atelier Floral Web is a production-ready catalog and quote-request platform for an artisan floral and candle brand. It combines a public shopping-inspired experience with a private admin panel, without implementing online payments or customer accounts.

The project is built as a real business workflow: customers browse products, build a quote locally, submit their contact details with privacy consent, and continue the conversation through WhatsApp. Admin users can manage products, images and quote requests from a protected dashboard.

**Live site:** [https://atelierfloralpaos-tau.vercel.app](https://atelierfloralpaos-tau.vercel.app)

## Highlights

- Public product catalog with categories, product detail pages and featured products.
- Quote cart persisted in `localStorage`, with WhatsApp message generation.
- Privacy-aware quote form with required consent and a dedicated privacy notice page.
- Private admin dashboard protected by Supabase Auth, admin allowlist, middleware and CSRF checks.
- Product management with image uploads to Supabase Storage.
- Quote request management with status updates and audit logging.
- SEO foundations: metadata, Open Graph, Twitter cards, sitemap, robots.txt and JSON-LD structured data.
- Security hardening: RLS, service-role isolation, CORS validation, input sanitization, CSP headers and rate limiting.
- Automated quality checks with ESLint, TypeScript and Vitest.
- Vercel deployment with GitHub Actions CI.

## Product Scope

This app intentionally avoids traditional ecommerce complexity.

| Included | Not included |
| --- | --- |
| Product catalog | Online checkout |
| Quote cart | Payment processing |
| WhatsApp handoff | Customer accounts |
| Admin-only authentication | Public user login |
| Supabase product/image management | Inventory ERP |
| Privacy consent and anonymization flow | Marketing automation |

## Tech Stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 15 App Router |
| UI | React 19, Tailwind CSS 3 |
| Language | TypeScript strict mode |
| Backend | Next.js Route Handlers and Server Actions |
| Database | Supabase Postgres with Row Level Security |
| Auth | Supabase Auth for admin users |
| Storage | Supabase Storage for product images |
| Rate limiting | Upstash Redis with local development fallback |
| Testing | Vitest, Testing Library, jsdom |
| CI/CD | GitHub Actions and Vercel |

## Architecture

```txt
app/
  api/                    Public and internal route handlers
  admin/                  Protected admin dashboard and actions
  catalogo/               Public catalog page
  cotizacion/             Quote request flow
  productos/[slug]/       Product detail pages with dynamic SEO
components/
  features/               Domain UI: catalog, quote, home, admin
  layout/                 Shared navigation and shell components
  ui/                     Small shared UI primitives
lib/
  admin/                  Admin access, CSRF and authorization helpers
  db/                     Supabase browser/server/admin clients
  services/               Quote and domain services
  utils/                  CORS, sanitization, currency and rate limiting
supabase/
  migrations/             Versioned schema, security and privacy migrations
```

## Core Flows

### Customer Quote Flow

1. Customer browses the catalog or a product detail page.
2. Customer adds products to a local quote cart.
3. The cart is persisted in `localStorage` for a smooth browsing experience.
4. Customer submits name, phone and optional details from `/cotizacion`.
5. The API validates CORS, rate limits, sanitizes input and requires privacy consent.
6. The quote request is stored in Supabase through RLS-protected inserts.
7. The customer is redirected to WhatsApp with a generated message.

### Admin Management Flow

1. Admin signs in at `/admin/login` with Supabase Auth.
2. Middleware and server checks validate that the user is allowlisted.
3. Admin can create, update and delete products.
4. Product images are uploaded and cleaned up through Supabase Storage.
5. Quote requests can be reviewed and cancelled.
6. Sensitive actions are recorded in `admin_audit_log`.

## Security And Privacy

- Admin access is restricted by email and/or Supabase user id allowlists.
- Service-role Supabase access is isolated to server-only modules.
- Admin mutations validate CSRF tokens and same-origin requests.
- Public quote submission validates origin through an allowed-origin list.
- Input is sanitized before persistence or WhatsApp message generation.
- Rate limiting protects public quote submission and admin login.
- Supabase Row Level Security limits public database access.
- Product image uploads validate size and MIME/magic bytes.
- A privacy notice and required consent support the quote-request workflow.
- A protected cron endpoint can anonymize old quote requests.

## SEO

- App-level metadata in `app/layout.tsx`.
- Open Graph and Twitter card metadata.
- Dynamic product metadata in `app/productos/[slug]/page.tsx`.
- JSON-LD for `LocalBusiness`, `WebSite` and product pages.
- Dynamic sitemap generated from active Supabase products.
- Robots configuration blocks private/internal routes.
- Google Search Console verification file included in `public/`.

## Getting Started

### Prerequisites

- Node.js 22.
- npm.
- A Supabase project.
- Optional: Upstash Redis for production-grade rate limiting.

### Installation

```bash
git clone https://github.com/AlanCortesSalamanca/atelierfloral.git atelier-floral-web
cd atelier-floral-web
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local` from `.env.local.example`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public canonical site URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase admin key |
| `NEXT_PUBLIC_WHATSAPP_PHONE` | WhatsApp phone used for quote handoff |
| `NEXT_PUBLIC_PRODUCT_IMAGES_BUCKET` | Supabase Storage bucket name |
| `ALLOWED_ORIGINS` | Comma-separated allowed request origins |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `CRON_SECRET` | Bearer token for protected cron jobs |
| `ADMIN_EMAILS` | Comma-separated admin email allowlist |
| `ADMIN_USER_IDS` | Comma-separated Supabase admin user IDs |
| `PRIVACY_EMAIL` | Contact email for privacy requests |

Never commit `.env.local` or production secrets.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Build the production app |
| `npm run start` | Start the production server locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm test` | Run Vitest once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:coverage` | Run tests with coverage |

## Quality Checks

Recommended before shipping changes:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Deployment

The application is configured for Vercel.

- Production builds run with `npm run build`.
- GitHub Actions validates pull requests and pushes to `main`.
- Vercel environment variables must be configured outside the repository.
- `vercel.json` includes a scheduled cron job for quote anonymization.

## Portfolio Notes

This project demonstrates full-stack product thinking beyond a static landing page:

- Real business workflow design.
- Server-side security boundaries.
- Database schema hardening with migrations.
- Admin authorization and auditability.
- Privacy and consent considerations.
- SEO and deploy-readiness.
- Automated testing and CI practices.

## License

This repository is public as a portfolio project. Reuse is not granted unless a license is added explicitly.
