# Product Storage Migration to Vercel KV

## Problem

The application was experiencing `EROFS: read-only file system` errors when trying to create, update, or delete products in production on Vercel. This is because Vercel's serverless environment has a read-only filesystem, and the app was trying to write to JSON files.

## Solution

Migrated product storage to use **Vercel KV (Redis)** in production while maintaining JSON file storage for local development.

## Changes Made

### 1. Created New Product Storage Service

**File:** `src/lib/product-storage-service.ts`

This service automatically detects the environment and uses:
- **Vercel KV (Redis)** in production or when KV environment variables are available
- **JSON files** in local development

Key features:
- Automatic environment detection
- Seamless switching between storage methods
- Full CRUD operations (Create, Read, Update, Delete)
- Bulk delete support
- Search functionality
- Category-based filtering
- Product migration utility

### 2. Updated All API Routes

All product-related API routes now use the new storage service:

- `src/app/api/admin/products/route.ts` (GET list, POST create)
- `src/app/api/admin/products/[id]/route.ts` (GET single, PUT update, DELETE)
- `src/app/api/admin/products/bulk-delete/route.ts` (POST bulk delete - NEW)
- `src/app/api/admin/categories/[id]/route.ts` (Updated to use new service)
- `src/app/api/admin/migrate/route.ts` (Updated to use new service)

### 3. API Functions Mapping

| Old Function (ProductsJsonUtils) | New Function (ProductStorage) |
|----------------------------------|-------------------------------|
| `readProducts()` | `readProducts()` |
| `writeProducts(products)` | `writeProducts(products)` |
| `findProductById(id)` | `getProduct(id)` |
| `createProduct(data)` | `createProduct(data)` |
| `updateProduct(id, updates)` | `updateProduct(id, updates)` |
| `deleteProduct(id)` | `deleteProduct(id)` |
| `getProductsByCategory(slug)` | `getProductsByCategory(slug)` |
| `searchProducts(query)` | `searchProducts(query)` |
| N/A | `bulkDeleteProducts(ids)` (NEW) |

## Vercel KV Setup

### Prerequisites

You must have Vercel KV configured in your Vercel project.

### Steps to Set Up Vercel KV

1. **Create a Vercel KV Database**
   - Go to your Vercel dashboard: https://vercel.com/dashboard
   - Navigate to the **Storage** tab
   - Click **Create Database**
   - Select **KV (Redis)**
   - Give it a name (e.g., `zsmokeshop-kv`)
   - Select a region close to your users
   - Click **Create**

2. **Connect KV to Your Project**
   - In the KV database page, click **Connect Project**
   - Select your project: `zsmokeshop`
   - Choose environments: **Production**, **Preview**, and **Development**
   - Click **Connect**

3. **Verify Environment Variables**
   These should be automatically added:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN` (optional)

4. **Migrate Existing Data**
   
   If you have existing products in your JSON files that need to be migrated to KV:

   ```bash
   # Option 1: Use the migration API (when deployed)
   curl -X POST https://your-domain.com/api/admin/migrate-products-to-kv \
     -H "Content-Type: application/json"
   
   # Option 2: Manually copy products.json to KV via the Vercel dashboard
   ```

5. **Redeploy Your Application**
   ```bash
   git commit --allow-empty -m "Enable Vercel KV for products"
   git push origin main
   ```

## Local Development

For local development, you have two options:

### Option 1: Use JSON Files (Default)

No setup required. The service will automatically use JSON files when `NODE_ENV !== 'production'` and KV variables are not set.

### Option 2: Use Vercel KV Locally

Set up environment variables in your `.env.local`:

```env
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token
```

Get these values from your Vercel project settings.

## Testing

After deployment, verify the following operations work:

1. ✅ **Create Product** - Add a new product through admin panel
2. ✅ **Read Products** - List products on admin panel
3. ✅ **Update Product** - Edit an existing product
4. ✅ **Delete Product** - Remove a product
5. ✅ **Bulk Delete** - Delete multiple products at once
6. ✅ **Search** - Search for products by name, description, etc.
7. ✅ **Filter by Category** - View products in a specific category

## Troubleshooting

### Error: "KV configuration not available"

**Cause:** Vercel KV environment variables are not set in production.

**Solution:** Follow the Vercel KV Setup steps above to create and connect a KV database.

### Error: "Failed to write products"

**Cause:** Either KV is not configured properly, or there's a network issue.

**Solution:**
1. Verify KV environment variables are set in Vercel project settings
2. Check Vercel KV database is active and connected
3. Review Vercel function logs for detailed error messages

### Products not persisting after deployment

**Cause:** App is still trying to use JSON files in production.

**Solution:**
1. Verify the new code is deployed (check git commit hash)
2. Check that environment variables are set
3. Trigger a new deployment to ensure latest code is running

## Benefits

1. **Production Reliability** - No more read-only filesystem errors
2. **Scalability** - Redis/KV handles concurrent writes better than file system
3. **Performance** - Faster reads/writes in production
4. **Flexibility** - Easy local development with JSON files
5. **Atomic Operations** - Better data consistency with KV
6. **Automatic Backups** - Vercel KV includes automatic backups

## Data Structure

Products are stored in Vercel KV under the key: `zsmokeshop:products`

The value is an array of `AdminProduct` objects:

```typescript
{
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  salePrice?: number;
  image: string;
  shortDescription?: string;
  detailedDescription?: string;
  brand?: string;
  inStock: boolean;
  badges?: string[];
  sku?: string;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  status: 'active' | 'inactive' | 'draft';
  imageHistory?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}
```

## Rollback Plan

If you need to rollback to JSON files:

1. Revert the code changes
2. Export data from KV
3. Save to `src/data/products.json`
4. Deploy the reverted code

However, the new system is designed to be backward compatible, so rollback should not be necessary.
