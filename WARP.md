# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Core commands

This is a Next.js App Router project using npm.

- Install dependencies:
  - `npm install`
- Run the dev server (Turbopack):
  - `npm run dev`
- Build for production:
  - `npm run build`
  - Debug production build with extra logging: `npm run build:debug`
- Start the production server (after `npm run build`):
  - `npm start`
- Lint the project (ESLint via `next lint`):
  - `npm run lint`
- Clean build artefacts:
  - `npm run clean`
- Type checking:
  - There is no dedicated `type-check` script; to run TypeScript checks manually, use `npx tsc --noEmit` from the repo root.

Tests are not currently configured in this repo (no `test` script or local test files under `src/`). If you add a test runner (Jest/Vitest/Playwright/etc.), also add appropriate npm scripts in `package.json`.

## Important conventions

- TypeScript strict mode is enabled (see `tsconfig.json`).
- Path alias `@/*` maps to `./src/*` — prefer imports like `@/components/...` instead of relative `../../` chains.
- The project is optimized for deployment on Vercel and assumes a modern Node.js runtime (18+).
- Public and admin experiences share a single Next.js App Router app under `src/app`.

## Application architecture (high level)

### 1. App shell & layout

- **Root layout**: `src/app/layout.tsx`
  - Sets global font (Inter), viewport, and SEO metadata (including `metadataBase` that switches between `localhost` and production URL by `NODE_ENV`).
  - Wraps the app with:
    - `ThemeProvider` (`@/components/ui/theme-provider`) for dark/light themes.
    - `CartProvider` and `BannerProvider` from `src/contexts`.
    - `AgeVerification` modal (`@/components/layout/age-verification`) that gates content.
    - `TawkToChat` widget (`@/components/chat/TawkToChat`).
    - `ConditionalLayout` (`@/components/layout/conditional-layout`) which decides whether to render the public marketing shell (header/footer) or a clean admin layout based on the current route.
- **Global styles**: `src/app/globals.css` contains Tailwind setup and global design tokens.

### 2. Public site (customer-facing)

Public routes live directly under `src/app`:

- `page.tsx` — home page, composed from section components under `src/components/sections`:
  - `HeroSection`, `FeaturedProducts`, `HomepageCatalogue`, `StorePhotosGallery`, `StoreLocations`, `HelpAndReviews`.
- Additional key routes:
  - `support/` — help/support page with Adidas-style layout.
  - `locations/` — store locations (driven by business settings).
  - `shop/` — catalog / shop-all view.
  - `products/[slug]/` — individual product detail pages, including `loading.tsx` and `not-found.tsx` for App Router states.
  - `cart/`, `checkout/`, `orders/track/`, `account/`, `contact/` — customer flows around browsing and managing pickup orders/cart.
  - `login/` — admin login experience exposed at a public-friendly route.

UI is decomposed into domain-focused component groups under `src/components`:

- `components/layout/` — header, footer, announcement bar, age verification, and `ConditionalLayout` implementing the Adidas-inspired frame.
- `components/sections/` — homepage and marketing sections wired into `src/app/page.tsx` and related pages.
- `components/product/` — all product detail UI (image galleries, specs for mobile/desktop, sticky action bar, related products, breadcrumbs, etc.).
- `components/ui/` — shared primitives such as theme provider, pagination, rich text renderer, optimized image component, and the order notification bell for the admin.

Static marketing data such as category definitions and promo tiles live in `src/data/index.ts` and are typed via `src/types`.

### 3. Admin application

The admin experience is mounted under `src/app/admin` and is protected by middleware and an admin layout.

- **Route protection**:
  - `src/middleware.ts` applies to `/admin/:path*` and checks for the `admin-token` cookie.
  - Unauthenticated requests are redirected to `/login` (note: `/admin/login` is redirected to `/login`).
  - Token verification is intentionally left to individual handlers to avoid Edge runtime issues.
- **Admin layout**: `src/app/admin/layout.tsx`
  - Runs on the server.
  - Reads the `admin-token` cookie and redirects unauthenticated users to `/login`.
  - Renders a minimal, headerless layout for dashboard-style UIs.
- **Admin pages** (non-exhaustive):
  - `admin/page.tsx` and `admin/dashboard/`, `admin/my-dashboard/` — main dashboards.
  - `admin/products/`, `admin/categories/` — product and category management.
  - `admin/store-photos/` — photo gallery / image management.
  - `admin/settings/` — business settings (locations, age gate, etc.).
  - `admin/users/`, `admin/profile/` — staff/users and profile management.
  - `admin/timesheet/` — staff timesheet tracking.
  - `admin/orders/` — pickup order management.
  - `admin/login/` exists but actual login flow is exposed via `/login` and shared `login-form.tsx`.
- **Admin components**:
  - `src/app/admin/components/` contains page-local layout pieces (admin header/layout, forms, preview modals, admin image upload, etc.).
  - `src/components/admin/` contains cross-admin UI such as barcode scanner, replacement-product search, and common admin inputs.
- **Real-time-ish admin UX**:
  - `src/hooks/useOrderNotifications.ts` polls `/api/orders` for new pending orders, plays looping notification audio, and integrates with the `OrderNotificationBell` UI component.

Admin authentication and rate-limiting utilities live in `src/lib/auth.ts`:

- `validateCredentials` checks credentials against `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars (falling back to a default `admin`/`admin123` combination) and issues an `AdminUser` payload.
- JWTs are created via `createToken` and verified via `verifyToken`; JWT secret is `JWT_SECRET` (with a hardcoded fallback for non-production).
- Simple in-memory login attempt tracking (`checkRateLimit`, `recordLoginAttempt`) protects against brute force attacks.

### 4. Data & service layer

Most non-trivial logic lives in `src/lib/`, which acts as the backend/service layer for the App Router.

#### Storage services

Storage is environment-sensitive and generally follows this pattern:

- **Products** — `src/lib/product-storage-service.ts`
  - In production:
    - Prefers Redis (`REDIS_URL`) via `ioredis`.
    - Falls back to Vercel KV (`KV_REST_API_URL`/`KV_REST_API_TOKEN`) if Redis is not available.
  - In development (no Redis/KV): reads and writes `src/data/products.json`, creating timestamped backups under `src/data/backup/` before writes.
  - Exposes a `ProductStorageService` that supports CRUD, search, category filtering, bulk delete, and migration (`migrateToKV`) from JSON → Redis/KV.

- **Business settings** — `src/lib/settings-service.ts` + `src/data/admin-config.json`
  - Reads from Redis first (if available), then Vercel KV, then the JSON config file.
  - On first read, can seed Redis/KV from `admin-config.json`.
  - Exposes `SettingsService.getSettings` / `updateSettings` to power the admin settings panel and the public site via `useBusinessSettings`.
  - Default settings (used on failure) mirror the two store locations and age-verification requirements defined in `admin-config.json`.

- **Orders** — `src/lib/order-storage-service.ts`
  - Uses Redis exclusively; if `REDIS_URL` is not set, order management features will fail fast with explicit errors.
  - Models pickup orders with:
    - An auto-incrementing numeric order counter stored under `orders:counter` and human-readable order numbers like `ZS-000001`.
    - Multiple Redis indices (sets) by phone, status, and location (`orders:phone:*`, `orders:status:*`, `orders:location:*`) plus a global `orders:list`.
  - Supports create, update, filter-by-status/location/date, search, statistics (`getOrderStats`), and list-item projection (`orderToListItem`).

- **Order expiration & timers** — `src/lib/order-expiration-service.ts` and `src/lib/order-timer-utils.ts`
  - `checkExpiredOrders` is a server-only helper that finds `ready` orders older than 1 hour and promotes them to `no-show` via `updateOrderStatus`.
  - Timer helpers compute remaining minutes and “expiring soon” flags for the admin UI.

- **Other storage** (not exhaustively listed but follow the same pattern):
  - `category-storage-service.ts`, `user-storage-service.ts`, `store-photos-storage-service.ts`, `timesheet-service.ts`, `activity-log-service.ts` provide similar Redis/KV-or-file backed CRUD for their domains.

#### Communications (Twilio & Resend)

All outbound communications for pickup orders are centralized under two services (server-side only; do not import into client components):

- **Twilio SMS** — `src/lib/twilio-service.ts`
  - Requires `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`.
  - Uses `fetch` directly against the Twilio REST API and returns a `Communication` record.
  - Provides helpers for the full order lifecycle:
    - Confirmation SMS to customer.
    - New-order SMS to store by location.
    - Ready-for-pickup, replacement suggestion, cancellation, reminder, no-show, and generic notifications.
  - Also exposes phone formatting/validation and parsing utilities for incoming Twilio webhooks.

- **Resend email** — `src/lib/resend-service.ts`
  - Requires `RESEND_API_KEY`; uses `RESEND_FROM_EMAIL` or defaults to `orders@zsmokeshop.com`.
  - Sends rich emails for order confirmation, ready-for-pickup, cancellation, store notifications, and generic status updates.
  - Uses `StoreLocation` to render correct store name, address, and phone in the email templates.

#### Business settings consumption

- `src/hooks/useBusinessSettings.ts` is the client hook used by public-layout components to read live business settings:
  - Fetches from `/api/admin/settings` with `no-store` caching and local event listeners for refresh.
  - Falls back to embedded defaults if the API fails.
  - Provides helpers `getPrimaryPhone` and `getActiveLocations` for UI components.

### 5. API routes

API routes live under `src/app/api` and delegate almost all logic to `src/lib` services.

- Example: `src/app/api/orders/route.ts`
  - GET endpoint for `/api/orders`.
  - Supports:
    - `?stats=true` to return aggregate stats from `getOrderStats`.
    - Filtering via `status`, `location`, `dateFrom`, `dateTo`, `since`, and `search` query params, mapped into `OrderFilters`.
  - Returns `{ success, orders, count }` JSON payloads or `500` on error.

Admin APIs (e.g. for settings, products, timesheets) follow the same pattern: thin route handlers calling the relevant `src/lib/*-service.ts` modules.

## Design system notes (Adidas-inspired)

Future UI work should respect the established visual system (see `README.md` and `PROJECT_SUMMARY.md`):

- **Visual language**
  - Minimalist, highly structured layouts with generous whitespace.
  - Sharp rectangular borders (`border` / `border-2`), no rounded corners unless explicitly required.
  - High-contrast black/white palette with restrained gray accents; dark mode mirrors this with inverted emphasis.
- **Typography**
  - Bold, uppercase headings with wide tracking (`tracking-wide` → `tracking-widest`).
  - Headline scale roughly from `text-3xl` to `text-8xl` for heroes; medium weights for body text.
- **Interaction**
  - Subtle hover states (primarily color inversions and simple transforms).
  - Smooth but restrained Framer Motion animations.
  - Mobile-first layout: single-column on small screens with expandable navigation and side-by-side CTAs where appropriate.

When adding new components or pages, look at `src/components/sections/hero-section.tsx`, `store-locations.tsx`, and the header/footer implementations for canonical patterns.

## Business domain overview

Key business assumptions that show up across the codebase (and should be preserved when editing):

- **Store identity**
  - Two locations in Austin, TX (William Cannon and Cameron Rd) defined in `admin-config.json` and surfaced via business settings.
  - Minimum age 21 with mandatory age verification message, enforced visually via the `AgeVerification` component.
- **Product & category model**
  - Categories are defined in `src/data/index.ts` and mirrored in the navigation (`Batteries`, `Candles & Incense`, `Vapes, Mods & Pods`, `THC-A`, etc.).
  - Dynamic product, category, and featured-product data is driven via the admin and stored in Redis/KV/JSON, not hardcoded TypeScript arrays.
- **Pickup orders workflow**
  - Customers place pickup orders; stores manage them via the admin dashboard.
  - Orders receive SMS/email confirmations, ready notifications, reminders, and cancellation/no-show notifications based on status transitions and timer services.
  - Admin staff rely on the notification bell, Twilio SMS, and Resend emails for operational awareness.

Preserve these flows when refactoring; changes to the service layer in `src/lib/` typically have consequences in both public pages and admin UIs.
