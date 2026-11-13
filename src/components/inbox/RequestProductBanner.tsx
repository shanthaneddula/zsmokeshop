import Link from 'next/link';

export default function RequestProductBanner({ className = '' }: { className?: string }) {
  return (
    <div className={`border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 ${className}`}>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        Looking for something we don&apos;t have in the store?{' '}
        <Link href="/request-product" className="font-bold uppercase tracking-wide underline underline-offset-2">
          Request a product
        </Link>
        . If we can get it, you can pick it up in store with a valid ID (21+). We don&apos;t sell or ship online.
      </p>
    </div>
  );
}
