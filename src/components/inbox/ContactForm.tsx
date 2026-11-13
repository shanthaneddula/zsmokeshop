'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import HoneypotField from '@/components/inbox/HoneypotField';

const inputClass =
  'w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent';
const labelClass = 'block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setStatus('submitting');
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') || ''),
      email: String(data.get('email') || ''),
      phone: String(data.get('phone') || ''),
      subject: String(data.get('subject') || ''),
      message: String(data.get('message') || ''),
      website: String(data.get('website') || ''),
      ageConfirmed: data.get('ageConfirmed') === 'on',
      emailConsent: data.get('emailConsent') === 'on',
    };
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await response.json().catch(() => null)) as { success?: boolean; error?: string } | null;
      if (!response.ok || !json?.success) {
        setError(json?.error || 'We could not send your message. Please call the store.');
        setStatus('error');
        return;
      }
      form.reset();
      setStatus('success');
    } catch {
      setError('We could not send your message. Please call the store or email info@zsmokeshop.com.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="space-y-4 border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold uppercase tracking-wide text-gray-900 dark:text-white">Message sent</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Thanks for contacting Z Smoke Shop. We received your message and emailed you a confirmation. We will follow up
          by email.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="text-sm font-bold uppercase tracking-wide underline underline-offset-2"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="relative space-y-6" onSubmit={onSubmit} noValidate>
      <HoneypotField />
      <div>
        <label htmlFor="name" className={labelClass}>Name</label>
        <input type="text" id="name" name="name" className={inputClass} required maxLength={100} autoComplete="name" />
      </div>
      <div>
        <label htmlFor="email" className={labelClass}>Email</label>
        <input type="email" id="email" name="email" className={inputClass} required maxLength={150} autoComplete="email" />
      </div>
      <div>
        <label htmlFor="phone" className={labelClass}>Phone <span className="font-normal normal-case tracking-normal text-gray-500">(optional)</span></label>
        <input type="tel" id="phone" name="phone" className={inputClass} autoComplete="tel" />
      </div>
      <div>
        <label htmlFor="subject" className={labelClass}>Subject</label>
        <input type="text" id="subject" name="subject" className={inputClass} required maxLength={150} />
      </div>
      <div>
        <label htmlFor="message" className={labelClass}>Message</label>
        <textarea id="message" name="message" rows={6} className={`${inputClass} resize-none`} required maxLength={5000} />
      </div>
      <label className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        <input type="checkbox" name="ageConfirmed" className="mt-1 h-4 w-4 border-gray-300 text-black focus:ring-black" required />
        <span>I confirm that I am 21 years of age or older.</span>
      </label>
      <label className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        <input type="checkbox" name="emailConsent" className="mt-1 h-4 w-4 border-gray-300 text-black focus:ring-black" required />
        <span>
          I agree that Z Smoke Shop may email me at the address I provided about this message. See our{' '}
          <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.
        </span>
      </label>
      {error && (
        <p className="text-sm text-red-700 dark:text-red-400" role="alert">{error}</p>
      )}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full bg-black dark:bg-white text-white dark:text-black px-8 py-4 font-bold uppercase tracking-wide border border-black dark:border-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-colors duration-200 disabled:opacity-60"
      >
        {status === 'submitting' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}
