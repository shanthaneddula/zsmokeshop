# Redis Key Standards - CRITICAL

## ⚠️ ALWAYS Use These Keys

**NEVER** write directly to Redis with custom keys in import scripts. **ALWAYS** use the storage services.

### Official Redis Keys (Used by Application)

```typescript
// Product Storage
const KV_PRODUCTS_KEY = 'zsmokeshop:products';

// Category Storage  
const KV_CATEGORIES_KEY = 'zsmokeshop:categories';

// User Storage
const KV_USERS_KEY = 'zsmokeshop:users';
```

### ✅ CORRECT Pattern - Use Storage Services

```typescript
// Import script example
import * as ProductStorage from '../src/lib/product-storage-service';

async function importProducts() {
  const existingProducts = await ProductStorage.readProducts();
  const newProducts = [...existingProducts, ...scrapedProducts];
  await ProductStorage.writeProducts(newProducts);
}
```

### ❌ WRONG Pattern - Direct Redis Write

```typescript
// NEVER DO THIS!
const redis = new Redis(process.env.REDIS_URL);
await redis.set('products', JSON.stringify(products));  // ❌ Wrong key!
```

## Why This Matters

The mistake cost us debugging time because:
- Import scripts wrote to `products` key
- Application reads from `zsmokeshop:products` key  
- Products were invisible until manually merged

## Scripts Using Correct Pattern

✅ These scripts properly use ProductStorage service:
- `scripts/import-puffco-direct.ts`
- `scripts/merge-all-products.ts`
- `scripts/fix-puffco-descriptions.ts`
- `scripts/sync-products-to-redis.ts`

## Scripts Updated

✅ Fixed to use correct key:
- `scripts/sync-to-production-redis.ts` - Now uses `zsmokeshop:products`

## Scripts Removed (Used Wrong Key)

❌ Deleted to prevent future mistakes:
- `scripts/import-blazysusan-products.ts` - Used wrong `products` key
- `scripts/migrate-blazysusan-images-to-blob.ts` - Used wrong key
- `scripts/fix-blazy-products.js` - Used wrong key
- `scripts/fix-product-status.js` - Used wrong key
- `scripts/check-blazy-location.js` - Temporary debug script
- `scripts/merge-blazy-to-correct-key.js` - One-time fix script
- `scripts/debug-blazysusan.ts` - Debug script

## Rule for Future Imports

**When creating new import scripts:**

1. ✅ Import the storage service:
   ```typescript
   import * as ProductStorage from '../src/lib/product-storage-service';
   ```

2. ✅ Use service methods:
   ```typescript
   await ProductStorage.readProducts();
   await ProductStorage.writeProducts(products);
   await ProductStorage.updateProduct(id, updates);
   ```

3. ❌ NEVER use direct Redis calls for products/categories/users

4. ✅ See `scripts/import-puffco-direct.ts` as reference implementation

## Storage Service Locations

- Products: [src/lib/product-storage-service.ts](src/lib/product-storage-service.ts)
- Categories: [src/lib/category-storage-service.ts](src/lib/category-storage-service.ts)
- Users: Check admin auth implementation

## Verification After Import

After running any import script, verify products appear in admin:
1. Go to `http://localhost:3001/admin/products`
2. Search for brand name
3. Filter by category
4. If not visible → used wrong key!
