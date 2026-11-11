// Compliance review rules for the static catalog (client-safe, no Redis).
//
// Each product gets a status shown in /admin/catalog-visibility:
//   ok      - nothing known to fix
//   warning - can be shown, but read the note (permits, wording, records to keep)
//   action  - action needed; hidden by default until fixed or an admin overrides it
//
// These are conservative, plain-language notes, not legal advice. When in doubt the
// product is hidden by default and an admin decides.
import type { CatalogProduct } from './types';

export type ComplianceStatus = 'ok' | 'warning' | 'action';

export interface ComplianceInfo {
  status: ComplianceStatus;
  reasons: string[];
  /** Static default before any admin override. */
  defaultHidden: boolean;
}

interface Rule {
  /** 'action' rules hide the product by default. */
  status: 'warning' | 'action';
  reason: string;
  match: (p: CatalogProduct) => boolean;
}

const inCat = (...slugs: string[]) => (p: CatalogProduct) => slugs.includes(p.categorySlug);
const brandIn = (cat: string, ...brands: string[]) => (p: CatalogProduct) =>
  p.categorySlug === cat && brands.includes(p.brandSlug);

const RULES: Rule[] = [
  {
    status: 'action',
    match: brandIn('vapes-mods-and-pods', 'geek-bar', 'lost-mary', 'raz'),
    reason:
      'Pre-filled disposable e-cigarette from a China-based maker. Texas SB 2024 (Health & Safety Code 161.0876, in effect since Sept 1, 2025) bans marketing or selling e-cigarette products made in China, and the product has no FDA marketing authorization. Keep hidden.',
  },
  {
    status: 'action',
    match: brandIn('vapes-mods-and-pods', 'smok', 'vaporesso'),
    reason:
      'Refillable e-cigarette device made in China (Shenzhen) with no FDA marketing authorization. Empty hardware may fall outside SB 2024, but federal law treats unauthorized ENDS as illegal to sell. Keep hidden unless a lawyer approves.',
  },
  {
    status: 'action',
    match: (p) => /high times/i.test(p.name),
    reason:
      'Co-branded with High Times, a cannabis publication. Cannabis branding on an accessory can be used as evidence of intended drug use (Texas Health & Safety Code 481.183). Hidden to be safe.',
  },
  {
    status: 'warning',
    match: inCat('vaporizers'),
    reason:
      'Electronic vaporizer: Texas treats it as an e-cigarette (Health & Safety Code 161.081). 21+ only and an e-cigarette retailer permit is required. Confirm country of manufacture and keep wording to legal products.',
  },
  {
    status: 'warning',
    match: inCat('nectar-collectors-and-straws', 'terp-slurpers-and-quartz'),
    reason:
      'Accessory commonly linked to concentrates. Keep all wording to legal tobacco/botanical use (Texas paraphernalia law, Health & Safety Code 481.125) and avoid cannabis imagery in listings and signage.',
  },
  {
    status: 'action',
    match: (p) => p.categorySlug === 'cbd-and-hemp' && /\b(sleep|calm|rest|recovery|relief|pm)\b/i.test(p.name),
    reason:
      'Product name suggests a health effect (sleep, calm, rest, recovery, relief). FDA treats implied health claims on CBD as unapproved drug claims. Hidden to be safe; show only if a lawyer approves.',
  },
  {
    status: 'warning',
    match: inCat('cbd-and-hemp'),
    reason:
      'Hemp product: Texas requires a DSHS retail hemp registration. Keep a current certificate of analysis showing no detectable THC for each product and lot, and make no health claims.',
  },
];

export function getComplianceInfo(p: CatalogProduct): ComplianceInfo {
  const reasons: string[] = [];
  let action = false;
  let warning = false;
  if (p.hidden) {
    action = true;
    reasons.push(p.hiddenReason || 'Hidden by default.');
  }
  for (const r of RULES) {
    if (!r.match(p)) continue;
    reasons.push(r.reason);
    if (r.status === 'action') action = true;
    else warning = true;
  }
  return { status: action ? 'action' : warning ? 'warning' : 'ok', reasons, defaultHidden: action };
}
