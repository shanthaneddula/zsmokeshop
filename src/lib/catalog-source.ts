// Single switch for where the customer-facing storefront gets its products.
//
//   true  -> static, display-only catalog in src/data/catalog (no prices, no ordering)
//   false -> original Redis-backed products managed in /admin (unchanged code paths)
//
// Default is ON. Set NEXT_PUBLIC_USE_STATIC_CATALOG=false to go back to Redis
// without touching any code. The admin panel always uses Redis regardless.
export const USE_STATIC_CATALOG = process.env.NEXT_PUBLIC_USE_STATIC_CATALOG !== 'false';
