# Z Smoke Shop — setup and operations

This is the current setup guide for [zsmokeshop.com](https://zsmokeshop.com) (Z Smoke Shop, Austin, TX). It reflects the code in this repo, not older multi-tenant or Prisma-based docs.

For a short product overview, see [README.md](../README.md).

## Overview and stack

- **App**: Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS, Framer Motion
- **Hosting**: Vercel (`vercel.json` sets API function timeouts; the upload route allows 60s)
- **Primary data store**: Redis (`REDIS_URL`, via `ioredis`) when that env var is set — including local development if `.env.local` has it
- **Fallback storage**: Vercel KV (`KV_REST_API_URL` + `KV_REST_API_TOKEN`) for products, categories, settings, and store photos if Redis is not configured; then local JSON under `src/data/` in development
- **Orders, users, timesheets, activity logs**: Redis is required (`order-storage-service` and related libs do not fall back to JSON)
- **Images**: Vercel Blob in production (`@vercel/blob` through `/api/admin/upload`). Do not write product images to the serverless filesystem (it is read-only). Local Puffco assets also live under `public/images/products/puffco/`
- **Auth**: JWT in an httpOnly `admin-token` cookie (`jsonwebtoken` + `bcryptjs`). Login is at `/login` (`/admin/login` redirects there). Middleware does **not** check the JWT; API routes and admin pages do
- **Email**: Resend (`RESEND_API_KEY`)
- **SMS**: Twilio (`TWILIO_*`), plus the webhook at `/api/webhooks/twilio-sms` and terms at `/sms-terms.html`
- **Chat**: Tawk.to widget, loaded only after age verification (`src/components/chat/TawkToChat.tsx`)
- **Reviews (optional)**: Google Places via `GOOGLE_PLACES_API_KEY`

Canonical Redis keys used by the app:

| Key | Purpose |
| --- | --- |
| `zsmokeshop:products` | Product catalog (this is what the shop and admin read) |
| `zsmokeshop:categories` | Categories |
| `business-settings` | Business settings, including `maintenanceMode` |
| `zsmokeshop:store-photos` | Store photo gallery |
| `zsmokeshop:users` | Admin users |
| `zsmokeshop:activity_logs` | Admin activity logs |
| `zsmokeshop:timesheets` / `zsmokeshop:active_sessions` | Timesheets |
| `order:{id}`, `orders:list`, `orders:counter`, `orders:phone:*`, `orders:status:*`, `orders:location:*` | Pickup orders |

Always use the storage services in `src/lib/*-storage-service.ts` for products, categories, settings, and users. Do not write a bare `products` key — a leftover unprefixed key is invisible to the app.

## Local development

Prerequisites: Node.js 18+ and npm.

```bash
cp env.template .env.local   # then fill in values; REDIS_URL is required for orders and for a catalog that matches production
npm install
npm run dev                  # http://localhost:3000 (Turbopack)
```

Other scripts: `npm run build`, `npm run build:debug`, `npm run start`, `npm run lint`, `npm run clean`.

If `business-settings` in Redis has `maintenanceMode: true` (typical when using the production Redis URL locally), public pages redirect to `/maintenance`. `/login`, `/admin/*`, `/maintenance`, and `/api/*` stay reachable. Turn the flag off in Admin → Settings after signing in, or use a separate Redis database for local work.

Local JSON fallbacks (used only when Redis and KV are not configured): `src/data/products.json`, `src/data/categories.json`, and `src/data/admin-config.json` (business settings only — it must not contain password hashes or other credentials).

## Environment variables

Set these in `.env.local` (local) and in the Vercel project (production). **Never commit secret values.** Names only:

| Name | Used for |
| --- | --- |
| `REDIS_URL` | Redis Cloud (or compatible) connection. Preferred store for catalog, settings, orders, users |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Optional Vercel KV / Upstash REST fallback |
| `JWT_SECRET` | Signs the admin JWT. Set a long random string in production |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` | Optional bootstrap admin login when no Redis user matches. `ADMIN_PASSWORD_HASH` is a bcrypt hash, not a plaintext password. Production admins live in Redis (`zsmokeshop:users`), not in `admin-config.json` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob uploads (usually injected when a Blob store is linked on Vercel) |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Order email notifications (default from-address is `orders@zsmokeshop.com` if unset) |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | Pickup-order SMS |
| `STORE_PHONE_WILLIAM_CANNON` | Store phone number used in SMS/email copy |
| `STORE_EMAIL_WILLIAM_CANNON` | Store email address used in notifications |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for sitemaps and SEO (`https://zsmokeshop.com`) |
| `CRON_SECRET` | Optional bearer secret for `GET /api/cron/expire-orders` |
| `GOOGLE_PLACES_API_KEY` | Optional Google review fetch |
| `NODE_ENV`, `VERCEL` | Set automatically in those environments |

`env.template` is the tracked starter file (placeholders only). Copy it to `.env.local`. Change the admin password after first login (Admin → Settings or Profile) and rotate it if it was ever committed or shared.

## Redis and Vercel KV

1. Create a Redis instance (Redis Cloud or similar) and set `REDIS_URL`.
2. Optionally link Vercel KV and set the REST URL/token as a fallback.
3. Confirm the app is reading the prefixed keys above. The shop API and admin catalog use `zsmokeshop:products` and `zsmokeshop:categories`.
4. Settings (including maintenance mode) live in `business-settings`.

Redis connection options used in the app: `maxRetriesPerRequest: 3` and a short retry strategy. Do not set `lazyConnect: true` (it caused connection errors in the past).

## Vercel deploy and Blob

- Production historically deploys from the `main` branch on Vercel.
- `vercel.json` sets a 30s max duration for `src/app/api/**/*.ts` and 60s / 1024 MB for `/api/admin/upload`.
- Link a Vercel Blob store so `BLOB_READ_WRITE_TOKEN` is available. Admin image uploads go to Blob in production (`NODE_ENV=production` or `VERCEL=1`).
- Configure the env vars from the table in the Vercel project settings.
- An expire-orders endpoint exists at `/api/cron/expire-orders`. It is **not** currently registered in `vercel.json`. To schedule it, add a Vercel cron for that path (every 5 minutes is a reasonable interval) and set `CRON_SECRET` if you want the bearer check enabled.
- `NEXT_PUBLIC_SITE_URL` should be `https://zsmokeshop.com` so `sitemap.xml`, `sitemap-products.xml`, `sitemap-categories.xml`, and `robots.txt` use the right origin. `/admin`, `/api`, `/login`, `/cart`, and `/checkout` are disallowed in `robots.txt`.

## Resend email orders

1. Create a Resend account and API key.
2. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` (verify the sending domain).
3. Order create and status-update API routes call `src/lib/resend-service.ts` (new order, ready, cancelled, and related notifications).

## Twilio pickup SMS

1. Create a Twilio account, number, and credentials.
2. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`.
3. Point the number’s incoming-SMS webhook at `https://zsmokeshop.com/api/webhooks/twilio-sms`.
4. SMS consent / terms are served at `/sms-terms.html` (`public/sms-terms.html`).
5. Store contact numbers used in message copy come from `STORE_PHONE_*` and from business settings.

Flow in brief: customer places a pickup order → SMS/email to the shop and customer → admin confirms and marks ready (pickup window) → picked up or no-show.

## Tawk chat

The Tawk.to script is hardcoded in `src/components/chat/TawkToChat.tsx` and is injected only after the customer passes age verification (`sessionStorage` / `ageVerified` event). To change the widget, update that component. It is also mounted from `src/app/layout.tsx` and can be opened from the support page.

## Admin and maintenance mode

- Sign in at `/login`. After auth, use `/admin` (dashboard, products, categories, orders, users, timesheets, store photos, settings).
- **Maintenance mode** is a toggle in Admin → Settings (`maintenanceMode` in `business-settings`).
- When it is `true`, `src/middleware.ts` redirects public pages to `/maintenance`. Excluded paths: `/admin`, `/login`, `/maintenance`, `/_next`, `/api/*`, and favicon. Middleware reads `GET /api/public/maintenance-status` (returns only `{ maintenanceMode }`). If that fetch fails, the middleware **fails open** (the site stays up).
- `GET` and `PUT` `/api/admin/settings` both require a valid admin token (`admin-token` cookie).
- Public storefront pages read safe business info (store name, phone, hours, address, cart/price flags, tax display) from `GET /api/public/business-info`. That response does not include API keys, notification config, Twilio/Resend settings, or other internal flags.

## Product import (CSV / bulk scripts)

Catalog writes should target `zsmokeshop:products`.

- **CSV bulk import**: `npx tsx scripts/bulk-import-products.ts`  
  Reads `disposablevape.csv` in the repo root (columns: product name, category, brand, sku, price, sale price, short description, detailed description, product image). Skips duplicates and writes to Redis. The script is not wired as an npm script.
- **Remove duplicates**: `npx tsx scripts/remove-duplicate-products.ts` — keeps the newest product when SKU or name collides.
- **Sync local JSON to Redis**: `npx tsx scripts/sync-to-production-redis.ts` — reads `src/data/products.json` and writes `zsmokeshop:products`. Uses whatever `REDIS_URL` is in the environment; treat this as a production write if that URL is production.

There is no remaining in-repo AI scrape/import script. Images for imported rows can be URLs or uploaded later in Admin → Products (Vercel Blob in production).

## Ops scripts

These are manual tools, not `package.json` scripts. They need `.env.local` / `REDIS_URL`. Prefer a dry run or a snapshot of Redis before anything that writes.

| Script | Command | Notes |
| --- | --- | --- |
| `scripts/clear-redis-cache.js` | `node scripts/clear-redis-cache.js` | Clears the `business-settings` cache key (a write). Use with care |
| `scripts/inspect-users.js` | `node -r dotenv/config scripts/inspect-users.js dotenv_config_path=.env.local` | Read-only inspection of `zsmokeshop:users` (prefer `.env.local`; do not hardcode URLs) |
| `scripts/migrate-user-passwords.js` | `node scripts/migrate-user-passwords.js` | Rehashes user passwords to bcrypt (a write) |
| `scripts/sync-to-production-redis.ts` | `npx tsx scripts/sync-to-production-redis.ts` | Overwrites the Redis product catalog from `src/data/products.json` |
| `scripts/bulk-import-products.ts` | `npx tsx scripts/bulk-import-products.ts` | CSV import into Redis |
| `scripts/remove-duplicate-products.ts` | `npx tsx scripts/remove-duplicate-products.ts` | Dedupes the Redis catalog |

A Node.js Redis client or the Redis Cloud UI can also be used to inspect keys. Take a read-only backup before destructive ops.
