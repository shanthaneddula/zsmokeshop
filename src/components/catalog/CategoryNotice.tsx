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

// Top-of-page notices for a catalog category (rendered above the description).
export function CategoryTopNotice({ categorySlug }: { categorySlug: string }) {
  if (CBD_CATEGORY_SLUGS.includes(categorySlug)) return <CbdDisclaimer />;
  return null;
}
