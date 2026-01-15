# Bulk Product Import Guide for Z SMOKE SHOP

**Complete guide for extracting, formatting, and importing products with images**

Last Updated: December 21, 2025

---

## Table of Contents
1. [Overview](#overview)
2. [Product Data Requirements](#product-data-requirements)
3. [Step-by-Step Import Process](#step-by-step-import-process)
4. [Common Mistakes & Solutions](#common-mistakes--solutions)
5. [Storage Architecture](#storage-architecture)
6. [Verification & Testing](#verification--testing)

---

## Overview

This guide documents the complete process of importing 172 Puffco products, including all mistakes made and how they were fixed. Use this as a reference for future bulk imports.

### Key Learning: Storage Architecture
- **Primary Storage**: Redis Cloud (Production) - NOT local JSON files
- **Backup Storage**: JSON files (`src/data/products.json`) - for disaster recovery only
- **Image Storage**: Vercel Blob Storage - NOT local `/public` folder
- **Development**: Uses same Redis Cloud as production (no local storage)

---

## Product Data Requirements

### Required Fields (35+ fields)
See `src/types/index.ts` - `AdminProduct` interface for complete schema.

#### Core Fields (Required)
```typescript
{
  name: string;                    // Product name
  slug: string;                    // URL-friendly name (auto-generated)
  category: string;                // Must match categories.json slugs
  price: number;                   // Regular price
  image: string;                   // Vercel Blob URL (NOT local path)
  inStock: boolean;                // true/false
  status: 'active' | 'inactive' | 'draft';
}
```

#### Important Optional Fields
```typescript
{
  salePrice?: number;              // Sale price (must be < price)
  shortDescription?: string;       // 1-2 sentences (max 200 chars recommended)
  detailedDescription?: string;    // Full description
  brand?: string;                  // Brand name
  stockQuantity?: number;          // Numeric inventory count
  badges?: string[];               // ['new', 'sale', 'best-seller', 'out-of-stock']
  sku?: string;                    // SKU/product code
  barcode?: string;                // UPC/EAN
  complianceLevel?: string;        // 'age-restricted' for tobacco products
  ageRestriction?: number;         // 21 for tobacco/cannabis
  
  // Cannabis-specific
  subcategory?: string;
  strainType?: 'indica' | 'sativa' | 'hybrid';
  cannabinoidType?: string[];      // ['THC-A', 'CBD', 'Delta-8']
  cannabinoidStrength?: number;    // mg
  thcaPercentage?: number;         // %
}
```

### CSV Format Template
```csv
name,slug,category,price,salePrice,image,detailedDescription,brand,inStock,stockQuantity,badges,sku,barcode,status,complianceLevel,ageRestriction
"Product Name","auto-generated","category-slug",29.99,,"https://blob.url","Description","Brand Name",true,10,"new,best-seller","SKU123","123456789","active","age-restricted",21
```

---

## Step-by-Step Import Process

### Phase 1: Data Extraction

#### Option A: Scrape from Website
```javascript
// Use Puppeteer or similar to extract product data
// Example: scripts/scrape-products.js
const products = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('.product-item')).map(item => ({
    name: item.querySelector('.product-title')?.textContent,
    price: parseFloat(item.querySelector('.price')?.textContent),
    image: item.querySelector('img')?.src,
    description: item.querySelector('.description')?.textContent,
    // ... extract all relevant fields
  }));
});
```

**Puffco Example**: Used Puppeteer to scrape https://www.puffco.com/collections/puffco-collection
- Extracted 172 products from 3 pages
- Saved raw data to `puffco_products.json`

#### Option B: Import from CSV
If vendor provides CSV, parse it carefully:
```javascript
function parseCSVLine(line) {
  // Handle quoted fields with commas
  // Handle escaped quotes ("")
  // Return array of field values
}
```

### Phase 2: Format Conversion

#### Step 1: Create Conversion Script
**Reference**: `scripts/convert-puffco-to-csv.js`

```javascript
const convertedProducts = rawProducts.map(product => ({
  name: product.title.trim(),
  slug: generateSlug(product.title),
  category: mapToCategory(product.productType), // Map to your categories
  price: parsePrice(product.price),
  salePrice: product.compareAtPrice ? parsePrice(product.compareAtPrice) : undefined,
  image: product.imageUrl, // Will be updated later
  shortDescription: product.description.substring(0, 200),
  detailedDescription: product.description,
  brand: 'Puffco',
  inStock: product.available,
  stockQuantity: 0, // Default
  badges: generateBadges(product),
  sku: product.sku || '',
  barcode: product.barcode || '',
  status: product.available ? 'active' : 'draft',
  complianceLevel: 'age-restricted',
  ageRestriction: 21,
  // Add other relevant fields
}));
```

#### Step 2: Category Mapping
```javascript
// Map vendor categories to your system
const categoryMap = {
  'Devices': 'high-end-vaporizers',
  'Accessories': 'smoke-accessories',
  'Atomizers': 'vapes-mods-pods',
  // ... etc
};
```

#### Step 3: Generate CSV
```javascript
const csv = [
  headers.join(','),
  ...convertedProducts.map(p => 
    headers.map(h => escapeCsvValue(p[h])).join(',')
  )
].join('\n');

fs.writeFileSync('products_mapped.csv', csv);
```

**Output**: `puffco_products_mapped.csv` (172 products)

### Phase 3: Image Handling

⚠️ **CRITICAL**: Images MUST be stored in Vercel Blob, NOT local files!

#### Step 1: Download Images Locally (Temporary)
**Reference**: `scripts/download-puffco-images-local.js`

```javascript
// Download to /public/images/products/[brand]/ for processing
// This is TEMPORARY storage only
const downloadDir = path.join(process.cwd(), 'public/images/products/puffco');

for (const product of products) {
  const imageUrl = product.image;
  const fileName = `puffco-${product.slug}.png`;
  await downloadImage(imageUrl, path.join(downloadDir, fileName));
}
```

**Why download locally first?**
- Batch processing
- Verify image integrity
- Rename consistently
- Retry failed downloads

**Result**: 172 images downloaded to `/public/images/products/puffco/`

#### Step 2: Upload Images to Vercel Blob
**Reference**: `scripts/upload-puffco-images-to-blob.ts`

```typescript
import { put } from '@vercel/blob';

// Requires BLOB_READ_WRITE_TOKEN in .env.local
const blob = await put(
  `products/puffco/${fileName}`,
  fileBuffer,
  {
    access: 'public',
    addRandomSuffix: false,
  }
);

const blobUrl = blob.url;
// https://j9jxbouddwjbcz7m.public.blob.vercel-storage.com/products/puffco/puffco-hot-knife-onyx.png
```

**Update Product Records**:
```javascript
product.image = blobUrl; // Replace local path with Vercel Blob URL
```

**Result**: 172 images uploaded, all products updated with Vercel Blob URLs

⚠️ **Common Mistake #1**: Leaving local paths in product.image
- ❌ Wrong: `/images/products/puffco/product.png`
- ✅ Correct: `https://[blob-id].public.blob.vercel-storage.com/products/puffco/product.png`

### Phase 4: Bulk Import

#### Step 1: Merge with Existing Products
**Reference**: `scripts/merge-all-products.ts`

⚠️ **Common Mistake #2**: Assuming you can just read from JSON files
- **Reality**: Products are in Redis, not JSON files
- **Solution**: Fetch existing products from API first

```typescript
// Fetch existing products from running server
const response = await fetch('http://localhost:3000/api/admin/products?limit=1000');
const existingProducts = response.data.products;

// Merge with new products
const allProducts = [...existingProducts, ...newProducts];

// Save to JSON as backup
fs.writeFileSync('src/data/products.json', JSON.stringify(allProducts, null, 2));
```

**Result**: 279 products total (107 existing + 172 new)

#### Step 2: Sync to Redis Cloud
**Reference**: `scripts/sync-products-to-redis.ts`

⚠️ **Common Mistake #3**: Thinking JSON file is the source of truth
- **Reality**: Redis Cloud is the ONLY source of truth
- **JSON files**: Backup only, NOT used by application

```typescript
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Read merged products from JSON backup
const products = JSON.parse(fs.readFileSync('src/data/products.json', 'utf-8'));

// Write to Redis (this is what the app uses)
await redis.set('products', JSON.stringify(products));

console.log('✅ Synced to Redis Cloud');
```

**Result**: 279 products in Redis, application shows all products

### Phase 5: Populate Missing Fields

#### Add Descriptions (if missing)
**Reference**: `scripts/fix-puffco-descriptions.ts`

```typescript
const products = await ProductStorage.readProducts();

for (const product of products) {
  if (!product.shortDescription) {
    await ProductStorage.updateProduct(product.id, {
      shortDescription: csvDescription.substring(0, 200),
      detailedDescription: csvDescription
    });
  }
}
```

**Result**: 169 products updated with descriptions

---

## Common Mistakes & Solutions

### Mistake #1: Image Storage Location
**Problem**: Stored images in `/public/images/` and used local paths
```javascript
// ❌ WRONG
product.image = '/images/products/puffco/product.png';
```

**Why it failed**: 
- Local files don't exist in production deployment
- Next.js Image Optimization returns 400 Bad Request
- Large images bloat git repository

**Solution**: Upload to Vercel Blob Storage
```javascript
// ✅ CORRECT
const blob = await put(`products/puffco/${fileName}`, fileBuffer, { access: 'public' });
product.image = blob.url;
```

**How to fix existing products**:
```bash
npm run tsx scripts/upload-puffco-images-to-blob.ts
npm run tsx scripts/sync-products-to-redis.ts
```

---

### Mistake #2: Assuming JSON Files are Active Storage
**Problem**: Updated `src/data/products.json` but changes didn't appear in app

**Why it failed**:
- App uses Redis Cloud for ALL environments
- JSON files are backup only
- Changes to JSON don't sync automatically

**Solution**: Always sync to Redis after JSON changes
```bash
npm run tsx scripts/sync-products-to-redis.ts
```

**Development workflow**:
1. Make changes to products (via API or direct Redis)
2. Products automatically save to Redis
3. JSON file only updated when explicitly written
4. To restore from JSON: sync-products-to-redis.ts

---

### Mistake #3: Production Image URLs Still Local
**Problem**: Production Redis had old data with local image paths

**Why it failed**:
- Synced products to local/dev Redis
- Production Redis wasn't updated
- Git commit doesn't update Redis

**Solution**: Sync to production Redis explicitly
```bash
# Run this after deploying code changes
npm run tsx scripts/sync-to-production-redis.ts
```

**What this does**:
- Reads updated products.json (with Vercel Blob URLs)
- Connects to production Redis using REDIS_URL
- Overwrites production Redis data
- Verifies sync was successful

---

### Mistake #4: CSP Blocking External Images
**Problem**: Images still didn't show in production after fixing URLs

**Why it failed**:
- Content Security Policy in next.config.js blocked external images
- Only allowed `'self'` for image sources

**Solution**: Update CSP in next.config.js
```javascript
// ❌ WRONG
contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"

// ✅ CORRECT
contentSecurityPolicy: "default-src 'self'; script-src 'none'; img-src 'self' data: https:; sandbox;"
```

**What changed**:
- Added `img-src 'self' data: https:`
- Allows images from HTTPS sources (Vercel Blob)
- Allows data URLs (base64 placeholders)

---

### Mistake #5: Stock Badges Not Syncing
**Problem**: Products with stock > 0 still showed "OUT OF STOCK" badge

**Why it failed**:
- Badges array had `'out-of-stock'` from import
- Badges weren't updated when stock changed

**Solution**: Auto-manage badges in update API
```typescript
// In src/app/api/admin/products/[id]/route.ts
if (body.stockQuantity !== undefined) {
  const currentBadges = existingProduct.badges || [];
  
  if (body.stockQuantity > 0) {
    // Remove out-of-stock badge
    updateData.badges = currentBadges.filter(b => b !== 'out-of-stock');
  } else {
    // Add out-of-stock badge
    if (!currentBadges.includes('out-of-stock')) {
      updateData.badges = [...currentBadges, 'out-of-stock'];
    }
  }
}
```

---

### Mistake #6: TypeScript Build Errors
**Problem**: Build failed with type errors in scripts

**Why it failed**:
- Scripts in `/scripts/` folder were included in Next.js build
- Missing type imports
- Incorrect type annotations

**Solution**: Proper type imports and annotations
```typescript
// Add explicit imports
import { AdminProduct } from '../src/types/index';

// Add type annotations
const products: AdminProduct[] = await ProductStorage.readProducts();

// Use properly typed update objects
const updates: Partial<AdminProduct> = {
  shortDescription: description,
  detailedDescription: description
};
```

---

### Mistake #7: Wrong Field Names
**Problem**: Used `stock` instead of `stockQuantity`

**Why it failed**:
- AdminProduct type uses `stockQuantity`
- API didn't recognize `stock` field

**Solution**: Always reference `src/types/index.ts`
```typescript
// ❌ WRONG
product.stock = 10;

// ✅ CORRECT
product.stockQuantity = 10;
```

**Quick reference**:
- NOT `stock` → USE `stockQuantity`
- NOT `images` → USE `imageHistory`
- NOT `description` → USE `shortDescription` + `detailedDescription`

---

## Storage Architecture

### Understanding the Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     DATA FLOW DIAGRAM                        │
└─────────────────────────────────────────────────────────────┘

Development & Production (SAME):
┌──────────────────┐
│  Next.js App     │
│  (localhost/prod)│
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  ProductStorage  │←─── All CRUD operations
│  Service         │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────────────────────────────┐
│            Redis Cloud (redis-16513...)                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Key: "products"                                     │ │
│  │ Value: JSON.stringify([...279 products])           │ │
│  │                                                     │ │
│  │ - Primary source of truth                          │ │
│  │ - Shared by dev & production                       │ │
│  │ - Updated via ProductStorage API                   │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
         │
         │ (backup writes only)
         ↓
┌──────────────────┐
│ products.json    │←─── Backup/disaster recovery only
│ (git tracked)    │     NOT used by application
└──────────────────┘
```

### Redis Cloud Configuration

**Connection Details**:
- URL: `redis://default:[password]@redis-16513.c14.us-east-1-3.ec2.redns.redis-cloud.com:16513`
- Environment Variable: `REDIS_URL` (in .env.local)
- Client Library: `ioredis`

**Data Structure**:
```javascript
// Single key stores all products
await redis.set('products', JSON.stringify(productsArray));

// Retrieve products
const productsJson = await redis.get('products');
const products = JSON.parse(productsJson);
```

**Why Redis?**
- Fast read/write performance
- Shared between dev and production
- No file system dependencies
- Scales better than JSON files
- Atomic updates

### Vercel Blob Storage

**Configuration**:
- Store ID: `zsmokeshop_product_images`
- Base URL: `https://j9jxbouddwjbcz7m.public.blob.vercel-storage.com/`
- Token: `BLOB_READ_WRITE_TOKEN` (in .env.local)

**Upload Pattern**:
```typescript
import { put } from '@vercel/blob';

const blob = await put(
  'products/puffco/image-name.png',  // Path in blob store
  fileBuffer,                         // File data
  { 
    access: 'public',                 // Public access
    addRandomSuffix: false            // Keep exact filename
  }
);

// blob.url: Full HTTPS URL to image
```

**Best Practices**:
- Organize by brand: `products/[brand]/[image].png`
- Use consistent naming: `[brand]-[slug].png`
- Set public access for all product images
- Never store in `/public/` folder (bloats deployment)

### JSON Backup Files

**Location**: `src/data/products.json`

**Purpose**: 
- Disaster recovery
- Bulk operations reference
- Git version history
- Manual inspection

**NOT Used For**:
- Application runtime data
- API responses
- Frontend rendering

**When to Update**:
- After bulk imports
- Before major changes (backup)
- Manual sync with Redis

```bash
# Export from Redis to JSON
npm run tsx scripts/export-redis-to-json.ts

# Import from JSON to Redis
npm run tsx scripts/sync-products-to-redis.ts
```

---

## Verification & Testing

### Step 1: Verify Local Data

```bash
# Check products count
curl -s 'http://localhost:3000/api/admin/products?limit=1' | jq '.data.pagination.totalProducts'
# Expected: 279

# Check Puffco products with Vercel Blob URLs
curl -s 'http://localhost:3000/api/admin/products?brand=Puffco&limit=1' | jq '.data.products[0].image'
# Expected: https://j9jxbouddwjbcz7m.public.blob.vercel-storage.com/...

# Check descriptions populated
curl -s 'http://localhost:3000/api/admin/products?brand=Puffco&limit=1' | jq '.data.products[0] | {shortDescription: (.shortDescription | length), detailedDescription: (.detailedDescription | length)}'
# Expected: Non-zero lengths
```

### Step 2: Test Images

```bash
# Test Vercel Blob image is accessible
curl -I "https://j9jxbouddwjbcz7m.public.blob.vercel-storage.com/products/puffco/puffco-hot-knife-onyx.png"
# Expected: HTTP/2 200

# Test Next.js image optimization
curl -I "http://localhost:3000/_next/image?url=https%3A%2F%2Fj9jxbouddwjbcz7m.public.blob.vercel-storage.com%2Fproducts%2Fpuffco%2Fpuffco-hot-knife-onyx.png&w=750&q=90"
# Expected: 200 (not 400)
```

### Step 3: Test Admin Features

1. **Admin Products Page**: http://localhost:3000/admin/products
   - [ ] Products list loads
   - [ ] Images display correctly
   - [ ] Sort by dropdown works
   - [ ] Category filter works
   - [ ] Brand filter shows Puffco

2. **Inline Editing**:
   - [ ] Click price to edit
   - [ ] Click category to change
   - [ ] Click +/- to adjust stock
   - [ ] Click status to toggle active/inactive
   - [ ] Verify changes save

3. **Product Page**: http://localhost:3000/products/hot-knife-onyx
   - [ ] Image displays
   - [ ] Description shows
   - [ ] Tax message correct
   - [ ] Add to cart works

### Step 4: Verify Production

**After deploying to production**:

```bash
# 1. Sync to production Redis (CRITICAL!)
npm run tsx scripts/sync-to-production-redis.ts

# 2. Test production API
curl -s 'https://www.zsmokeshop.com/api/admin/products?limit=1' | jq '.data.pagination.totalProducts'

# 3. Test product images in browser
# Open: https://www.zsmokeshop.com/products/hot-knife-onyx
# Verify: Images load without 400 errors in console

# 4. Check Next.js image optimization
curl -I "https://www.zsmokeshop.com/_next/image?url=https%3A%2F%2Fj9jxbouddwjbcz7m.public.blob.vercel-storage.com%2Fproducts%2Fpuffco%2Fpuffco-hot-knife-onyx.png&w=750&q=90"
# Expected: 200 (not 400)
```

**Browser Console Checks**:
- [ ] No 400 errors for `/_next/image` requests
- [ ] No 404 errors for blob storage
- [ ] Images load successfully

---

## Quick Reference: Complete Import Workflow

### One-Time Setup
```bash
# 1. Ensure environment variables set in .env.local
REDIS_URL=redis://...
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

### Import New Products (Complete Steps)

```bash
# Step 1: Extract & Convert Data
npm run tsx scripts/scrape-products.js          # Extract from website
npm run tsx scripts/convert-to-csv.js           # Convert to CSV format

# Step 2: Handle Images
npm run tsx scripts/download-images-local.js    # Download to /public (temporary)
npm run tsx scripts/upload-images-to-blob.ts    # Upload to Vercel Blob, update URLs

# Step 3: Import Products
# Fetch existing products first!
curl 'http://localhost:3000/api/admin/products?limit=1000' > existing.json
npm run tsx scripts/merge-products.ts           # Merge old + new
npm run tsx scripts/sync-products-to-redis.ts   # Write to Redis

# Step 4: Populate Missing Data (optional)
npm run tsx scripts/fix-descriptions.ts         # Add descriptions if needed

# Step 5: Verify Locally
curl 'http://localhost:3000/api/admin/products?limit=1' | jq
# Check: totalProducts, image URLs, descriptions

# Step 6: Commit & Deploy
git add src/data/products.json next.config.js
git commit -m "feat: Import [brand] products with images"
git push origin main

# Step 7: Sync Production Redis (CRITICAL!)
npm run tsx scripts/sync-to-production-redis.ts

# Step 8: Verify Production
# Open https://www.zsmokeshop.com/shop
# Check browser console for errors
# Verify images load correctly
```

---

## Troubleshooting

### Images not showing in production

**Symptoms**: 400 errors for `/_next/image` requests in browser console

**Causes & Solutions**:

1. **Local paths instead of Vercel Blob URLs**
   ```bash
   # Check if products have local paths
   curl 'https://www.zsmokeshop.com/api/admin/products?brand=Puffco&limit=1' | jq '.data.products[0].image'
   
   # If output: "/images/products/..." → WRONG!
   # Should be: "https://...blob.vercel-storage.com/..." → CORRECT!
   
   # Fix: Upload images and sync to production
   npm run tsx scripts/upload-images-to-blob.ts
   npm run tsx scripts/sync-to-production-redis.ts
   ```

2. **CSP blocking external images**
   ```javascript
   // Check next.config.js
   contentSecurityPolicy: "... img-src 'self' data: https: ..."
   //                                     ^^^^ Must include https:
   ```

3. **Production Redis not updated**
   ```bash
   # Always run after code deployment
   npm run tsx scripts/sync-to-production-redis.ts
   ```

### Products not appearing in admin

**Causes**:
- Products in JSON but not Redis
- Wrong category slugs
- Status = 'draft' instead of 'active'

**Solution**:
```bash
# Sync JSON to Redis
npm run tsx scripts/sync-products-to-redis.ts

# Check product status
curl 'http://localhost:3000/api/admin/products?status=draft'

# Bulk update to active
npm run tsx scripts/bulk-update-status.ts
```

### Build errors on deployment

**Common errors**:
```
Type error: Property 'shortDescription' does not exist...
```

**Solution**: Add proper type imports in scripts
```typescript
import { AdminProduct } from '../src/types/index';
const products: AdminProduct[] = await readProducts();
```

---

## File Reference

### Scripts Created for This Import

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `scrape-products.js` | Extract products from website | Initial data gathering |
| `convert-to-csv.js` | Convert raw data to CSV format | After scraping |
| `download-images-local.js` | Download images temporarily | Before blob upload |
| `upload-images-to-blob.ts` | Upload to Vercel Blob, update URLs | Before import |
| `merge-products.ts` | Combine old + new products | Avoid overwriting existing |
| `sync-products-to-redis.ts` | Write to Redis (dev/prod same) | After merging products |
| `sync-to-production-redis.ts` | Explicitly sync to production | After deployment |
| `fix-descriptions.ts` | Populate missing descriptions | Fix incomplete data |

### Key Files Modified

| File | Changes | Why |
|------|---------|-----|
| `next.config.js` | Updated CSP for images | Allow Vercel Blob URLs |
| `src/data/products.json` | Added 172 products | Backup storage |
| `src/hooks/useBusinessSettings.ts` | Added tax fields | Tax configuration |
| `src/components/product/ProductPageTemplate.tsx` | Dynamic tax message | Show correct tax info |
| `src/app/api/admin/products/[id]/route.ts` | Stock badge auto-update | Sync badges with stock |

---

## Best Practices Summary

### ✅ DO

- **Store images in Vercel Blob** with public access
- **Use Vercel Blob URLs** in product.image field
- **Sync to Redis** after any bulk changes
- **Fetch existing products** before merging
- **Test locally first** before production sync
- **Verify image URLs** are HTTPS blob storage URLs
- **Use proper TypeScript types** in all scripts
- **Keep JSON as backup** for disaster recovery
- **Update CSP** when adding external resources
- **Document everything** for future reference

### ❌ DON'T

- **Don't use local image paths** (`/images/...`)
- **Don't store images in `/public`** (bloats deployment)
- **Don't modify JSON without syncing Redis**
- **Don't assume JSON is active data** (it's backup only)
- **Don't forget production Redis sync** after deployment
- **Don't use field names** not in AdminProduct type
- **Don't skip type imports** in TypeScript scripts
- **Don't merge without backing up** existing data
- **Don't test only in dev** (test production too)
- **Don't commit without building** (check for errors)

---

## Success Metrics

After completing this import:

✅ **Data**
- 172 Puffco products imported
- 279 total products in database
- 169 products with complete descriptions
- 0 products with local image paths

✅ **Images**
- 172 images uploaded to Vercel Blob
- 0 images in `/public` folder (good!)
- 100% images accessible via HTTPS
- 0 image load errors in production

✅ **Functionality**
- Admin product management working
- Inline editing functional
- Stock controls operational
- Images display correctly
- Tax configuration working

✅ **Architecture**
- Redis Cloud as primary storage
- JSON as backup only
- Vercel Blob for images
- CSP configured correctly
- TypeScript build passing

---

## Future Imports Checklist

When importing new product batches:

- [ ] Review this guide completely
- [ ] Set up extraction script
- [ ] Map to AdminProduct schema
- [ ] Download images temporarily
- [ ] Upload images to Vercel Blob
- [ ] Update product image URLs
- [ ] Fetch existing products from API
- [ ] Merge with new products
- [ ] Sync to Redis (local/dev)
- [ ] Test locally thoroughly
- [ ] Commit changes
- [ ] Deploy to production
- [ ] **Sync to production Redis** (critical!)
- [ ] Verify in production
- [ ] Check browser console for errors
- [ ] Update this guide with learnings

---

## Support & Debugging

### Redis Connection Issues
```bash
# Test Redis connection
redis-cli -u $REDIS_URL ping
# Expected: PONG

# Check key exists
redis-cli -u $REDIS_URL EXISTS products
# Expected: 1

# Check product count
redis-cli -u $REDIS_URL --raw GET products | jq '. | length'
# Expected: 279
```

### Vercel Blob Issues
```bash
# Test blob upload
npx @vercel/blob upload test.txt test.txt --token=$BLOB_READ_WRITE_TOKEN

# List blobs
npx @vercel/blob list --token=$BLOB_READ_WRITE_TOKEN

# Delete blob
npx @vercel/blob delete path/to/file.png --token=$BLOB_READ_WRITE_TOKEN
```

### Need Help?
1. Check this guide first
2. Review scripts in `/scripts/` folder
3. Check `src/types/index.ts` for schema
4. Test with single product first
5. Check Redis data directly
6. Verify environment variables

---

**Document Version**: 1.0  
**Last Import**: Puffco Products (172 items)  
**Date**: December 21, 2025  
**Status**: ✅ Successful

---

*Keep this document updated with each bulk import to build institutional knowledge.*
