import { CONTACT_INBOX_EMAIL_DEFAULT } from '@/lib/inbox-config';

export function getContactInboxEmail(): string {
  const value = process.env.CONTACT_INBOX_EMAIL?.trim();
  return value || CONTACT_INBOX_EMAIL_DEFAULT;
}

export function canWriteBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN) &&
    (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1');
}
