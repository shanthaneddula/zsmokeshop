import { isValidEmail } from '@/lib/resend-service';
import { STORE_PHONE_DISPLAY } from '@/lib/inbox-config';

export function isHoneypotTriggered(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export function cleanText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}

export function multilineText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\r\n/g, '\n').trim().slice(0, max);
}

export function isChecked(value: unknown): boolean {
  return value === true || value === 'true' || value === 'on' || value === '1';
}

export function normalizePhone(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const digits = value.replace(/\D/g, '');
  if (!digits) return undefined;
  let normalized = digits;
  if (normalized.length === 11 && normalized.startsWith('1')) {
    normalized = normalized.slice(1);
  }
  if (normalized.length !== 10) return undefined;
  return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
}

export function phoneDigits(display: string | undefined): string {
  return (display || '').replace(/\D/g, '').replace(/^1/, '');
}

export function requireEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  if (!isValidEmail(email)) return null;
  return email;
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function telHref(phone = STORE_PHONE_DISPLAY): string {
  const digits = phone.replace(/\D/g, '');
  return digits ? `tel:+1${digits.replace(/^1/, '')}` : 'tel:+15122279820';
}
