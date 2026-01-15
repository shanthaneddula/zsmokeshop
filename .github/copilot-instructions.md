<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Z SMOKE SHOP - AI Coding Agent Instructions

A production Next.js e-commerce platform for Z SMOKE SHOP with comprehensive admin system, pickup orders, and Adidas-inspired design.

## Tech Stack & Architecture

**Framework**: Next.js 15 (App Router) + TypeScript 5 + React 19  
**Styling**: Tailwind CSS with Adidas-inspired minimalist design system  
**Storage**: Hybrid approach - Vercel KV, Redis Cloud (ioredis), Vercel Blob, JSON files  
**Auth**: JWT-based (jsonwebtoken) with bcrypt password hashing  
**Integrations**: Twilio (SMS), Resend (email), html5-qrcode (barcode scanning)

### Storage Strategy (Critical)
- **Production**: Redis Cloud (`REDIS_URL`) preferred over Vercel KV for persistence
- **Development**: JSON files in `src/data/` (products, categories, settings)
- **Images**: Vercel Blob storage (not local filesystem in production)
- **Orders**: Vercel KV (`@vercel/kv`) for order management
- All storage services have hybrid fallback logic in `src/lib/*-storage-service.ts`

### API Route Patterns
- Use `export const dynamic = 'force-dynamic'` for real-time data routes
- Use `export const runtime = 'nodejs'` when using file system operations
- Use `export const revalidate = 0` to disable caching
- Examples: [api/admin/settings/route.ts](src/app/api/admin/settings/route.ts), [api/admin/products/barcode/route.ts](src/app/api/admin/products/barcode/route.ts)

## Design System: Adidas-Inspired Aesthetics

**CRITICAL**: All UI must follow these exact patterns:

- **Typography**: Uppercase text, `tracking-wide`/`tracking-widest`, bold headings
- **Geometry**: Sharp rectangular borders (`rounded-none`), NO rounded corners
- **Borders**: Thin borders (`border`), subtle separators (`border-gray-200`)
- **Colors**: Black/white contrast, strategic gray accents, minimal color usage
- **Spacing**: Strategic white space, clean uncluttered layouts
- **Navigation**: Chevron indicators, expandable menus, mobile-first design

Reference: [components/layout/Header.tsx](src/components/layout/Header.tsx), [app/support/page.tsx](src/app/support/page.tsx)

## Admin System Architecture

**Route Protection**: Middleware at [src/middleware.ts](src/middleware.ts) checks JWT cookie `admin-token`  
**Auth Flow**: Login at `/login` (NOT `/admin/login`) → JWT stored in httpOnly cookie  
**Dashboard**: Server components wrap client components (`AdminLayout` → `*-client.tsx`)

### Admin Panels
- `/admin` - Dashboard with stats
- `/admin/products` - Product CRUD with barcode scanning, bulk import, image upload
- `/admin/categories` - Category management
- `/admin/orders` - Pickup order management with status updates
- `/admin/settings` - Business settings (phone, locations, hours)

**Key Pattern**: Server pages ([admin/products/page.tsx](src/app/admin/products/page.tsx)) render client components (`ProductsClient`) to separate data/UI

## Critical Implementation Patterns

### Redis Connection Management
**NEVER** use `lazyConnect: true` - causes "already connecting" errors. Initialize Redis once:
```typescript
const redisClient = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});
```
See: [REDIS_CONNECTION_MANAGEMENT_SOLUTION.md](REDIS_CONNECTION_MANAGEMENT_SOLUTION.md)

### JWT Authentication (Security Critical)
ALWAYS use `jwt.verify()` for token validation, NEVER manual base64 decode:
```typescript
import jwt from 'jsonwebtoken';
const decoded = jwt.verify(token, JWT_SECRET);
```
See: [lib/auth.ts](src/lib/auth.ts), [lib/auth-server.ts](src/lib/auth-server.ts)

### Redis Key Standards (CRITICAL - Avoid Key Mismatch)
**ALWAYS use storage services, NEVER direct Redis writes for products/categories/users:**
```typescript
// ✅ CORRECT - Use storage service
import * as ProductStorage from '../src/lib/product-storage-service';
await ProductStorage.writeProducts(products);

// ❌ WRONG - Direct Redis write with custom key
await redis.set('products', JSON.stringify(products)); // Wrong key!
```

**Official Keys** (defined in storage services):
- Products: `zsmokeshop:products` (in product-storage-service.ts)
- Categories: `zsmokeshop:categories` (in category-storage-service.ts)
- Users: `zsmokeshop:users`

**Why**: Import scripts using wrong keys (e.g., `'products'`) will make data invisible to the admin/shop which reads from `'zsmokeshop:products'`. See [REDIS_KEY_STANDARDS.md](REDIS_KEY_STANDARDS.md)

### Product Storage Service Pattern
Check storage hierarchy: Redis Cloud → Vercel KV → JSON files. Example pattern in [lib/product-storage-service.ts](src/lib/product-storage-service.ts):
```typescript
const useRedis = !!process.env.REDIS_URL;
const useKV = !hasRedis && (isProduction || hasKVConfig);
// Then branch logic based on storage method
```

### Image Handling
- **Upload**: Vercel Blob via `/api/admin/upload` (max 60s, 1024MB)
- **Never** write to local filesystem in production (EROFS errors)
- Store blob URLs in product/category data
- Image optimization handled by Next.js `<Image>` component

## Pickup Order System

**Flow**: Customer creates order → SMS to customer & store (Twilio) → Admin confirms → Admin marks ready (1hr timer) → Customer picks up  
**Key Services**: [lib/order-storage-service.ts](src/lib/order-storage-service.ts), [lib/twilio-service.ts](src/lib/twilio-service.ts)  
**Order Format**: `ZS-XXXXXX` with status tracking (pending → confirmed → ready → picked-up/no-show)  
**Communication**: Two-way SMS via Twilio, email via Resend

Reference: [PICKUP_ORDER_SYSTEM_SUMMARY.md](PICKUP_ORDER_SYSTEM_SUMMARY.md), [TWILIO_PICKUP_ORDERS_SETUP.md](TWILIO_PICKUP_ORDERS_SETUP.md)

## Development Workflows

### Local Development
```bash
npm run dev          # Start dev server (uses Turbopack)
npm run build        # Production build
npm run build:debug  # Debug build issues
npm run clean        # Clear build cache
```

### Bulk Operations Scripts
- `scripts/import-goldwhip-products.ts` - **AI-powered**: Scrape products from URL, handle variants, auto-upload images
- `scripts/import-puffco-products.js` - Import product data from CSV/JSON
- `scripts/sync-products-to-redis.ts` - Migrate JSON → Redis
- `scripts/upload-puffco-images-to-blob.ts` - Batch upload images to Vercel Blob
- `scripts/migrate-user-passwords.js` - Rehash passwords to bcrypt

**AI Import**: `npx tsx scripts/import-[brand]-products.ts` - See [AI_PRODUCT_IMPORT_GUIDE.md](AI_PRODUCT_IMPORT_GUIDE.md)  
Run with: `npx tsx scripts/<script-name>.ts` (TypeScript) or `node scripts/<script-name>.js`

## Deployment (Vercel)

**Required Environment Variables**:
```
REDIS_URL=redis://...             # Redis Cloud connection
JWT_SECRET=...                     # JWT signing key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=...                 # Admin login
BLOB_READ_WRITE_TOKEN=...         # Vercel Blob access
TWILIO_ACCOUNT_SID=...            # SMS notifications
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
RESEND_API_KEY=...                # Email notifications
```

**Deployment Checklist**: See [VERCEL_DEPLOYMENT_CHECKLIST.md](VERCEL_DEPLOYMENT_CHECKLIST.md)  
**Common Issues**: [VERCEL_DEPLOYMENT_FIX.md](VERCEL_DEPLOYMENT_FIX.md), [IMAGE_UPLOAD_EROFS_FIX.md](IMAGE_UPLOAD_EROFS_FIX.md)

## Context & State Management

- **CartContext** ([contexts/CartContext.tsx](src/contexts/CartContext.tsx)) - Shopping cart with localStorage persistence
- **BannerContext** ([contexts/BannerContext.tsx](src/contexts/BannerContext.tsx)) - Site-wide promotional banner
- **useBusinessSettings** hook - Fetches settings from admin API

## Common Pitfalls to Avoid

1. **DO NOT** use `fs` operations in Edge Runtime or client components
2. **DO NOT** manually decode JWT tokens - always use `jwt.verify()`
3. **DO NOT** use `lazyConnect` with Redis - initialize connection directly
4. **DO NOT** round corners on UI elements - use `rounded-none` (Adidas aesthetic)
5. **DO NOT** forget `dynamic = 'force-dynamic'` on API routes that need fresh data
6. **DO NOT** store images locally in production - use Vercel Blob

## Business Details
**Store Name**: Z SMOKE SHOP  
**Locations**: 719 W William Cannon Dr #105, Austin, TX 78745 | 5318 Cameron Rd, Austin, TX 78723  
**Product Categories**: 16 categories including vapes, glass, kratom, CBD, accessories
