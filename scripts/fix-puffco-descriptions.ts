import * as fs from 'fs';
import * as path from 'path';
import * as ProductStorage from '../src/lib/product-storage-service';
import { AdminProduct } from '../src/types/index';

async function fixPuffcoDescriptions() {
  console.log('🔧 Fixing Puffco product descriptions...\n');

  // Read the CSV file
  const csvPath = path.join(process.cwd(), 'puffco_products_mapped.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  // Skip header
  const dataLines = lines.slice(1);
  
  // Parse CSV to map name -> description
  const descriptionMap = new Map<string, string>();
  
  for (const line of dataLines) {
    const fields = parseCSVLine(line);
    if (fields.length >= 7) {
      const name = fields[0];
      const description = fields[6]; // detailedDescription field
      if (name && description) {
        descriptionMap.set(name.trim(), description.trim());
      }
    }
  }
  
  console.log(`📋 Found ${descriptionMap.size} products with descriptions in CSV\n`);
  
  // Get all products
  const products: AdminProduct[] = await ProductStorage.readProducts();
  const puffcoProducts = products.filter(p => p.brand === 'Puffco');
  
  console.log(`🔍 Found ${puffcoProducts.length} Puffco products in database\n`);
  
  let updatedCount = 0;
  
  for (const product of puffcoProducts) {
    const csvDescription = descriptionMap.get(product.name);
    
    if (csvDescription && (!product.shortDescription || !product.detailedDescription)) {
      // Update product with description
      const updates: Partial<AdminProduct> = {
        shortDescription: csvDescription.substring(0, 200), // First 200 chars for short
        detailedDescription: csvDescription
      };
      
      await ProductStorage.updateProduct(product.id, updates);
      
      console.log(`✅ Updated: ${product.name}`);
      updatedCount++;
    }
  }
  
  console.log(`\n🎉 Updated ${updatedCount} products with descriptions`);
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
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
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

fixPuffcoDescriptions().catch(console.error);
