// Compliance guard for the legacy Redis-backed storefront paths.
//
// The store does not sell or advertise THC / hemp-THC (delta-8, delta-9, THCA, HHC...),
// kratom, 7-OH (7-hydroxymitragynine), kava or nitrous oxide / whipped-cream chargers.
// Older admin data in Redis may still contain such products or categories. This module
// only FILTERS them out of public responses; it never modifies or deletes Redis data.

export const RESTRICTED_CATEGORY_SLUGS = new Set([
  'cannabis-products',
  'thc-a',
  'thca',
  'kratoms',
  'kratom',
  'whipped-cream-chargers-nitrous-oxide',
  'nitrous-oxide',
]);

const RESTRICTED_TEXT =
  /\b(thc|thca|thc-?a|thcp|thcv|hhc|delta[\s-]?(8|9|10)|d8|d9|kratom|mitragyn\w*|7[\s-]?oh|7-hydroxy\w*|kava|nitrous|n2o|whip+(ed)?[\s-]?(cream)?[\s-]?chargers?|galaxy gas|cannabis|marijuana|psilocybin|amanita)\b/i;

export function isRestrictedCategorySlug(slug?: string | null): boolean {
  return !!slug && RESTRICTED_CATEGORY_SLUGS.has(slug.trim().toLowerCase());
}

export function isRestrictedText(text?: string | null): boolean {
  return !!text && RESTRICTED_TEXT.test(text);
}

// True when a Redis/admin product must never be shown publicly.
// "THC-free" wording (for THC-free CBD) is not treated as restricted.
export function isRestrictedProduct(p: {
  category?: string | null;
  name?: string | null;
  description?: string | null;
  brand?: string | null;
}): boolean {
  if (isRestrictedCategorySlug(p.category)) return true;
  const text = [p.name, p.brand, p.description].filter(Boolean).join(' ').replace(/thc[\s-]?free/gi, '');
  return isRestrictedText(text);
}
