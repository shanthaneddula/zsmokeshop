# AI-Powered Product Import System

**Automated bulk product import from any URL**

---

## Overview

This system uses an AI-powered script to automatically scrape, process, and import products from any e-commerce website into Z SMOKE SHOP. The script handles:

- 🌐 Web scraping with intelligent product detection
- 📦 Multiple variants (sizes, flavors, colors)
- 🖼️ Automatic image download and upload to Vercel Blob
- 💾 Redis Cloud synchronization
- ✅ Full AdminProduct schema compliance

---

## Quick Start

### 1. Install Dependencies

```bash
npm install puppeteer
# or
pnpm install puppeteer
```

### 2. Set Environment Variables

Ensure these are in your `.env.local`:

```env
REDIS_URL=redis://...
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

### 3. Run the Import Script

```bash
# Import Gold Whip N2O products
npx tsx scripts/import-goldwhip-products.ts

# Or create a custom script for another brand
npx tsx scripts/import-[brand]-products.ts
```

---

## How It Works

### Step 1: Web Scraping

The script uses Puppeteer to:
- Navigate to the target URL
- Wait for products to load (handles dynamic content)
- Extract product information using intelligent selectors
- Visit individual product pages for detailed data
- Detect variants (sizes, flavors, colors)

**Intelligent Selectors**: The script tries multiple CSS selector patterns to find:
- Product containers: `.product-item`, `.product-card`, `[data-product]`
- Product names: `.product-title`, `.product-name`, `h2`, `h3`
- Prices: `.price`, `.product-price`, `[data-price]`
- Images: `img` with `src`, `data-src`, or `data-lazy-src`
- Variants: `select[name*="size"]`, `select[name*="flavor"]`

### Step 2: Variant Processing

For products with multiple variants:

```
Base Product: "Gold Whip N2O Chargers"
Sizes: ["24ct", "50ct", "600ct"]
Flavors: ["Original", "Strawberry", "Mint"]

Generated Products:
1. Gold Whip N2O Chargers - 24ct (Original)
2. Gold Whip N2O Chargers - 24ct (Strawberry)
3. Gold Whip N2O Chargers - 24ct (Mint)
4. Gold Whip N2O Chargers - 50ct (Original)
... (9 total combinations)
```

### Step 3: Image Handling

1. **Download**: Images saved temporarily to `temp/[brand]-images/`
2. **Upload**: Each image uploaded to Vercel Blob at `products/[brand]/`
3. **URL Update**: Product image field updated with Vercel Blob URL
4. **Cleanup**: Temporary files deleted after upload

### Step 4: Data Formatting

Each scraped product converted to AdminProduct format:

```typescript
{
  id: 'goldwhip-1234567890-0',
  name: 'Gold Whip N2O Chargers - 24ct (Original)',
  slug: 'gold-whip-n2o-chargers-24ct-original',
  category: 'smoke-accessories',
  price: 19.99,
  salePrice: 14.99,
  image: 'https://[blob-id].public.blob.vercel-storage.com/products/goldwhip/...',
  shortDescription: '24ct size. Original flavor. High-quality N2O chargers...',
  detailedDescription: 'Full product description...',
  brand: 'Gold Whip',
  inStock: true,
  stockQuantity: 10,
  status: 'active',
  badges: ['sale'],
  sku: 'GW-N2O-24-ORG',
  complianceLevel: 'age-restricted',
  ageRestriction: 21,
  // ... other fields
}
```

### Step 5: Redis Sync

1. Fetch existing products from Redis
2. Merge with new products (no duplicates)
3. Save to Redis Cloud
4. Backup to `src/data/products.json`

---

## Creating Custom Import Scripts

### Template Structure

```typescript
// Import required packages
import * as puppeteer from 'puppeteer';
import { put } from '@vercel/blob';
import { Redis } from 'ioredis';
import { AdminProduct } from '../src/types/index';

// Configuration
const TARGET_URL = 'https://example.com/products';
const BRAND_NAME = 'Brand Name';
const CATEGORY_SLUG = 'category-slug';

// Main scraping function
async function scrapeProducts(): Promise<ScrapedProduct[]> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });
  
  const products = await page.evaluate(() => {
    // Extract product data from DOM
    return Array.from(document.querySelectorAll('.product')).map(el => ({
      name: el.querySelector('.title')?.textContent?.trim(),
      price: parseFloat(el.querySelector('.price')?.textContent || '0'),
      imageUrl: el.querySelector('img')?.src,
      // ... extract other fields
    }));
  });
  
  await browser.close();
  return products;
}

// Main function
async function main() {
  const scraped = await scrapeProducts();
  const formatted = await convertToAdminProducts(scraped);
  await syncToRedis(formatted);
}

main();
```

### Customization Points

1. **Target URL**: Change `TARGET_URL` to your source website
2. **Brand Name**: Update `BRAND_NAME` constant
3. **Category**: Map products to correct `CATEGORY_SLUG`
4. **Selectors**: Adjust CSS selectors to match target website structure
5. **Variants**: Add logic for size/flavor/color extraction if needed

---

## Advanced Features

### Pagination Handling

```typescript
async function scrapeAllPages(): Promise<ScrapedProduct[]> {
  const allProducts: ScrapedProduct[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${TARGET_URL}?page=${page}`;
    const products = await scrapePage(url);
    
    if (products.length === 0) {
      hasMore = false;
    } else {
      allProducts.push(...products);
      page++;
    }
  }

  return allProducts;
}
```

### Dynamic Content Loading

```typescript
// Wait for lazy-loaded content
await page.evaluate(() => {
  return new Promise((resolve) => {
    let totalHeight = 0;
    const distance = 100;
    
    const timer = setInterval(() => {
      window.scrollBy(0, distance);
      totalHeight += distance;
      
      if (totalHeight >= document.body.scrollHeight) {
        clearInterval(timer);
        resolve(true);
      }
    }, 100);
  });
});
```

### Retry Logic

```typescript
async function downloadWithRetry(
  url: string, 
  maxRetries = 3
): Promise<Buffer> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Download failed after retries');
}
```

### Price Extraction

```typescript
function extractPrice(text: string): number {
  // Handle various price formats
  const cleaned = text
    .replace(/[^0-9.,]/g, '')  // Remove non-numeric except . and ,
    .replace(',', '.');          // Normalize decimal separator
  
  return parseFloat(cleaned) || 0;
}

// Examples:
extractPrice('$19.99');        // 19.99
extractPrice('£24,99');        // 24.99
extractPrice('€ 14.50');       // 14.50
extractPrice('Price: 29.95');  // 29.95
```

---

## Testing & Validation

### Local Testing

```bash
# 1. Start dev server
npm run dev

# 2. Run import script
npx tsx scripts/import-goldwhip-products.ts

# 3. Check admin panel
open http://localhost:3000/admin/products

# 4. Verify products
curl 'http://localhost:3000/api/admin/products?brand=Gold+Whip' | jq
```

### Validation Checklist

- [ ] All products imported (check count)
- [ ] Images display correctly (no 400 errors)
- [ ] Prices formatted properly (2 decimal places)
- [ ] Variants created correctly (sizes/flavors)
- [ ] Categories assigned correctly
- [ ] Stock status accurate
- [ ] Descriptions populated
- [ ] Vercel Blob URLs (not local paths)

---

## Production Deployment

### After Running Import Locally

```bash
# 1. Verify locally first
curl 'http://localhost:3000/api/admin/products?limit=1' | jq '.data.pagination.totalProducts'

# 2. Commit changes
git add src/data/products.json
git commit -m "feat: Import Gold Whip N2O products"
git push origin main

# 3. Wait for Vercel deployment to complete

# 4. Sync to production Redis (CRITICAL!)
REDIS_URL=<production-redis-url> npx tsx scripts/sync-to-production-redis.ts

# 5. Verify production
curl 'https://www.zsmokeshop.com/api/admin/products?limit=1' | jq
```

---

## Troubleshooting

### Products Not Found

**Problem**: Script finds 0 products

**Solutions**:
1. Check if website requires JavaScript (inspect Network tab)
2. Adjust CSS selectors to match actual HTML structure
3. Add longer wait times: `await page.waitForTimeout(5000)`
4. Check for bot detection (add realistic user agent)

### Images Not Downloading

**Problem**: Image download fails

**Solutions**:
1. Check if images require authentication/cookies
2. Verify image URLs are absolute (not relative)
3. Add user agent and headers to fetch request
4. Try downloading from product page instead of listing

### Variants Not Detected

**Problem**: Script doesn't find size/flavor options

**Solutions**:
1. Inspect product page HTML for variant selectors
2. Check if variants load via JavaScript/AJAX
3. Add wait for variant selectors: `await page.waitForSelector('select[name="size"]')`
4. Look for data attributes: `[data-variants]`, `[data-options]`

### Redis Sync Fails

**Problem**: Cannot save to Redis

**Solutions**:
1. Verify `REDIS_URL` is set in `.env.local`
2. Test Redis connection: `redis-cli -u $REDIS_URL ping`
3. Check Redis memory limit (upgrade plan if needed)
4. Ensure network allows Redis Cloud access

### Blob Upload Fails

**Problem**: Cannot upload images to Vercel Blob

**Solutions**:
1. Verify `BLOB_READ_WRITE_TOKEN` is set
2. Check Vercel Blob storage quota
3. Ensure image file size < 50MB
4. Test with single image first before bulk upload

---

## Best Practices

### ✅ DO

- **Test with 1-2 products first** before full import
- **Inspect target website** HTML structure before writing selectors
- **Handle errors gracefully** with try-catch blocks
- **Add delays** between requests to avoid rate limiting
- **Verify image URLs** are Vercel Blob URLs after upload
- **Backup existing products** before merging
- **Test locally** before production sync
- **Log progress** with detailed console messages

### ❌ DON'T

- **Don't scrape too aggressively** (respect robots.txt)
- **Don't skip variant detection** (creates incomplete data)
- **Don't use local image paths** (use Vercel Blob)
- **Don't forget to sync production Redis** after deployment
- **Don't ignore errors** (log and handle them)
- **Don't assume selectors work** (test first)
- **Don't overwrite existing products** (merge carefully)

---

## Example Use Cases

### 1. Import Gold Whip N2O Products

```bash
npx tsx scripts/import-goldwhip-products.ts
```

**Result**: Imports all N2O charger variants with sizes and flavors

### 2. Import RAW Rolling Papers

```typescript
// scripts/import-raw-products.ts
const TARGET_URL = 'https://rawthentic.com/collections/papers';
const BRAND_NAME = 'RAW';
const CATEGORY_SLUG = 'cigarillos'; // Or appropriate category
```

### 3. Import Glass Pipes

```typescript
// scripts/import-glass-products.ts
const TARGET_URL = 'https://example-glass.com/shop';
const BRAND_NAME = 'Various';
const CATEGORY_SLUG = 'glass';

// Special handling for artist names
const product = {
  ...baseProduct,
  brand: extractBrand(productData) || 'Handmade',
  tags: ['handmade', 'artistic', 'unique']
};
```

---

## Script Template Generator

Want to create a new import script quickly? Use this command:

```bash
# Create script from template
cp scripts/import-goldwhip-products.ts scripts/import-[brand]-products.ts

# Edit configuration section
# Update: TARGET_URL, BRAND_NAME, CATEGORY_SLUG

# Adjust selectors for target website
# Update: product, price, image selectors

# Run import
npx tsx scripts/import-[brand]-products.ts
```

---

## Monitoring & Logs

### Console Output

The script provides detailed progress logs:

```
🚀 Gold Whip N2O Products Import

🌐 Launching browser...
📄 Loading page: https://www.goldwhip.com/category/n2o
✅ Found 12 products on page
  📦 Scraping details for: Gold Whip N2O Chargers
  📦 Scraping details for: Gold Whip N2O Plus
  ...

💾 Scraped data saved to: goldwhip_products.json

📦 Converting to AdminProduct format...
  🖼️  Processing: Gold Whip N2O Chargers - 24ct (Original)
    ✅ Image uploaded: goldwhip-gold-whip-n2o-chargers-24ct-original.jpg
  ...

💾 Syncing to Redis...
  📊 Existing products: 279
  ➕ New products: 36
  📦 Total products: 315
  ✅ Products synced to Redis Cloud
  ✅ Backup saved to products.json

🧹 Cleaned up temporary images

✅ Import completed successfully!
📦 Imported 36 Gold Whip N2O products

🔍 Next steps:
  1. Visit http://localhost:3000/admin/products to verify
  2. Check product details and images
  3. Adjust stock quantities as needed
  4. Deploy to production and run sync-to-production-redis.ts
```

---

## Support

### Need Help?

1. Check [BULK_PRODUCT_IMPORT_GUIDE.md](BULK_PRODUCT_IMPORT_GUIDE.md) for detailed manual import process
2. Review [.github/copilot-instructions.md](.github/copilot-instructions.md) for project patterns
3. Test selectors in browser DevTools first
4. Run with single product to debug issues

### Common Errors

| Error | Solution |
|-------|----------|
| `Timeout waiting for selector` | Increase timeout or adjust selector |
| `Cannot find module 'puppeteer'` | Run `npm install puppeteer` |
| `Redis connection failed` | Check `REDIS_URL` environment variable |
| `Blob upload failed` | Verify `BLOB_READ_WRITE_TOKEN` is set |
| `Image 400 error` | Ensure using Vercel Blob URLs, not local paths |

---

## Future Enhancements

- [ ] Add AI-powered category detection
- [ ] Automatic price monitoring and updates
- [ ] Duplicate product detection
- [ ] Multi-language support
- [ ] Product comparison and merging
- [ ] Scheduled imports (cron jobs)
- [ ] Email notifications on import completion
- [ ] Import history and rollback

---

**Last Updated**: December 22, 2025  
**Script Version**: 1.0
