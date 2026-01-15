# Element Vape Import - Quick Start

## Run the Scraper
\`\`\`bash
npx tsx scripts/import-elementvape-detailed.ts
\`\`\`

## What It Does
1. ✅ Extracts ALL product details from Element Vape
2. ✅ Downloads ALL product images locally
3. ✅ Handles age verification automatically
4. ✅ Organizes data in JSON files

## Output Files
\`\`\`
elementvape-brands/
├── grav-labs-detailed.json          # 66 products
├── all-elementvape-detailed.json    # All brands combined
└── images/                          # ~660 images downloaded
    └── [product-name]/
        ├── product-1.png
        └── product-2.png
\`\`\`

## Add More Brands
Edit \`scripts/import-elementvape-detailed.ts\`:
\`\`\`typescript
const BRANDS = [
  { name: 'GRAV Labs', url: 'https://www.elementvape.com/grav-labs', category: 'Glass' },
  { name: 'Puffco', url: 'https://www.elementvape.com/puffco', category: 'Vaporizers' },
  // Add more here
];
\`\`\`

## Data Structure
Each product contains:
- name, price, brand, category, url
- description (full text)
- features[] (bullet points)
- includes[] (what's in the box)
- availableOptions[] (colors/variants)
- images[] (local file paths)
- specifications{} (dimensions, material, etc.)

## Runtime
- **3 products**: ~2 minutes
- **66 products**: ~15-20 minutes
- Rate limited to avoid blocking

## Full Documentation
See [ELEMENTVAPE_IMPORT_GUIDE.md](ELEMENTVAPE_IMPORT_GUIDE.md) for complete details.
