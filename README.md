# Oxyrich Pakistan — website

The new website for **Oxyrich Pakistan**, an Islamabad bottled-water company. It replaces the old Laravel "Acuas" template site at https://oxyrichpakistan.com.pk/. Visitors can order water (cash on delivery), start delivery plans, send service enquiries and manage their account, in English or Urdu. Staff run orders, prices and content from `/admin`.

---

## ⚠️ Needs client confirmation

All of these are **placeholders** in the code and seed data. Confirm each one before launch.

| #   | Item                                                                                                                                         | Where it lives now                               | How to change it                                                                        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| 1   | **Prices**: 19 L Rs 250, 1.5 L carton Rs 480, 1 L carton Rs 720                                                                              | `src/content/catalog.ts` (seed)                  | `/admin/products`, then tick **Prices confirmed** in `/admin/settings`                  |
| 2   | **Carton sizes**: 1.5 L × 6, 1 L × 12                                                                                                        | same                                             | `/admin/products`                                                                       |
| 3   | **19 L bottle deposit** (Rs 1,000) and **refund policy** (the site says deposits are refundable when bottles are returned in good condition) | catalog, FAQ, Terms                              | `/admin/products`; refund wording in `messages/*.json` → `faq.items.return`, Terms page |
| 4   | **Years in business**: the old site said both "10+" and "20". Currently **10**                                                               | `YEARS_IN_BUSINESS` in `src/config/site.ts`      | `/admin/settings` → Stats                                                               |
| 5   | **Stats** (876+ clients, 50+ vehicles, 12+ employees)                                                                                        | `src/config/site.ts`                             | `/admin/settings` → Stats                                                               |
| 6   | **Delivery areas**: I-8–10, G-6–15, F-6–11, E-7, E-11, H-8–13, DHA, Bahria Town                                                              | `src/config/site.ts`                             | `/admin/settings` → Delivery areas                                                      |
| 7   | **Minimum order** (the FAQ says one 19 L bottle; carton minimums are "call us")                                                              | `messages/*.json` → `faq.items.minimum`          | edit messages                                                                           |
| 8   | **Map pin** for 264, Street 6, I-9/3 (approximate coordinates used)                                                                          | `src/config/site.ts` → `geo`                     | `/admin/settings` → Address & map                                                       |
| 9   | **Certifications** (PSQCA / PFA slots shown as "to be published"; none are claimed)                                                          | `src/app/[locale]/(site)/quality/page.tsx`       | provide certificates                                                                    |
| 10  | **The 12 filtration steps**: the old site only said "12-step filtration". Step names are a typical industry process and **must be checked**  | `messages/*.json` → `quality.steps`              | edit messages                                                                           |
| 11  | **Mineral composition / lab report** (table shows "—")                                                                                       | `src/content/catalog.ts` → `PENDING_COMPOSITION` | DB `Product.composition`                                                                |
| 12  | **Logo as SVG** (current logo is the old PNG, recoloured for light backgrounds)                                                              | `public/images/brand/`                           | replace files                                                                           |
| 13  | **Real photos**: products, team, facility (see `public/images/README.md`)                                                                    | `public/images/`                                 | replace files                                                                           |
| 14  | **Social media links** (hidden while empty)                                                                                                  | `src/config/site.ts`                             | `/admin/settings` → Social                                                              |
| 15  | **Urdu translation review** by a native speaker                                                                                              | `messages/ur.json`                               | edit messages                                                                           |
| 16  | **Privacy policy & terms** are drafts (English only), marked as drafts on the page                                                           | `src/app/[locale]/(site)/privacy`, `terms`       | legal review                                                                            |
| 17  | **Order email recipient** (defaults to oxyrichpakistan@gmail.com)                                                                            | `ADMIN_NOTIFY_EMAIL` env                         | Vercel env vars                                                                         |

Testimonials are the four real ones from the old site, with spelling corrected. Initials avatars replace the generic profile icon.

---

## What changed from the old site

| Old-site problem                                                                 | Fix                                                                                                             |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Title "Acuas - Drinking Water Website Template"; empty meta tags                 | Unique title, description, canonical URL, hreflang and Open Graph/Twitter card on every page (`src/lib/seo.ts`) |
| `/contact` returned **500**                                                      | Working contact page: form, click-to-call, WhatsApp, email, map, hours                                          |
| `/about` rendered in the admin layout ("Dashboard – Laravel")                    | `/admin` is a separate root layout behind a role check; public pages never render admin UI                      |
| `/register` was blank                                                            | Working phone-number registration                                                                               |
| Broken WhatsApp link `wa.me/+9203364448494`                                      | `https://wa.me/923364448494`, built in one place (`whatsappLink`) and covered by a unit test                    |
| 1 L "Buy Now" linked to `#`; dead `#` links; "Logo" heading; "Search by keyword" | Every link goes somewhere real; template leftovers removed (a unit test guards against them)                    |
| Typos: "Experiance", "19-litter", "definetly"                                    | Fixed (unit-tested)                                                                                             |
| No prices, ordering, social links, map, structured data or Urdu                  | Cart and checkout, quick order, delivery plans, map, JSON-LD, English + Urdu (RTL)                              |
| 10+ vs 20 years                                                                  | Single `yearsInBusiness` setting                                                                                |
| "Market Research" / "Project Planning" template services                         | Merged into About → "How we work"                                                                               |
| **Gatorade images** used as Oxyrich products                                     | Not reused; replaced with illustrations (see `public/images/README.md`)                                         |

The old URLs `/about`, `/contact`, `/login`, `/register` and `/forgot-password` keep the same paths. Other legacy URLs (`/home`, `/index.php/*`, `/dashboard`, `/profile`, `/password/reset`, old image paths…) **301-redirect** to their new pages (`next.config.ts`).

---

## Tech stack

|                |                                                                                                                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework      | **Next.js 16.4** (App Router, Turbopack, Server Actions) · React 19.3 · TypeScript 5.9 (strict)                                                                                    |
| UI             | Tailwind CSS 4 · shadcn/ui-style components on Radix · lucide-react · Motion (Framer Motion) for the testimonial carousel; scroll reveals use CSS scroll-driven animations (no JS) |
| Data           | PostgreSQL · **Prisma 7** (`prisma-client` generator + `@prisma/adapter-pg`)                                                                                                       |
| Auth           | Auth.js (`next-auth@5` beta) with phone-number + password credentials, JWT sessions, bcrypt                                                                                        |
| Forms          | React Hook Form + Zod 4. The same schemas run on client and server (`src/lib/validation.ts`)                                                                                       |
| i18n           | next-intl 4: English at `/`, Urdu at `/ur` (RTL, Noto Nastaliq Urdu)                                                                                                               |
| Email          | Resend (logs to the console when no API key is set)                                                                                                                                |
| Bot protection | Honeypot field on every public form, Cloudflare Turnstile (optional), Postgres-backed rate limiting                                                                                |
| Analytics      | GA4 (optional) and Vercel Analytics. Conversions: `order_placed`, `quick_order_placed`, `whatsapp_click`, `call_click`, `enquiry_submitted`, `sign_up`, `add_to_order`             |
| Tests          | Vitest (unit) · Playwright (end-to-end)                                                                                                                                            |
| Hosting        | Vercel (Mumbai region `bom1`) + Neon or Supabase Postgres                                                                                                                          |

> **Version notes.** TypeScript is pinned to 5.9 because TS 7 is not yet supported by the Next.js toolchain. ESLint is pinned to 9 for plugin compatibility. `next-auth` is pinned to an exact beta.

---

## Project structure

```
messages/            en.json, ur.json — all UI copy (Urdu mirrors every key; a unit test enforces it)
prisma/              schema.prisma, migrations/, seed.ts
public/images/       brand/, products/, legacy/  (see public/images/README.md)
src/
  app/
    [locale]/        locale root layout (fonts, providers, theme)
      (site)/        public pages + header/footer/WhatsApp chrome, 404, 500
    admin/           separate root layout: orders, products, subscriptions, customers,
                     enquiries, testimonials, settings (English only, role-protected)
    api/auth/        Auth.js route handler
    api/cron/        /api/cron/subscriptions — daily job creating orders for due plans
    sitemap.ts robots.ts manifest.ts icon.png apple-icon.png global-error.tsx
  components/        ui/ (primitives), layout/, sections/, forms/, products/, account/
  config/site.ts     ★ business details defaults (phone, WhatsApp, email, address, stats, areas)
  content/catalog.ts seed products + testimonials
  i18n/              routing, request config, locale-aware Link, client message picker
  lib/               db, auth, settings, products, pricing, validation, phone, seo, email, rate-limit…
  server/            order placement, subscriptions processing, server actions
  proxy.ts           next-intl locale routing (Next 16's replacement for middleware.ts)
tests/unit/          Vitest
tests/e2e/           Playwright
```

**Single source of truth for business details.** Components never hard-code the phone number or other contact details. Server code reads `getSiteSettings()` (`src/lib/settings.ts`): the defaults in `src/config/site.ts`, overridden by `SiteSetting` rows. Client code reads the same values via `useSiteSettings()`. Saving in `/admin/settings` updates the whole site within seconds.

---

## Local setup

Requirements: Node 20.9+ (tested on Node 24) and Docker (or any PostgreSQL 15+).

```bash
# 1. Database
docker run -d --name oxyrich-pg -e POSTGRES_USER=oxyrich -e POSTGRES_PASSWORD=oxyrich \
  -e POSTGRES_DB=oxyrich -p 5433:5432 postgres:17-alpine

# 2. Environment
cp .env.example .env
#   DATABASE_URL="postgresql://oxyrich:oxyrich@localhost:5433/oxyrich"
#   AUTH_SECRET=$(npx auth secret)   (or: openssl rand -base64 32)
#   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
#   SEED_ADMIN_PHONE / SEED_ADMIN_PASSWORD — your first admin login

# 3. Install, migrate, seed
npm install            # also runs `prisma generate`
npm run db:migrate     # applies prisma/migrations
npm run db:seed        # products, testimonials, settings, admin user

# 4. Run
npm run dev            # http://localhost:3000   (Urdu: /ur, admin: /admin)
```

Without `RESEND_API_KEY`, order, enquiry and reset emails print to the terminal. Without Turnstile keys, the widget is skipped.

### Scripts

| Script                                                       | What it does                                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `npm run dev` / `build` / `start`                            | Next.js                                                                         |
| `npm run lint`                                               | ESLint (Next core-web-vitals + TypeScript rules)                                |
| `npm run typecheck`                                          | `next typegen` + `tsc --noEmit`                                                 |
| `npm test`                                                   | Vitest unit tests                                                               |
| `npm run test:e2e`                                           | Playwright: builds, starts on :3100 with rate limiting disabled, runs the flows |
| `npm run db:migrate` / `db:deploy` / `db:seed` / `db:studio` | Prisma                                                                          |
| `npm run format`                                             | Prettier (with Tailwind class sorting)                                          |

---

## Environment variables

| Variable                                                       | Required    | Purpose                                                                                                                                       |
| -------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                 | ✅          | Postgres connection. On Vercel use the **pooled** URL (Neon `-pooler` host / Supabase port 6543)                                              |
| `AUTH_SECRET`                                                  | ✅          | Signs session cookies. Generate with `npx auth secret`                                                                                        |
| `NEXT_PUBLIC_SITE_URL`                                         | ✅          | Public origin, e.g. `https://oxyrichpakistan.com.pk`. Used for canonical URLs, sitemap, OG images and email links. **Inlined at build time.** |
| `AUTH_TRUST_HOST`                                              | –           | `true` (set in `.env.example`). `AUTH_URL` is only needed outside Vercel                                                                      |
| `RESEND_API_KEY`                                               | prod        | Sends order, enquiry and password-reset emails                                                                                                |
| `EMAIL_FROM`                                                   | prod        | Sender on a Resend-verified domain, e.g. `Oxyrich Pakistan <orders@oxyrichpakistan.com.pk>`                                                   |
| `ADMIN_NOTIFY_EMAIL`                                           | –           | Where new-order/enquiry emails go (defaults to the business email setting)                                                                    |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`      | recommended | Cloudflare Turnstile on public forms. Both empty = disabled                                                                                   |
| `NEXT_PUBLIC_GA_ID`                                            | –           | GA4 measurement ID                                                                                                                            |
| `CRON_SECRET`                                                  | prod        | Bearer token Vercel Cron sends to `/api/cron/subscriptions`                                                                                   |
| `SEED_ADMIN_PHONE` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` | seed only   | First admin account created by `npm run db:seed`                                                                                              |
| `DISABLE_RATE_LIMIT`                                           | tests only  | `true` disables rate limiting (used by the e2e runner). **Never set in production**                                                           |

---

## Deploying to Vercel

1. **Database:** create a Postgres database on **Neon** or **Supabase**. Choose a region near Mumbai/Singapore and copy the pooled connection string.
2. **Import the repo** into Vercel (framework preset: Next.js). `vercel.json` already sets:
   - `buildCommand: npm run vercel-build`, which runs `prisma migrate deploy && next build`, so migrations apply on every deploy
   - region `bom1` (Mumbai, closest to Pakistan)
   - a daily cron at 00:00 UTC (05:00 PKT) for subscription orders
3. **Environment variables:** add everything from the table above for **Production** (and Preview, with a separate database).
4. **Seed once:** from your machine, with `DATABASE_URL` pointing at production, run `npm run db:seed`. Then log in at `/admin` and **change the seeded admin password** (or create a new admin and remove the seed one).
5. **Email:** in Resend, verify `oxyrichpakistan.com.pk` (DNS records), then set `RESEND_API_KEY` and `EMAIL_FROM`.
6. **Turnstile:** create a widget in Cloudflare for the domain and set both keys.
7. **Domain:** add `oxyrichpakistan.com.pk` in Vercel → Domains and point DNS at Vercel. Old URLs redirect automatically.
8. **After launch:**
   - submit `https://oxyrichpakistan.com.pk/sitemap.xml` in Google Search Console
   - run PageSpeed Insights on the live URL
   - mark Order / WhatsApp / Call events as **key events** (conversions) in GA4

---

## How ordering works

- **Checkout (`/order`)** and **quick order (home)** create an `Order` (status `PENDING`, cash on delivery) and email the business. The customer can also send the order summary on WhatsApp. **The server always re-prices from the database**; prices sent by the browser are ignored.
- **Returnable 19 L bottles:** a refundable deposit is charged for each new bottle. Each empty handed back on delivery waives one deposit. Signed-in customers get their empties prefilled from their bottle balance.
- **Bottle ledger:** when an admin marks an order **Delivered**, the ledger records +bottles delivered and −empties returned. The balance shows in `/account` and `/admin/customers`, where admins can also make manual adjustments.
- **Status workflow:** pending → confirmed → out for delivery → delivered (or cancelled before delivery). Invalid jumps are rejected server-side.
- **Delivery plans (`/subscriptions`):**
  - weekly or bi-weekly; customers can skip, pause, resume or cancel from `/account`
  - the daily cron creates orders for due plans and advances the date (idempotent)
  - admins can also create the next order manually
- **Payments:** v1 is cash on delivery. The `PaymentMethod` enum already includes `JAZZCASH` and `EASYPAISA` for v2.

## Security notes

- Passwords are hashed with bcrypt (cost 12). Login compares against a dummy hash for unknown numbers, so response timing doesn't reveal which numbers have accounts.
- Rate limits live in a shared Postgres table, so they hold across serverless instances. Login: 8 per 15 min per IP and per phone. Register: 5/h. Forgot password: 3/h. Orders: 10/h. Enquiries: 5/h.
- Every public form has a honeypot and optional Turnstile, and every input is validated server-side with Zod.
- `/admin`: every page and every admin server action re-checks the `ADMIN` role. Middleware is not relied on.
- Forgot password always responds the same way. It emails a single-use, hashed, 1-hour token, but only if the account has an email. Otherwise the customer is offered WhatsApp help, since SMS OTP is a planned v2.
- Earlier guest orders are **not** auto-linked to a new account by phone number, because the number isn't verified yet. Revisit after SMS OTP.
- Security headers are set in `next.config.ts` (HSTS, nosniff, frame-options, referrer policy, permissions policy). Secrets live only in env vars.

## Testing

```bash
npm test            # 43 unit tests: pricing/deposits, phone + WhatsApp links, validation,
                    # order status rules, subscription dates, delivery-area matching,
                    # en/ur key parity, old-site typo/leftover guards
npm run test:e2e    # needs a seeded database (admin creds from SEED_ADMIN_* env)
```

The e2e suite covers:

- guest order with deposit/exchange and a WhatsApp summary
- register, logout and login with a phone number (including the +92 format and a wrong password)
- one-tap reorder from the account page
- contact form submission and validation errors
- the Urdu RTL page
- an admin moving an order pending → confirmed → out for delivery → delivered
- a non-admin being blocked from `/admin`

## Known limitations / next steps

- SMS OTP (phone verification and password reset without email) is not built yet; it needs an SMS provider.
- JazzCash and Easypaisa online payment are planned for v2.
- The admin area is English-only. Legal pages are English-only drafts.
- Product names and descriptions are stored in the database in English. Urdu product copy would need extra columns.
