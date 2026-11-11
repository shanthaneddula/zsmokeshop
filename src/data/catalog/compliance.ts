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

const RULES: Rule[] = [];

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
