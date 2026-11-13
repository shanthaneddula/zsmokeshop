'use client';

import { useMemo, useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { upload } from '@vercel/blob/client';
import HoneypotField from '@/components/inbox/HoneypotField';
import { MAX_IMAGE_BYTES, MAX_REQUEST_IMAGES, STORE_PHONE_DISPLAY } from '@/lib/inbox-config';
import type { ProductRequestImage } from '@/types/inbox';

const inputClass =
  'w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent';
const labelClass = 'block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2';
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function newRequestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = Math.floor(Math.random() * 16);
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}

export default function RequestProductForm() {
  const [requestId] = useState(newRequestId);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [images, setImages] = useState<ProductRequestImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [preference, setPreference] = useState<'email' | 'text' | 'either'>('email');

  const canAddImages = images.length < MAX_REQUEST_IMAGES;
  const privacyLink = useMemo(
    () => (
      <Link href="/privacy" className="underline underline-offset-2">
        Privacy Policy
      </Link>
    ),
    []
  );

  async function uploadFile(file: File): Promise<ProductRequestImage> {
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Images must be JPEG, PNG, or WebP');
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error('Each image must be 5 MB or smaller');
    }
    const pathname = `product-requests/${requestId}/${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    try {
      const blob = await upload(pathname, file, {
        access: 'public',
        handleUploadUrl: '/api/product-requests/upload',
        clientPayload: JSON.stringify({ requestId }),
      });
      return {
        pathname: blob.pathname,
        url: blob.url,
        contentType: file.type,
        size: file.size,
      };
    } catch {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('requestId', requestId);
      const response = await fetch('/api/product-requests/upload', { method: 'POST', body: formData });
      const json = (await response.json().catch(() => null)) as
        | { success?: boolean; error?: string; data?: ProductRequestImage }
        | null;
      if (!response.ok || !json?.success || !json.data) {
        throw new Error(json?.error || 'Image upload failed');
      }
      return json.data;
    }
  }

  async function onSelectImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    const remaining = MAX_REQUEST_IMAGES - images.length;
    if (remaining <= 0) return;
    setUploading(true);
    setError('');
    try {
      const uploaded: ProductRequestImage[] = [];
      for (const file of files.slice(0, remaining)) {
        uploaded.push(await uploadFile(file));
      }
      setImages((current) => [...current, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setStatus('submitting');
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      id: requestId,
      productName: String(data.get('productName') || ''),
      brand: String(data.get('brand') || ''),
      details: String(data.get('details') || ''),
      images,
      customerName: String(data.get('customerName') || ''),
      email: String(data.get('email') || ''),
      phone: String(data.get('phone') || ''),
      contactPreference: preference,
      website: String(data.get('website') || ''),
      ageConfirmed: data.get('ageConfirmed') === 'on',
      emailConsent: data.get('emailConsent') === 'on',
      textConsent: data.get('textConsent') === 'on',
    };
    try {
      const response = await fetch('/api/product-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await response.json().catch(() => null)) as { success?: boolean; error?: string } | null;
      if (!response.ok || !json?.success) {
        setError(json?.error || 'We could not submit your request. Please call the store.');
        setStatus('error');
        return;
      }
      setStatus('success');
    } catch {
      setError('We could not submit your request. Please call the store or email info@zsmokeshop.com.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="space-y-4 border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold uppercase tracking-wide text-gray-900 dark:text-white">Request received</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Thanks for your request. This is not an order. If you gave us an email and consented to email contact, we sent
          a confirmation. We will follow up by the method you chose if we can get the item for in-store pickup.
        </p>
        <Link href="/shop" className="inline-block text-sm font-bold uppercase tracking-wide underline underline-offset-2">
          Back to the shop
        </Link>
      </div>
    );
  }

  const wantsEmail = preference === 'email' || preference === 'either';
  const wantsText = preference === 'text' || preference === 'either';

  return (
    <form className="relative space-y-6" onSubmit={onSubmit} noValidate>
      <HoneypotField />
      <div>
        <label htmlFor="productName" className={labelClass}>Product name</label>
        <input type="text" id="productName" name="productName" className={inputClass} required maxLength={150} />
      </div>
      <div>
        <label htmlFor="brand" className={labelClass}>Brand <span className="font-normal normal-case tracking-normal text-gray-500">(optional)</span></label>
        <input type="text" id="brand" name="brand" className={inputClass} maxLength={100} />
      </div>
      <div>
        <label htmlFor="details" className={labelClass}>Details <span className="font-normal normal-case tracking-normal text-gray-500">(optional: size, flavor, where you saw it)</span></label>
        <textarea id="details" name="details" rows={5} className={`${inputClass} resize-none`} maxLength={3000} />
      </div>
      <div>
        <p className={labelClass}>Photos <span className="font-normal normal-case tracking-normal text-gray-500">(optional, up to {MAX_REQUEST_IMAGES}, JPEG/PNG/WebP, 5 MB each)</span></p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={!canAddImages || uploading}
          onChange={onSelectImages}
          className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:px-4 file:py-2 file:border file:border-black file:bg-black file:text-white file:uppercase file:tracking-wide file:text-xs file:font-bold"
        />
        {uploading && <p className="mt-2 text-sm text-gray-500">Uploading…</p>}
        {images.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-3">
            {images.map((image) => (
              <li key={image.pathname} className="relative w-24 h-24 border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-black text-white text-xs px-1"
                  onClick={() => setImages((current) => current.filter((item) => item.pathname !== image.pathname))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <label htmlFor="customerName" className={labelClass}>Your name</label>
        <input type="text" id="customerName" name="customerName" className={inputClass} required maxLength={100} autoComplete="name" />
      </div>
      <fieldset className="space-y-3">
        <legend className={labelClass}>How should we contact you?</legend>
        {([
          ['email', 'Email'],
          ['text', 'Manual text from the store phone'],
          ['either', 'Email or text'],
        ] as const).map(([value, label]) => (
          <label key={value} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="radio"
              name="contactPreference"
              value={value}
              checked={preference === value}
              onChange={() => setPreference(value)}
              className="h-4 w-4 border-gray-300 text-black focus:ring-black"
            />
            {label}
          </label>
        ))}
      </fieldset>
      <div>
        <label htmlFor="email" className={labelClass}>Email {wantsEmail ? '' : <span className="font-normal normal-case tracking-normal text-gray-500">(optional)</span>}</label>
        <input type="email" id="email" name="email" className={inputClass} required={preference === 'email'} maxLength={150} autoComplete="email" />
      </div>
      <div>
        <label htmlFor="phone" className={labelClass}>Phone {wantsText ? '' : <span className="font-normal normal-case tracking-normal text-gray-500">(optional)</span>}</label>
        <input type="tel" id="phone" name="phone" className={inputClass} required={preference === 'text'} autoComplete="tel" />
      </div>
      <label className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        <input type="checkbox" name="ageConfirmed" className="mt-1 h-4 w-4 border-gray-300 text-black focus:ring-black" required />
        <span>I confirm that I am 21 years of age or older. I understand this is a request for in-store pickup only, not an online sale, and a valid ID is required at purchase.</span>
      </label>
      {wantsEmail && (
        <label className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <input type="checkbox" name="emailConsent" className="mt-1 h-4 w-4 border-gray-300 text-black focus:ring-black" required={wantsEmail} />
          <span>
            I agree that Z Smoke Shop may email me at the address I provided about this product request. See our {privacyLink}.
          </span>
        </label>
      )}
      {wantsText && (
        <label className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <input type="checkbox" name="textConsent" className="mt-1 h-4 w-4 border-gray-300 text-black focus:ring-black" required={wantsText} />
          <span>
            I agree that Z Smoke Shop may send me manual text messages from {STORE_PHONE_DISPLAY} about this product
            request. These texts are sent by a person from the store phone, not an automated messaging system. Message
            frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out. Consent is not a condition of
            purchase. See our <Link href="/sms-terms.html" className="underline underline-offset-2">SMS Terms</Link> and{' '}
            {privacyLink}.
          </span>
        </label>
      )}
      {error && (
        <p className="text-sm text-red-700 dark:text-red-400" role="alert">{error}</p>
      )}
      <button
        type="submit"
        disabled={status === 'submitting' || uploading}
        className="w-full bg-black dark:bg-white text-white dark:text-black px-8 py-4 font-bold uppercase tracking-wide border border-black dark:border-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-colors duration-200 disabled:opacity-60"
      >
        {status === 'submitting' ? 'Submitting…' : 'Submit request'}
      </button>
    </form>
  );
}
