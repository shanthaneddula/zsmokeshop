# CSV Import Field Mapping

This document explains how CSV fields map to product fields in the system.

## CSV Format Required

```csv
"product name","category","brand","sku","price","sale price","short description","detailed description","product image"
```

## Field Mapping

| CSV Column | Product Field | Required | Notes |
|------------|---------------|----------|-------|
| product name | `name`, `slug` | ✅ Yes | Slug is auto-generated from name |
| category | `category` | ✅ Yes | Must match existing category slug (e.g., "Disposable Nicotine Vapes" → "disposable-nicotine-vapes") |
| brand | `brand` | No | Can be empty |
| sku | `sku` | No | Can be empty |
| price | `price` | ✅ Yes | Must be a valid number (e.g., 27.00) |
| sale price | `salePrice` | No | Leave empty if no sale. Must be less than price |
| short description | `shortDescription` | ✅ Yes | Brief 1-2 sentence summary |
| detailed description | `detailedDescription` | No | Full description with details |
| product image | `image` | No | **Can be empty** - Add manually later via product edit |

## Auto-Generated Fields

These fields are automatically set by the import script:

- `id`: Unique product ID (e.g., `prod_1731234567_abc123def`)
- `slug`: URL-friendly version of product name
- `status`: Set to `'active'`
- `inStock`: Set to `true`
- `rating`: Set to `4.5` (default)
- `badges`: Auto-generated based on sale price and new status
- `createdAt`: Current timestamp
- `updatedAt`: Current timestamp
- `complianceLevel`: Set to `'age-restricted'` for vape products
- `ageRestriction`: Set to `21` for vape products

## CSV Example

```csv
"product name","category","brand","sku","price","sale price","short description","detailed description","product image"
"Baja Splash Lost Mary MT35000 Turbo","Disposable Nicotine Vapes","LOST MARY","LMMT35K-BJS","27.00","","Experience the next level with MT35000 Turbo...","The Baja Splash Lost Mary MT35000 Turbo is now available...","https://example.com/image.jpg"
"Berry Burst Lost Mary MT35000 Turbo","Disposable Nicotine Vapes","LOST MARY","LMMT35K-BRB","27.00","24.99","Experience the next level with MT35000 Turbo...","The Berry Burst Lost Mary MT35000 Turbo is now available...","",
```

## Notes

1. **Empty product images are OK** - You can add images later by:
   - Going to Admin → Products
   - Click "Edit" on the product
   - Upload the image using the image upload component

2. **Sale prices** - Leave empty (no value) if there's no sale

3. **Category matching** - The script automatically converts "Disposable Nicotine Vapes" to "disposable-nicotone-vapes" slug

4. **Quotes in CSV** - All fields should be wrapped in double quotes to handle commas in descriptions

## Usage

1. Prepare your CSV file as `disposablevape.csv` in the project root
2. Run the import command:
   ```bash
   npm run import-products
   ```
3. Review the summary output
4. Check Admin → Products to see imported items
5. Edit products individually to add images if needed

## Category Slug Reference

- "Disposable Nicotine Vapes" → `disposable-nicotine-vapes`
- "E-Liquids" → `e-liquids`
- "Vapes/Mods/Pods" → `vapes-mods-pods`
- "Glass" → `glass`
- "Grinders/Scales/Trays" → `grinders-scales-trays`
- etc.
