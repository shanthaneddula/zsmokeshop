// Federal required warning for nicotine/tobacco product advertising (21 CFR 1143.3):
// bold sans-serif, black on white, inside a rectangular border, at the top of the page
// and at least 20% of the advertisement area. Do not restyle it to be less prominent.

export const NICOTINE_CATEGORY_SLUGS = [
  'vapes-mods-and-pods',
  'roll-your-own-tobacco',
  'cigarillos',
  'hookah-and-shisha',
];

export const NICOTINE_WARNING_TEXT = 'WARNING: This product contains nicotine. Nicotine is an addictive chemical.';

export function isNicotineCategory(slug?: string | null): boolean {
  return !!slug && NICOTINE_CATEGORY_SLUGS.includes(slug);
}

export default function NicotineWarning() {
  return (
    <div className="bg-white px-4 py-4 md:py-6">
      <div
        role="note"
        aria-label="Nicotine warning"
        className="mx-auto max-w-6xl min-h-[20vh] flex items-center justify-center border-[4mm] border-black bg-white px-4 py-6 text-center"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        <p className="text-2xl md:text-4xl font-bold leading-tight text-black">{NICOTINE_WARNING_TEXT}</p>
      </div>
    </div>
  );
}
