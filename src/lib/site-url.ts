/**
 * Canonical public origin for the storefront.
 * Production always uses www so Open Graph, canonical, and sitemap URLs
 * match the live host (the apex domain redirects to www).
 */
export const PRODUCTION_SITE_URL = 'https://www.zsmokeshop.com';

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) {
    try {
      const parsed = new URL(fromEnv);
      if (parsed.hostname === 'zsmokeshop.com') {
        parsed.hostname = 'www.zsmokeshop.com';
      }
      return parsed.origin;
    } catch {
      // fall through to environment-based defaults
    }
  }

  if (process.env.VERCEL_ENV === 'production') {
    return PRODUCTION_SITE_URL;
  }

  // Preview deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Local dev and `next start` — keep the origin local so audits don't flag a host mismatch.
  return `http://localhost:${process.env.PORT || '3000'}`;
}
