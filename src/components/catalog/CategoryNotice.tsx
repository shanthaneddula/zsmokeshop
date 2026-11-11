// Required/recommended notices shown on catalog category and product pages.
// Kept in one place so every catalog page uses the same wording.

export const CBD_CATEGORY_SLUGS = ['cbd-and-hemp'];

export const FDA_CBD_DISCLAIMER =
  'These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease. 21+ only.';

export function CbdDisclaimer() {
  return (
    <p
      role="note"
      className="border border-gray-300 dark:border-gray-600 p-3 text-xs leading-relaxed text-gray-700 dark:text-gray-300"
    >
      {FDA_CBD_DISCLAIMER}
    </p>
  );
}

export const ACCESSORY_CATEGORY_SLUGS = [
  'glass',
  'grinders-and-scales',
  'nectar-collectors-and-straws',
  'terp-slurpers-and-quartz',
  'vaporizers',
];

export const AGE_LINE = '21+ only. Valid government ID required for every in-store purchase. We do not sell online.';
export const ACCESSORY_USE_NOTE = 'For use with legal tobacco and legal botanical products only.';

// Top-of-page notices for a catalog category (rendered above the heading).
export function CategoryTopNotice({ categorySlug }: { categorySlug: string }) {
  return (
    <div className="space-y-2">
      <p role="note" className="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
        {AGE_LINE}
      </p>
      {ACCESSORY_CATEGORY_SLUGS.includes(categorySlug) && (
        <p role="note" className="text-xs text-gray-600 dark:text-gray-400">
          {ACCESSORY_USE_NOTE}
        </p>
      )}
      {CBD_CATEGORY_SLUGS.includes(categorySlug) && <CbdDisclaimer />}
    </div>
  );
}
