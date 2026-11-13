import type { ReactNode } from 'react';

export const LEGAL_LAST_UPDATED = 'November 13, 2026';
export const LEGAL_EMAIL = 'info@zsmokeshop.com';
export const LEGAL_PHONE = '(512) 227-9820';
export const LEGAL_ADDRESS = 'Z Smoke Shop, 719 W William Cannon Dr #105, Austin, TX 78745';

export function LegalSection({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="space-y-3 scroll-mt-32">
      <h2 className="text-xl font-black uppercase tracking-wide text-gray-900 dark:text-white">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{children}</div>
    </section>
  );
}

export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 pt-[6.7rem]">
      <div className="container-wide max-w-3xl py-12 md:py-16 space-y-10">
        <header className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wide text-gray-900 dark:text-white">{title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {LEGAL_LAST_UPDATED}</p>
        </header>
        {children}
      </div>
    </main>
  );
}
