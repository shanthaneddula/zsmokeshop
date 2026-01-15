/**
 * Merge Old Products (107) with New Puffco Products (172)
 */

import * as ProductStorage from '../src/lib/product-storage-service';
import { AdminProduct } from '../src/types/admin';
import * as fs from 'fs';
import * as path from 'path';

const OLD_PRODUCTS_FILE = '/tmp/all_107_products.json';
const CSV_FILE = path.join(__dirname, '../puffco_products_local_images.csv');

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function parseCSV(filePath: string): Partial<AdminProduct>[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const products: Partial<AdminProduct>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = parseCSVLine(lines[i]);
    const product: any = {};
    
    headers.forEach((header, index) => {
      let value: any = values[index] || '';
      
      if (header === 'price' || header === 'salePrice') {
        value = value ? parseFloat(value) : (header === 'price' ? 0 : undefined);
      } else if (header === 'inStock') {
        value = value === 'true';
      } else if (header === 'stockQuantity' || header === 'ageRestriction') {
        value = value ? parseInt(value) : undefined;
      } else if (header === 'badges') {
        value = value ? value.split('|').filter((b: string) => b) : [];
      } else if (value === '') {
        value = undefined;
      }
      
      if (value !== undefined) {
        product[header] = value;
      }
    });
    
    // Generate ID and timestamps
    product.id = `prod_puffco_${Date.now()}_${i}`;
    product.createdAt = new Date().toISOString();
    product.updatedAt = new Date().toISOString();
    product.createdBy = 'bulk_import';
    product.updatedBy = 'bulk_import';
    product.imageHistory = [product.image];
    
    products.push(product as AdminProduct);
  }
  
  return products;
}

async function main() {
  console.log('🚀 Merging Old Products with New Puffco Products\n');
  
  // Read old products from API export
  console.log('📖 Reading old products from API export...');
  const oldProductsJson = fs.readFileSync(OLD_PRODUCTS_FILE, 'utf8');
  const oldProducts: AdminProduct[] = JSON.parse(oldProductsJson);
  console.log(`   Found ${oldProducts.length} old products\n`);
  
  // Parse new Puffco products from CSV
  console.log('📖 Reading new Puffco products from CSV...');
  const newProducts = parseCSV(CSV_FILE);
  console.log(`   Found ${newProducts.length} new Puffco products\n`);
  
  // Merge all products
  console.log('🔄 Merging all products...');
  const allProducts = [...oldProducts, ...newProducts as AdminProduct[]];
  console.log(`   Total products: ${allProducts.length}\n`);
  
  // Write merged products
  console.log('💾 Writing merged products to storage...');
  await ProductStorage.writeProducts(allProducts);
  console.log('   ✅ Products written successfully\n');
  
  // Summary
  console.log('='.repeat(60));
  console.log('✨ Merge Summary:');
  console.log(`   Old products: ${oldProducts.length}`);
  console.log(`   New Puffco products: ${newProducts.length}`);
  console.log(`   Total products: ${allProducts.length}`);
  console.log('='.repeat(60));
  console.log('\n✅ Merge complete! Restart your dev server to see all products.');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
