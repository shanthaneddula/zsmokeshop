# Quick Deployment Guide - Product Storage Fix

## Issue Fixed
✅ EROFS: read-only file system errors when creating/deleting products in production

## What Changed

The application now uses **Vercel KV (Redis)** for product storage in production instead of trying to write to JSON files on a read-only filesystem.

## Required Action Before Deploying

### 1. Set Up Vercel KV (ONE TIME SETUP)

1. Go to https://vercel.com/dashboard
2. Click on **Storage** tab
3. Click **Create Database**
4. Select **KV (Redis)**
5. Name it: `zsmokeshop-kv`
6. Click **Create**
7. Click **Connect Project** and select your project
8. Select environments: Production, Preview, Development
9. Click **Connect**

This will automatically add these environment variables:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

### 2. Deploy the Fix

```bash
# Commit and push the changes
git add .
git commit -m "Fix: Migrate product storage to Vercel KV"
git push origin main
```

Vercel will automatically deploy.

### 3. Migrate Existing Data (If Needed)

If you have existing products that need to be migrated to KV:

**Option A: Through Code**
The migration will happen automatically on first deployment since KV will be empty.

**Option B: Manual Migration API** (After deployment)
1. Log into your admin panel
2. Open browser console
3. Run:
```javascript
fetch('/api/admin/migrate-products-to-kv', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

### 4. Test After Deployment

1. ✅ Create a new product
2. ✅ Edit an existing product
3. ✅ Delete a product
4. ✅ Bulk delete products

All operations should now work without EROFS errors!

## Files Changed

### New Files
- `src/lib/product-storage-service.ts` - Main storage service
- `src/app/api/admin/products/bulk-delete/route.ts` - Bulk delete endpoint
- `src/app/api/admin/migrate-products-to-kv/route.ts` - Migration utility
- `PRODUCT_STORAGE_KV_MIGRATION.md` - Detailed documentation

### Modified Files
- `src/app/api/admin/products/route.ts` - List/Create products
- `src/app/api/admin/products/[id]/route.ts` - Get/Update/Delete single product
- `src/app/api/admin/categories/[id]/route.ts` - Category operations
- `src/app/api/admin/migrate/route.ts` - Data migration

## How It Works

**Production (Vercel):**
- Detects `NODE_ENV === 'production'`
- Uses Vercel KV (Redis) for storage
- All writes go to Redis, not filesystem

**Local Development:**
- Uses JSON files in `src/data/products.json`
- No setup required, works as before
- Can optionally use KV if you set environment variables in `.env.local`

## Troubleshooting

### "KV configuration not available" error

**Solution:** Make sure you completed Step 1 (Set Up Vercel KV) and redeployed.

### Products not saving after deployment

**Solution:**
1. Check Vercel project settings → Environment Variables
2. Verify `KV_REST_API_URL` and `KV_REST_API_TOKEN` exist
3. Redeploy: `git commit --allow-empty -m "Redeploy" && git push`

### Want to check KV is working?

Check Vercel logs:
1. Go to your Vercel project
2. Click **Deployments**
3. Click on latest deployment
4. Click **Functions** tab
5. Look for logs mentioning "Vercel KV" or "Redis"

You should see logs like:
```
🔧 Product Storage Service Initialized: { storageMethod: 'Vercel KV (Redis)' }
📡 Writing to Vercel KV...
✅ Saved 5 products to KV
```

## Need Help?

Check the detailed documentation in `PRODUCT_STORAGE_KV_MIGRATION.md`
