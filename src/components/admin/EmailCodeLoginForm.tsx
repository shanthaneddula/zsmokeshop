'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface EmailCodeLoginFormProps {
  /** Where admins land after login (employees always go to /admin/my-dashboard). */
  adminRedirect: string;
  onUsePassword: () => void;
}

const inputClass =
  'w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 transition-all';
const primaryButtonClass =
  'w-full flex items-center justify-center border border-gray-900 dark:border-white bg-gray-900 dark:bg-white px-6 py-3 text-sm font-black uppercase tracking-wide text-white dark:text-gray-900 hover:bg-white hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';
const linkButtonClass =
  'text-sm font-medium text-gray-600 dark:text-gray-400 underline hover:text-gray-900 dark:hover:text-white disabled:opacity-50';

export default function EmailCodeLoginForm({ adminRedirect, onUsePassword }: EmailCodeLoginFormProps) {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const requestCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);
    setError('');
    setInfo('');
    try {
      const response = await fetch('/api/admin/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        setInfo(data.message);
        setCode('');
        setStep('code');
      } else {
        setError(data.error || 'Unable to send a code.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      if (data.success) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (data.user?.role === 'orders-manager' || data.user?.role === 'inventory-manager') {
          window.location.href = '/admin/my-dashboard';
        } else {
          window.location.href = adminRedirect;
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {error && (
        <div className="border border-red-600 bg-red-50 dark:bg-red-900/20 p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      )}
      {info && !error && (
        <div className="border border-green-600 bg-green-50 dark:bg-green-900/20 p-4 flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm font-medium text-green-700 dark:text-green-400">{info}</p>
        </div>
      )}

      {step === 'email' ? (
        <form className="space-y-6" onSubmit={requestCode}>
          <div>
            <label htmlFor="login-email" className="block text-sm font-black uppercase tracking-wide text-gray-900 dark:text-white mb-2">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => { setEmail(e.target.value); if (error) setError(''); }}
              className={inputClass}
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>
          <button type="submit" disabled={isLoading || !email} className={primaryButtonClass}>
            {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>) : 'Email Me a Code'}
          </button>
        </form>
      ) : (
        <form className="space-y-6" onSubmit={verifyCode}>
          <div>
            <label htmlFor="login-code" className="block text-sm font-black uppercase tracking-wide text-gray-900 dark:text-white mb-2">
              6-Digit Code
            </label>
            <input
              id="login-code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              value={code}
              onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); if (error) setError(''); }}
              className={`${inputClass} text-center text-2xl tracking-[0.5em]`}
              placeholder="000000"
              disabled={isLoading}
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Sent to {email}</p>
          </div>
          <button type="submit" disabled={isLoading || code.length !== 6} className={primaryButtonClass}>
            {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</>) : 'Sign In'}
          </button>
          <div className="flex justify-between">
            <button type="button" className={linkButtonClass} disabled={isLoading} onClick={() => { setStep('email'); setInfo(''); setError(''); }}>
              Use a different email
            </button>
            <button type="button" className={linkButtonClass} disabled={isLoading} onClick={() => requestCode()}>
              Resend code
            </button>
          </div>
        </form>
      )}

      <div className="text-center">
        <button type="button" className={linkButtonClass} disabled={isLoading} onClick={onUsePassword}>
          Sign in with username and password instead
        </button>
      </div>
    </div>
  );
}
