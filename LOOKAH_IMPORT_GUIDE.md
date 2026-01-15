# Lookah Products Import Guide

## Overview

Automated script to extract all products from **lookah.com** including images, descriptions (short and detailed), prices, ratings, and product details.

## What Gets Imported

### Product Categories
- **Vaporizers** - E-rigs, dab pens, dry herb vaporizers
- **510 Thread Batteries** - Vape pen batteries (Bear, Cat, Snail, Guitar, etc.)
- **Dab Rigs** - Glass dab rigs and wax rigs
- **Bongs & Water Pipes** - Glass water pipes of all sizes
- **Nectar Collectors** - Electric nectar collectors (Seahorse series)
- **Wax Coils** - Replacement coils and atomizers
- **Dab Tools & Accessories** - Dab tools, carb caps, etc.

### Product Data Extracted
✅ Product name  
✅ Full product URL  
✅ Regular price and sale price  
✅ High-quality product images  
✅ Short description (250 chars)  
✅ Detailed description (1000 chars)  
✅ Product category  
✅ Star rating (out of 5)  
✅ Review count  
✅ Stock status  
✅ SKU (when available)

## Installation & Setup

### 1. Install Dependencies

```bash
npm install puppeteer @vercel/blob ioredis dotenv
npm install -D @types/node tsx
```

### 2. Environment Variables

Add to your `.env.local` file:

```bash
# Required for image upload to Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Optional: Redis sync (recommended)
REDIS_URL=redis://default:...@...

# For product management
JWT_SECRET=your-secret-key
```

## Usage

### Basic Import (Uses Original Image URLs)

```bash
npx tsx scripts/import-lookah-products.ts
```

This will:
- ✅ Scrape all Lookah categories
- ✅ Extract product details
- ✅ Save to `lookah_products.json` (raw data)
- ✅ Save to `src/data/lookah_products.json` (formatted)
- ⚠️ Use original Lookah image URLs (not uploaded to your storage)

### Full Import with Image Upload

Set `BLOB_READ_WRITE_TOKEN` in `.env.local`, then run:

```bash
npx tsx scripts/import-lookah-products.ts
```

This will:
- ✅ Download all product images
- ✅ Upload to Vercel Blob storage
- ✅ Replace URLs with your hosted images
- ✅ Save products with your image URLs

### With Redis Sync

Set both `BLOB_READ_WRITE_TOKEN` and `REDIS_URL`, then run:

```bash
npx tsx scripts/import-lookah-products.ts
```

This will also:
- ✅ Sync products to Redis
- ✅ Merge with existing products
- ✅ Make products immediately available in admin

## Output Files

### 1. `lookah_products.json` (Root)
Raw scraped data directly from website:
```json
[
  {
    "name": "LOOKAH Seahorse Pro Plus",
    "url": "https://www.lookah.com/...",
    "price": 57.99,
    "salePrice": 46.39,
    "imageUrl": "https://www.lookah.com/...",
    "shortDescription": "Best Electric Nectar Collector...",
    "detailedDescription": "The Seahorse Pro Plus is...",
    "category": "Vaporizers",
    "categorySlug": "vaporizers",
    "rating": 4.82,
    "reviewCount": 357,
    "inStock": true
  }
]
```

### 2. `src/data/lookah_products.json`
Formatted AdminProduct data ready for your system:
```json
[
  {
    "id": "lookah-1735234567890-0",
    "name": "LOOKAH Seahorse Pro Plus",
    "slug": "lookah-seahorse-pro-plus",
    "category": "vaporizers",
    "price": 57.99,
    "salePrice": 46.39,
    "image": "https://your-blob-storage.com/...",
    "shortDescription": "Best Electric Nectar Collector...",
    "detailedDescription": "The Seahorse Pro Plus is...",
    "brand": "Lookah",
    "badges": ["sale", "best-seller"],
    "featured": true,
    ...
  }
]
```

## Category Mapping

The script maps Lookah categories to your store categories:

| Lookah Category | Your Category Slug | Description |
|-----------------|-------------------|-------------|
| Vaporizers | `vaporizers` | E-rigs, dab pens, dry herb vapes |
| 510 Thread Battery | `vape-batteries` | 510 vape pen batteries |
| Dab Rigs | `dab-rigs` | Glass dab rigs |
| Bongs & Water Pipes | `glass` | Glass water pipes |
| Nectar Collectors | `vaporizers` | Electric nectar collectors |
| Wax Coils | `accessories` | Replacement coils |
| Dab Tools | `accessories` | Dab tools and accessories |

**Note**: Update the category slugs in the script to match your store's categories.

## Expected Output

```
🚀 Lookah Products Import

📂 Categories to scrape: 7
   Vaporizers, 510 Batteries, Dab Rigs, Bongs & Water Pipes, Nectar Collectors, Wax Coils, Dab Tools

🌐 Launching browser...

📂 Scraping category: Vaporizers
   URL: https://www.lookah.com/vaporizers/
   📄 Fetching details (1/5): LOOKAH Seahorse Pro Plus
   📄 Fetching details (2/5): LOOKAH Dragon Egg
   ...
   ✅ Found 45 products

📂 Scraping category: 510 Batteries
   URL: https://www.lookah.com/510-thread-battery/
   ✅ Found 28 products

...

✅ Total products scraped: 250

📦 Converting to AdminProduct format...
  🖼️  Processing: LOOKAH Seahorse Pro Plus
    ✅ Image uploaded: lookah-seahorse-pro-plus.jpg
  🖼️  Processing: LOOKAH Bear 510 Battery
    ✅ Image uploaded: lookah-bear-510-battery.jpg
  ...

💾 Saved to JSON: src/data/lookah_products.json
  ✅ 250 products saved

📊 Category Breakdown:
   vaporizers: 73 products
   vape-batteries: 28 products
   dab-rigs: 65 products
   glass: 68 products
   accessories: 16 products

💾 Syncing to Redis...
  📊 Existing: 150
  ➕ New: 250
  📦 Total: 400
  ✅ Synced to Redis

🧹 Cleaned up temp images

✅ Import completed!
📦 Imported 250 Lookah products
💰 Total value: $18,742.50
```

## Performance

- **Scraping Time**: ~5-10 minutes for all categories
- **Image Download**: ~2-3 minutes (250 products)
- **Image Upload**: ~3-5 minutes to Vercel Blob
- **Total Time**: ~10-15 minutes for full import

## Optimization Features

### Smart Detail Fetching
- Fetches detailed descriptions for first 5 products per category
- Uses short descriptions for remaining products
- Saves ~80% scraping time while maintaining quality

### Image Handling
- Downloads images to temp folder
- Uploads to Vercel Blob storage
- Auto-cleans temp folder after completion
- Falls back to original URLs on upload failure

### Error Handling
- Continues on individual product failures
- Logs errors for manual review
- Saves partial results if script crashes

## Post-Import Steps

### 1. Review Imported Products

```bash
cat src/data/lookah_products.json | jq '.[0]'
```

### 2. Upload Images Later (Optional)

If you skipped image upload initially:

```bash
npx tsx scripts/upload-lookah-images-to-blob.ts
```

### 3. Sync to Redis Later (Optional)

If you skipped Redis sync:

```bash
npx tsx scripts/sync-products-to-redis.ts
```

### 4. View in Admin Panel

Navigate to: `https://your-site.com/admin/products`

Filter by brand: "Lookah"

## Customization

### Change Categories

Edit the `LOOKAH_CATEGORIES` array in the script:

```typescript
const LOOKAH_CATEGORIES = [
  { url: 'https://www.lookah.com/vaporizers/', slug: 'your-slug', name: 'Display Name' },
  // Add or remove categories
];
```

### Adjust Detail Fetching

Change the number of products to fetch full details for:

```typescript
const maxDetailsToFetch = Math.min(products.length, 10); // Fetch 10 instead of 5
```

### Modify Product Mapping

Customize how products are converted to AdminProduct:

```typescript
const adminProduct: AdminProduct = {
  // Customize fields here
  complianceLevel: 'age-restricted', // Your compliance level
  ageRestriction: 21, // Your age restriction
  stockQuantity: 20, // Default stock quantity
  // ...
};
```

## Troubleshooting

### No Products Found

1. Check if Lookah changed their HTML structure
2. View saved screenshot: `temp/page-screenshot.png`
3. View saved HTML: `temp/page-content.html`
4. Adjust CSS selectors in script

### Image Upload Fails

- Verify `BLOB_READ_WRITE_TOKEN` is correct
- Check Vercel Blob quota/limits
- Original URLs will be used as fallback

### Redis Connection Errors

- Verify `REDIS_URL` is correct
- Products still saved to JSON file
- Run sync script later manually

### Timeout Errors

- Increase timeout values in script:
```typescript
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }); // Increase from 30000
```

## Advanced Usage

### Import Specific Categories Only

```typescript
const LOOKAH_CATEGORIES = [
  { url: 'https://www.lookah.com/vaporizers/', slug: 'vaporizers', name: 'Vaporizers' },
  // Comment out categories you don't want
];
```

### Custom Brand Name

```typescript
const BRAND_NAME = 'Lookah Glass'; // Instead of 'Lookah'
```

### Different Output Location

```typescript
const OUTPUT_FILE = path.join(process.cwd(), 'custom/path/lookah_products.json');
```

## Integration with Your Store

### 1. Manual Import via Admin

1. Go to `/admin/products`
2. Click "Import Products"
3. Select `src/data/lookah_products.json`
4. Review and confirm import

### 2. Programmatic Import

```typescript
import { syncToRedis } from './scripts/import-lookah-products';
import lookahProducts from './src/data/lookah_products.json';

await syncToRedis(lookahProducts);
```

### 3. Bulk Operations

Use the admin panel for:
- Bulk price adjustments
- Bulk category changes
- Bulk status updates
- Featured product selection

## Maintenance

### Re-import Products

To update product data:

```bash
# Backup existing
cp src/data/lookah_products.json src/data/lookah_products.backup.json

# Re-run import
npx tsx scripts/import-lookah-products.ts

# Compare changes
diff src/data/lookah_products.backup.json src/data/lookah_products.json
```

### Update Pricing

Lookah has sales - re-import periodically to get latest prices:

```bash
# Weekly/monthly cron job
0 0 * * 0 cd /path/to/project && npx tsx scripts/import-lookah-products.ts
```

## Legal & Compliance

⚠️ **Important**: 
- All Lookah products are age-restricted (21+)
- Script automatically sets `complianceLevel: 'age-restricted'`
- Ensure your age verification system is active
- Review product descriptions for compliance with local laws
- Verify product legality in your jurisdiction

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review similar scripts: `import-goldwhip-products.ts`, `import-puffco-products.js`
3. Check the AI_PRODUCT_IMPORT_GUIDE.md for general guidance
4. Review logs in console output

## Related Scripts

- `upload-lookah-images-to-blob.ts` - Upload images separately
- `sync-products-to-redis.ts` - Sync to Redis later
- `import-goldwhip-products.ts` - Similar import pattern
- `import-puffco-products.js` - Alternative approach

---

**Created**: December 2024  
**Last Updated**: December 26, 2024  
**Script**: `scripts/import-lookah-products.ts`
