// Types for the static (display-only) product catalog.
// Kept separate from the Redis-backed AdminProduct/Product types on purpose.

export interface CatalogOption {
  /** e.g. "Flavors", "Sizes", "Colors", "Strengths", "Pack Sizes" */
  label: string;
  values: string[];
}

export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandSlug: string;
  category: string;
  categorySlug: string;
  /** Local path under /public, e.g. /catalog/vaporizers/puffco/puffco-peak.webp */
  image: string;
  description: string;
  options: CatalogOption[];
  /** Brand-published lab report (certificate of analysis) page or PDF, when one exists */
  labReportUrl?: string;
  /** Hidden by default (static). Admins can override per product in /admin/catalog-visibility. */
  hidden?: boolean;
  /** Why the product is hidden by default (shown to admins only). */
  hiddenReason?: string;
}

export interface CatalogBrand {
  name: string;
  slug: string;
  description: string;
  products: CatalogProduct[];
}

export interface CatalogCategory {
  name: string;
  slug: string;
  description: string;
  /** Representative image (first product of the first brand) */
  image: string;
  brands: CatalogBrand[];
}
