# Puffco Collection - Product Data Extraction Summary

## Extraction Details
- **Source URL**: https://www.puffco.com/collections/puffco-collection
- **Date Extracted**: December 21, 2025
- **Total Products**: 172 product variants across 79 unique products
- **Pages Scraped**: 3 pages

## Files Generated

### 1. puffco_products.json (146KB)
Complete product data in JSON format with all fields:
- Product name and variant name
- Pricing information
- SKU and product type
- Product URLs and image URLs
- Availability status
- Product descriptions
- Tags and metadata

### 2. puffco_products.csv (96KB)
CSV format for easy import into spreadsheet applications with columns:
- Product Name, Variant Name, Full Name
- Price, Compare At Price
- SKU, Product Type, Vendor
- Product URL, Image URL
- Available, Availability Status
- Description, Tags

## Product Breakdown by Type

| Product Type | Count |
|--------------|-------|
| Merch | 113 |
| Peak PRO Accessories | 18 |
| Proxy Accessory | 10 |
| Peak | 5 |
| Pivot Accessories | 5 |
| Accessory | 5 |
| Peak PRO | 4 |
| Pivot | 3 |
| Gift Card | 3 |
| Kits | 2 |
| Mouthpiece | 2 |
| Peak Accessories | 1 |
| Coil | 1 |

## Availability Status
- **In Stock**: 60 products (34.9%)
- **Out of Stock**: 112 products (65.1%)

## Data Fields Extracted

Each product variant includes:
- ✅ Product name
- ✅ Variant name (color, size, etc.)
- ✅ Full display name
- ✅ Price (USD)
- ✅ Compare at price (if on sale)
- ✅ SKU
- ✅ Product type/category
- ✅ Vendor (Puffco)
- ✅ Direct product URL
- ✅ High-resolution image URL
- ✅ Availability status (boolean)
- ✅ Availability status (text)
- ✅ Product description
- ✅ Product tags

## Sample Products

1. **Hot Knife - Onyx**
   - Price: $50.00
   - SKU: 810028445154
   - Status: In Stock
   - URL: https://www.puffco.com/products/the-puffco-hot-knife

2. **Peak Pro 3DXL - Pearl**
   - Price: $420.00
   - SKU: 810028448735
   - Status: In Stock
   - URL: https://www.puffco.com/products/the-peak-pro-pearl

3. **Peak Pro 3DXL Chamber - Silver**
   - Price: $100.00
   - SKU: 810028446502
   - Status: In Stock
   - URL: https://www.puffco.com/products/peak-pro-3d-xl-chamber

4. **Pivot - Onyx**
   - Price: $130.00
   - SKU: 810028446687
   - Status: In Stock
   - URL: https://www.puffco.com/products/pivot

## Usage

### JSON Format
```javascript
// Load in JavaScript/Node.js
const products = require('./puffco_products.json');

// Filter in stock products
const inStock = products.filter(p => p.available);

// Get products by type
const peakProducts = products.filter(p => p.product_type === 'Peak PRO');
```

### Python Usage
```python
import json
import pandas as pd

# Load JSON
with open('puffco_products.json') as f:
    products = json.load(f)

# Load CSV with pandas
df = pd.read_csv('puffco_products.csv')

# Filter and analyze
in_stock = df[df['Available'] == True]
```

## Notes
- All prices are in USD
- Image URLs are direct CDN links to high-resolution product images
- Product URLs are direct links to product pages
- Descriptions are truncated to 300 characters
- Tags include promotional and category tags from Puffco's system

---

**Extraction Method**: Shopify Products JSON API  
**Reliability**: Official API endpoint, 100% accurate  
**Coverage**: Complete - All products across all pagination pages captured
