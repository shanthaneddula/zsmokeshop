'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface Row {
  status: 'ok' | 'warning' | 'action';
  hidden: boolean;
  suggestHide?: boolean;
}

/** Summary of catalog compliance status with a link to the visibility page (full admins only). */
export default function CatalogComplianceBanner() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    fetch('/api/admin/catalog-visibility', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setRows(j?.success ? j.data.rows : null))
      .catch(() => setRows(null));
  }, []);

  if (!rows) return null;
  const action = rows.filter((r) => r.status === 'action').length;
  const actionShown = rows.filter((r) => r.status === 'action' && !r.hidden).length;
  const warning = rows.filter((r) => r.status === 'warning').length;
  const hidden = rows.filter((r) => r.hidden).length;
  const suggestShown = rows.filter((r) => r.suggestHide && !r.hidden).length;
  if (!action && !warning) return null;

  const urgent = actionShown > 0;
  return (
    <div
      role={urgent ? 'alert' : 'status'}
      className={`flex flex-col sm:flex-row sm:items-center gap-3 border p-4 ${
        urgent
          ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200'
          : 'border-yellow-300 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
      }`}
    >
      {urgent ? <ShieldAlert className="h-5 w-5 flex-shrink-0" /> : <AlertTriangle className="h-5 w-5 flex-shrink-0" />}
      <p className="text-sm flex-1">
        <strong>Catalog compliance:</strong> {action} product(s) need action
        {urgent ? ` and ${actionShown} of them are shown on the website` : ' (hidden from the website)'}, {warning} have a warning,
        {` ${hidden}`} hidden in total.
        {suggestShown > 0 && (
          <>
            {' '}
            <strong>
              Warning: {suggestShown} shown product(s) have cannabis-associated branding or an unverified source; suggest hiding.
            </strong>
          </>
        )}
      </p>
      <Link href="/admin/catalog-visibility" className="text-sm font-bold uppercase tracking-wide underline whitespace-nowrap">
        Review products
      </Link>
    </div>
  );
}
