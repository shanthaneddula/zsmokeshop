// Static catalog helpers. Display-only data used while USE_STATIC_CATALOG is on
// (see src/lib/catalog-source.ts). Nothing here reads or writes Redis.
import type { Category, Product } from '@/types';
import type { CatalogBrand, CatalogCategory, CatalogProduct } from './types';
import { CATALOG_CATEGORIES } from './data';

export type { CatalogBrand, CatalogCategory, CatalogOption, CatalogProduct } from './types';

const ALL_PRODUCTS: CatalogProduct[] = CATALOG_CATEGORIES.flatMap((c) =>
  c.brands.flatMap((b) => b.products)
);
const BY_SLUG = new Map(ALL_PRODUCTS.map((p) => [p.slug, p]));

export function getCatalogCategories(): CatalogCategory[] {
  return CATALOG_CATEGORIES;
}

export function getCatalogCategory(slug: string): CatalogCategory | undefined {
  return CATALOG_CATEGORIES.find((c) => c.slug === slug);
}

export function getCatalogBrand(categorySlug: string, brandSlug: string): CatalogBrand | undefined {
  return getCatalogCategory(categorySlug)?.brands.find((b) => b.slug === brandSlug);
}

export function getAllCatalogProducts(): CatalogProduct[] {
  return ALL_PRODUCTS;
}

export function getCatalogProduct(slug: string): CatalogProduct | undefined {
  return BY_SLUG.get(slug);
}

/**
 * Visibility helpers. `hidden` is the set of product slugs that must not be shown
 * (static defaults merged with admin overrides; see src/lib/catalog-visibility.ts).
 * Brands and categories with no visible products are dropped.
 */
export function filterVisibleCategories(hidden: ReadonlySet<string>): CatalogCategory[] {
  if (hidden.size === 0) return CATALOG_CATEGORIES;
  return CATALOG_CATEGORIES.map((c) => ({
    ...c,
    brands: c.brands
      .map((b) => ({ ...b, products: b.products.filter((p) => !hidden.has(p.slug)) }))
      .filter((b) => b.products.length > 0),
  }))
    .filter((c) => c.brands.length > 0)
    .map((c) => {
      const imageOwner = ALL_PRODUCTS.find((p) => p.image === c.image);
      return imageOwner && hidden.has(imageOwner.slug) ? { ...c, image: c.brands[0].products[0].image } : c;
    });
}

export function searchCatalog(query: string, hidden?: ReadonlySet<string>): CatalogProduct[] {
  const q = query.toLowerCase().trim();
  const pool = hidden && hidden.size ? ALL_PRODUCTS.filter((p) => !hidden.has(p.slug)) : ALL_PRODUCTS;
  if (!q) return pool;
  return pool.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.options.some((o) => o.values.some((v) => v.toLowerCase().includes(q)))
  );
}

/** Related items: same brand first, then the rest of the category. */
export function getRelatedCatalogProducts(
  product: CatalogProduct,
  limit = 8,
  hidden?: ReadonlySet<string>
): CatalogProduct[] {
  const cat = getCatalogCategory(product.categorySlug);
  if (!cat) return [];
  const ok = (p?: CatalogProduct) => !!p && p.slug !== product.slug && !(hidden && hidden.has(p.slug));
  const sameBrand = (cat.brands.find((b) => b.slug === product.brandSlug)?.products ?? []).filter(ok);
  const others = cat.brands
    .filter((b) => b.slug !== product.brandSlug)
    .map((b) => b.products.find(ok))
    .filter(ok) as CatalogProduct[];
  return [...sameBrand, ...others].slice(0, limit);
}

/** Short "12 Flavors · 2 Sizes" style summary for cards. */
export function summarizeOptions(product: Pick<CatalogProduct, 'options'>): string {
  return product.options
    .map((o) => `${o.values.length} ${o.values.length === 1 ? o.label.replace(/s$/, '') : o.label}`)
    .join(' · ');
}

/** Map to the storefront `Product` shape so existing components (ProductCard etc.) can render it. */
export function toShopProduct(p: CatalogProduct): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.categorySlug,
    price: 0,
    image: p.image,
    description: p.description,
    brand: p.brand,
    inStock: true,
    isCatalogItem: true,
    optionSummary: summarizeOptions(p),
  };
}

export function toShopCategory(c: CatalogCategory): Category {
  return { id: `cat-${c.slug}`, name: c.name, slug: c.slug, image: c.image };
}
