# Element Vape Product Import System

## Overview
Complete automated scraper for extracting detailed product information from Element Vape, including downloading all product images locally. Handles age verification gates automatically.

## Main Script
**File**: [`scripts/import-elementvape-detailed.ts`](scripts/import-elementvape-detailed.ts)

## Features
- ✅ Automatic age verification handling
- ✅ Extracts complete product details from individual product pages
- ✅ Downloads ALL product images locally (multiple angles, variants)
- ✅ Organizes images in product-specific folders
- ✅ Rate limiting to avoid being blocked
- ✅ Comprehensive error handling

## Extracted Data Structure

```typescript
interface ProductDetail {
  name: string;                    // Product name
  price: string;                   // Price (e.g., "16.99")
  sku?: string;                    // SKU if available
  brand: string;                   // Brand name (e.g., "GRAV Labs")
  category: string;                // Category (e.g., "Glass")
  url: string;                     // Full product URL
  description: string;             // Full product description
  features: string[];              // Array of feature bullet points
  includes: string[];              // What's included in the box
  availableOptions: string[];      // Available colors/variants
  images: string[];                // Array of local image file paths
  specifications: {                // Key-value specifications
    DIMENSIONS?: string;
    MATERIAL?: string;
    BOWL?: string;
    "CARB HOLE"?: string;
    "FOR USE WITH"?: string;
  };
}
```

## Example Output

```json
{
  "name": "GRAV Sandblasted Mini Classic Sherlock",
  "price": "16.99",
  "brand": "GRAV Labs",
  "category": "Glass",
  "url": "https://www.elementvape.com/grav-sandblasted-mini-classic-sherlock",
  "description": "Discover the GRAV Sandblasted Mini Classic Sherlock, featuring a pocket-sized, sandblasted borosilicate glass hand pipe with a smooth matte finish.",
  "features": [
    "DIMENSIONS: 4\"",
    "BOWL: Fixed Bowl",
    "CARB HOLE: Included",
    "FOR USE WITH: Dry Herb",
    "MATERIAL: Borosilicate Glass"
  ],
  "includes": [
    "1 GRAV Sandblasted Mini Classic Sherlock"
  ],
  "availableOptions": [
    "Amber", "Black", "Blue", "Green", "Lake Green", "Pink"
  ],
  "images": [
    "images/grav-sandblasted-mini-classic-sherlock/grav-sandblasted-mini-classic-sherlock-1.png",
    "images/grav-sandblasted-mini-classic-sherlock/grav-sandblasted-mini-classic-sherlock-2.png"
  ],
  "specifications": {
    "DIMENSIONS": "4\"",
    "MATERIAL": "Borosilicate Glass",
    "BOWL": "Fixed Bowl",
    "CARB HOLE": "Included",
    "FOR USE WITH": "Dry Herb"
  }
}
```

## How It Works

### 1. Age Verification Handling
- Automatically detects and clicks age verification buttons
- Searches for buttons with text: "Yes", "Enter", "Agree", "21+", "I am 21"
- Waits 2 seconds after dismissing the gate

### 2. Product Extraction Flow
1. Navigate to brand page (e.g., `/grav-labs`)
2. Handle age verification
3. Extract basic product info (name, price, URL)
4. For each product:
   - Navigate to product page
   - Extract detailed information
   - Download all product images
   - Save to organized folders

### 3. File Organization
```
elementvape-brands/
├── grav-labs-detailed.json          # Brand-specific products
├── all-elementvape-detailed.json    # Combined all brands
└── images/
    ├── grav-sandblasted-mini-classic-sherlock/
    │   ├── grav-sandblasted-mini-classic-sherlock-1.png
    │   └── ... (9 images total)
    └── grav-sandblasted-pebble-spoon/
        └── ... (10 images)
```

## Configuration

### Add Brands
Edit the `BRANDS` array in the script:

```typescript
const BRANDS = [
  { name: 'GRAV Labs', url: 'https://www.elementvape.com/grav-labs', category: 'Glass' },
  { name: 'Puffco', url: 'https://www.elementvape.com/puffco', category: 'Vaporizers' },
  // Add more as needed
];
```

## Usage

### Run the Scraper
```bash
npx tsx scripts/import-elementvape-detailed.ts
```

### Expected Runtime
- **Per Product**: ~10-15 seconds
- **66 products**: ~15-20 minutes
- **Rate Limiting**: 2 seconds between products

### Output
```
🚀 Starting Element Vape Detailed Product Scraper
✅ Found 66 products

[1/66] Processing: GRAV Sandblasted Mini Classic Sherlock
  🖼️  Downloading 9 images...
    ✅ Downloaded image 1/9
    ...

💾 Saved 66 products to: elementvape-brands/grav-labs-detailed.json

╔════════════════════════════════════╗
║     SCRAPING COMPLETED!            ║
╚════════════════════════════════════╝

📊 Total Products: 66
🖼️  Images Directory: elementvape-brands/images
```

## Technical Details

### Dependencies
```json
{
  "puppeteer": "^24.34.0",
  "puppeteer-extra": "^3.3.6",
  "puppeteer-extra-plugin-stealth": "^2.11.2"
}
```

### Key Selectors
- **Product Cards**: `.plp-product-list`
- **Product Images**: `img[srcset*="cloudfront"]`
- **Alt Text Format**: `"GRAV Product Name Price $16.99"`

### Regex Pattern
```typescript
/^(.+?)\s+Price\s+\$?([\d.]+|0)$/i
```

## Success Metrics

### Test Run (3 Products)
- ✅ 3 products processed successfully
- ✅ 30 images downloaded (average 10 per product)
- ✅ All features, descriptions, and specs extracted
- ✅ Runtime: ~2 minutes

### Expected Full Run (66 Products)
- 📊 66 products
- 🖼️ ~660 images (10 per product average)
- ⏱️ ~15-20 minutes runtime

## Related Files
- [`scripts/import-elementvape-detailed.ts`](scripts/import-elementvape-detailed.ts) - Main scraper
- [`scripts/import-lookah-products.ts`](scripts/import-lookah-products.ts) - Similar pattern for Lookah
- [`scripts/import-goldwhip-products.ts`](scripts/import-goldwhip-products.ts) - AI-powered variant handling
