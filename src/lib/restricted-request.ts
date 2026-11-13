import { isRestrictedText } from '@/lib/restricted-content';

// Legal or ambiguous terms that staff should review (the store does carry THC-free CBD).
const FLAG_TEXT =
  /\b(cbd|cbg|cbn|cbc|cannabinoid|full[\s-]?spectrum|broad[\s-]?spectrum|live[\s-]?resin|rosin|distillate|hemp[\s-]?(extract|oil|derived|tincture|gummies|gummy))\b/i;

export const BLOCKED_REQUEST_MESSAGE =
  "We can't accept this request. Z Smoke Shop does not carry THC, delta-8, kratom, 7-OH, nitrous, or similar products. If you meant a legal THC-free CBD item, please describe it without those terms, or visit the store with a valid ID (21+).";

export function requestTextIsBlocked(...parts: Array<string | null | undefined>): boolean {
  const text = parts.filter(Boolean).join(' ').replace(/thc[\s-]?free/gi, '');
  return isRestrictedText(text);
}

export function requestTextShouldFlag(...parts: Array<string | null | undefined>): boolean {
  if (requestTextIsBlocked(...parts)) return false;
  const text = parts.filter(Boolean).join(' ');
  return FLAG_TEXT.test(text);
}
