export const CONTACT_INBOX_EMAIL_DEFAULT = 'info@zsmokeshop.com';
export const STORE_PHONE_DISPLAY = '(512) 227-9820';
export const STORE_PHONE_TEL = '+15122279820';
export const STORE_ADDRESS = '719 W William Cannon Dr #105, Austin, TX 78745';
export const RETENTION_DAYS_AFTER_CLOSE = 90;
export const ORPHAN_BLOB_MAX_AGE_MS = 48 * 60 * 60 * 1000;
export const MAX_REQUEST_IMAGES = 3;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const;

export const CONTACT_STATUSES = ['new', 'read', 'closed'] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const PRODUCT_REQUEST_STATUSES = [
  'new',
  'sourcing',
  'ordered',
  'arrived',
  'notified',
  'closed',
] as const;
export type ProductRequestStatus = (typeof PRODUCT_REQUEST_STATUSES)[number];

export const CONTACT_PREFERENCES = ['email', 'text', 'either'] as const;
export type ContactPreference = (typeof CONTACT_PREFERENCES)[number];

export const RATE_LIMITS = {
  contactPerIp: 5,
  contactPerEmail: 3,
  requestPerIp: 5,
  requestPerEmail: 3,
  uploadPerIp: 10,
  windowSeconds: 60 * 60,
} as const;

