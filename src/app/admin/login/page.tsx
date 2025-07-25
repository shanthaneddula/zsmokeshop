// Admin login page

import { Metadata } from 'next';
import LoginForm from './login-form';

export const metadata: Metadata = {
  title: 'Admin Login | Z Smoke Shop',
  description: 'Admin login for Z Smoke Shop management system',
  robots: 'noindex, nofollow', // Prevent search engine indexing
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 border-2 border-gray-900 dark:border-white flex items-center justify-center">
            <span className="text-2xl font-black text-gray-900 dark:text-white">Z</span>
          </div>
          <h2 className="mt-6 text-3xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Z Smoke Shop Management System
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  );
}
