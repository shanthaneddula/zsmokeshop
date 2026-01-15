# 🚀 Multi-Tenant Setup Guide for Z Smoke Shop

**Date:** January 5, 2026  
**Project:** Z SMOKE SHOP → Multi-Tenant POS SaaS Platform

---

## 📋 Overview

This guide walks through setting up the multi-tenant architecture for Z SMOKE SHOP. The system now supports:

- **Custom domains** for each tenant (e.g., joessmokeshop.com, mikesvapes.com)
- **Isolated PostgreSQL databases** per tenant
- **Centralized product catalog** in MongoDB (manufacturer specs, no inventory)
- **Domain-based routing** via middleware

---

## ✅ What's Been Completed

### 1. Multi-Tenant Files Created

**Middleware & Context:**
- ✅ `src/middleware.ts` - Domain resolver middleware
- ✅ `src/lib/tenant-context.ts` - Helper functions to extract tenant from requests

**Authentication APIs (Multi-Tenant):**
- ✅ `src/app/api/auth/login/route.ts` - Login with tenant DB lookup
- ✅ `src/app/api/auth/register/route.ts` - Register new users in tenant DB
- ✅ `src/app/api/auth/me/route.ts` - Get current user session
- ✅ `src/app/api/auth/logout/route.ts` - Logout and clear cookie

**Test APIs:**
- ✅ `src/app/api/tenant/info/route.ts` - Test endpoint to verify tenant context

### 2. Database Configuration Added

Added to `.env.local`:
```bash
# MongoDB Atlas - Master Product Catalog
MONGODB_URI="mongodb+srv://..."

# PostgreSQL Master Database - Tenant Registry
MASTER_DATABASE_URL="postgresql://postgres:...@db.gxgmtgkepikakcfpncyg.supabase.co:5432/postgres"

# PostgreSQL Tenant Database - Joe's Smoke Shop
TENANT_1_DATABASE_URL="postgresql://postgres:...@db.uxwqhvfbtfrvuvbezrdw.supabase.co:5432/postgres"
TENANT_1_PROJECT_REF="uxwqhvfbtfrvuvbezrdw"
```

---

## 🔧 Missing Components (Need to Copy from smokeshop-saas)

### 1. Prisma Schemas

Copy these files from `/Users/shanthaneddula/Desktop/smokeshop-saas/prisma/`:

**`prisma/schema-master.prisma`** - Master database (tenant registry):
- Tables: tenants, admin_users, tenant_migrations, tenant_activity_logs, platform_settings
- Output: `@prisma/master-client`

**`prisma/schema-tenant.prisma`** - Tenant database (operational data):
- Tables: users, stores, products, customers, orders, pos_transactions, pos_sessions
- Output: `@prisma/client`

### 2. Database Client Libraries

Copy these files from `/Users/shanthaneddula/Desktop/smokeshop-saas/src/lib/db/`:

**`src/lib/db/master-db.ts`** - Master database client
- Functions: `getTenantByDomain()`, `getTenantBySlug()`, `createTenant()`, `logTenantActivity()`

**`src/lib/db/tenant-connector.ts`** - Dynamic tenant DB connector
- Class: `TenantConnectionPool` with LRU cache
- Functions: `getTenantDb()`, `buildConnectionString()`, `testTenantConnection()`

**`src/lib/db/mongodb.ts`** - MongoDB master catalog
- Mongoose schemas: `MasterProduct`, `MasterBrand`, `MasterCategory`
- Functions: `findProductByBarcode()`, `searchProducts()`

### 3. TypeScript Types

Copy from `/Users/shanthaneddula/Desktop/smokeshop-saas/src/types/`:

**`src/types/master-catalog.ts`** - Product catalog types
- Interfaces: `MasterProduct`, `MasterProductVariant`, `ProductActivationRequest`

### 4. Copy Commands

```bash
# From zsmokeshop directory
cd /Users/shanthaneddula/Desktop/zsmokeshop

# Create directories
mkdir -p prisma
mkdir -p src/lib/db
mkdir -p src/types

# Copy Prisma schemas
cp ../smokeshop-saas/prisma/schema-master.prisma prisma/
cp ../smokeshop-saas/prisma/schema-tenant.prisma prisma/

# Copy database clients
cp ../smokeshop-saas/src/lib/db/master-db.ts src/lib/db/
cp ../smokeshop-saas/src/lib/db/tenant-connector.ts src/lib/db/
cp ../smokeshop-saas/src/lib/db/mongodb.ts src/lib/db/

# Copy types
cp ../smokeshop-saas/src/types/master-catalog.ts src/types/
```

---

## 📦 Install Dependencies

```bash
cd /Users/shanthaneddula/Desktop/zsmokeshop

# Install Prisma and database drivers
npm install @prisma/client prisma ioredis mongoose
npm install --save-dev @types/node

# Generate Prisma clients
npx prisma generate --schema=prisma/schema-master.prisma
npx prisma generate --schema=prisma/schema-tenant.prisma
```

---

## 🧪 Testing Steps

### 1. Test Middleware

Start dev server:
```bash
npm run dev
```

Test tenant context:
```bash
curl http://localhost:3000/api/tenant/info
```

Expected output:
```json
{
  "success": true,
  "tenant": {
    "id": "...",
    "name": "Joe's Smoke Shop",
    "slug": "joes-smoke-shop",
    "domain": "joessmokeshop.local"
  },
  "database": {
    "users": 1,
    "stores": 1,
    "products": 0
  },
  "message": "Tenant context working! 🎉"
}
```

### 2. Test Login

**Test Credentials:**
- Email: `joe@joessmokeshop.com`
- Password: `Password123!`

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joe@joessmokeshop.com",
    "password": "Password123!"
  }'
```

Expected output:
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "joe@joessmokeshop.com",
    "firstName": "Joe",
    "lastName": "Smith",
    "role": "owner",
    "store": {
      "id": "...",
      "name": "Main Location"
    }
  },
  "tenant": {
    "id": "...",
    "name": "Joe's Smoke Shop",
    "slug": "joes-smoke-shop"
  }
}
```

### 3. Test Session

```bash
curl http://localhost:3000/api/auth/me \
  -H "Cookie: auth-token=YOUR_TOKEN_HERE"
```

---

## 🎯 How the System Works

### Request Flow

```
1. Browser Request → joessmokeshop.local/dashboard
   ↓
2. Middleware intercepts request
   - Extracts domain: "joessmokeshop.local"
   - Queries master DB: getTenantByDomain("joessmokeshop.local")
   - Finds tenant: Joe's Smoke Shop
   - Injects tenant info into request headers:
     * x-tenant-id
     * x-tenant-slug
     * x-tenant-name
     * x-tenant-db-config (base64 encoded connection details)
   ↓
3. API Route Handler (e.g., /api/auth/login)
   - Calls getTenantInfo() to extract headers
   - Calls requireTenantDb() to get tenant's database connection
   - Queries tenant DB: db.user.findUnique({ where: { email }})
   - Returns tenant-specific data
   ↓
4. Response sent back to browser
```

### Database Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Master Database                         │
│                (gxgmtgkepikakcfpncyg)                       │
│                                                             │
│  Tables:                                                    │
│  - tenants (all registered smoke shops)                    │
│  - admin_users (platform administrators)                   │
│  - tenant_migrations (track schema updates)                │
│  - tenant_activity_logs (audit trail)                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ References
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Tenant Database #1                         │
│              Joe's Smoke Shop                               │
│            (uxwqhvfbtfrvuvbezrdw)                          │
│                                                             │
│  Tables:                                                    │
│  - users (shop employees)                                  │
│  - stores (physical locations)                             │
│  - products (inventory - links to MongoDB via masterProductId) │
│  - customers (customer database)                            │
│  - orders (pickup/delivery orders)                          │
│  - pos_transactions (in-store sales)                        │
│  - pos_sessions (cash drawer management)                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Tenant Database #2                         │
│              Mike's Vapes (future)                          │
│            (another-supabase-project)                       │
│                                                             │
│  Tables: Same schema as Tenant #1                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              MongoDB Atlas - Product Catalog                │
│            (cluster0.n6m43gv.mongodb.net)                   │
│                                                             │
│  Collections:                                               │
│  - masterproducts (manufacturer specs, barcodes, MSRP)     │
│  - masterbrands (brand information)                         │
│  - mastercategories (product categories)                    │
│                                                             │
│  NOTE: No inventory quantities - info only!                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Features

### 1. Complete Database Isolation
- Each tenant has separate PostgreSQL database
- No cross-tenant data leakage possible
- Middleware enforces tenant boundary

### 2. JWT Authentication
- httpOnly cookies (no JavaScript access)
- 7-day expiration
- Includes tenant ID in token
- Validated on every protected request

### 3. Domain Validation
- Middleware checks tenant status (active/suspended)
- 404 for unregistered domains
- 403 for inactive tenants

---

## 📊 Current System Status

**Master Database:**
- Project: `gxgmtgkepikakcfpncyg`
- Tenants registered: 1 (Joe's Smoke Shop)
- Status: Active

**Tenant #1 (Joe's Smoke Shop):**
- Project: `uxwqhvfbtfrvuvbezrdw`
- Domain: `joessmokeshop.local`
- Users: 1 (owner)
- Stores: 1 (Main Location)
- Products: 0 (ready for activation)

**MongoDB Product Catalog:**
- Cluster: `cluster0.n6m43gv`
- Products: 0 (ready to import)
- Status: Connected

---

## 🚀 Next Steps

### 1. Complete File Migration ⬜
- Copy Prisma schemas from smokeshop-saas
- Copy database clients from smokeshop-saas
- Generate Prisma clients
- Install dependencies

### 2. Test End-to-End Flow ⬜
- Start dev server
- Test `/api/tenant/info`
- Test login with Joe's credentials
- Verify tenant context injection

### 3. Build Product Activation ⬜
- MongoDB product browser
- Barcode scanner integration
- Product activation API
- Copy product to tenant DB with pricing

### 4. Update Existing Pages ⬜
- `/admin` dashboard → use tenant context
- `/admin/products` → tenant-specific products
- `/admin/orders` → tenant-specific orders
- `/pos` → tenant POS system

### 5. Add Domain Mapping UI ⬜
- Platform admin panel
- Register new tenants
- Manage tenant status
- Migration orchestrator

---

## 📞 Support

**Test Tenant Login:**
```
Domain: joessmokeshop.local (localhost defaults to this)
Email: joe@joessmokeshop.com
Password: Password123!
```

**Database Projects:**
- Master: https://supabase.com/dashboard/project/gxgmtgkepikakcfpncyg
- Tenant 1: https://supabase.com/dashboard/project/uxwqhvfbtfrvuvbezrdw

**MongoDB Atlas:**
- https://cloud.mongodb.com/

---

**Status:** Ready to copy files and test! 🎉
