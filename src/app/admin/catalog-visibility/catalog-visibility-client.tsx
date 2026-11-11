'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Eye, EyeOff, RotateCcw, Search, ShieldAlert } from 'lucide-react';

type Status = 'ok' | 'warning' | 'action';

interface Row {
  slug: string;
  name: string;
  brand: string;
  brandSlug: string;
  category: string;
  categorySlug: string;
  image: string;
  status: Status;
  reasons: string[];
  defaultHidden: boolean;
  suggestHide: boolean;
  override: 'show' | 'hide' | null;
  hidden: boolean;
}

interface Payload {
  rows: Row[];
  meta: { updatedAt?: string; updatedBy?: string };
  storage: string;
}

const STATUS_LABEL: Record<Status, string> = { ok: 'OK', warning: 'Warning', action: 'Action needed' };
const STATUS_CLASS: Record<Status, string> = {
  ok: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  action: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

export default function CatalogVisibilityClient() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [status, setStatus] = useState<'' | Status | 'suggest'>('');
  const [visibility, setVisibility] = useState<'' | 'shown' | 'hidden'>('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/catalog-visibility', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || `HTTP ${res.status}`);
      setData(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => data?.rows ?? [], [data]);
  const categories = useMemo(() => {
    const m = new Map<string, string>();
    rows.forEach((r) => m.set(r.categorySlug, r.category));
    return [...m.entries()];
  }, [rows]);
  const brands = useMemo(() => {
    const m = new Map<string, string>();
    rows.filter((r) => !category || r.categorySlug === category).forEach((r) => m.set(r.brandSlug, r.brand));
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [rows, category]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!category || r.categorySlug === category) &&
        (!brand || r.brandSlug === brand) &&
        (!status || (status === 'suggest' ? r.suggestHide : r.status === status)) &&
        (!visibility || (visibility === 'hidden' ? r.hidden : !r.hidden)) &&
        (!q || `${r.name} ${r.brand} ${r.category} ${r.slug}`.toLowerCase().includes(q))
    );
  }, [rows, query, category, brand, status, visibility]);

  const counts = useMemo(() => {
    const c = { action: 0, actionShown: 0, warning: 0, hidden: 0, suggestShown: 0 };
    rows.forEach((r) => {
      if (r.suggestHide && !r.hidden) c.suggestShown++;
      if (r.status === 'action') c.action++;
      if (r.status === 'action' && !r.hidden) c.actionShown++;
      if (r.status === 'warning') c.warning++;
      if (r.hidden) c.hidden++;
    });
    return c;
  }, [rows]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.slug));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allFilteredSelected) filtered.forEach((r) => next.delete(r.slug));
    else filtered.forEach((r) => next.add(r.slug));
    setSelected(next);
  };
  const toggle = (slug: string) => {
    const next = new Set(selected);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setSelected(next);
  };

  const apply = async (action: 'show' | 'hide' | 'default', slugs: string[]) => {
    if (slugs.length === 0) return;
    if (action === 'show') {
      const risky = rows.filter((r) => slugs.includes(r.slug) && r.status === 'action');
      if (
        risky.length > 0 &&
        !window.confirm(
          `${risky.length} selected product(s) are marked "Action needed" for a compliance reason. Showing them may break Texas or federal rules. Show anyway?`
        )
      )
        return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/catalog-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs, action }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || `HTTP ${res.status}`);
      setData(json.data);
      setSelected(new Set());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const selectedList = [...selected];
  const input =
    'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm';
  const btn = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Catalog Visibility</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Show or hide catalog products on the website. Products marked &quot;Action needed&quot; are hidden by default
          for a compliance reason. These notes are a cautious checklist, not legal advice.
        </p>
      </div>

      {counts.actionShown > 0 ? (
        <div role="alert" className="flex gap-3 rounded-md border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
          <ShieldAlert className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">
            <strong>{counts.actionShown} product(s) need action and are currently shown.</strong> Review the reasons below and
            hide them unless a lawyer has cleared them.
          </p>
        </div>
      ) : counts.action > 0 ? (
        <div className="flex gap-3 rounded-md border border-yellow-300 bg-yellow-50 p-4 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">
            <strong>{counts.action} product(s) need action</strong> and are hidden from the website. {counts.warning} more have a
            warning to review. {counts.hidden} product(s) are hidden in total.
          </p>
        </div>
      ) : null}

      {counts.suggestShown > 0 && (
        <div className="flex gap-3 rounded-md border border-yellow-300 bg-yellow-50 p-4 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">
            <strong>{counts.suggestShown} shown product(s) are marked &quot;suggest hiding&quot;</strong> (cannabis-associated
            branding or unverified source). They stay visible by your choice; hiding them is the safer option.{' '}
            <button className="underline font-semibold" onClick={() => setStatus('suggest')}>Show me the list</button>
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            className={`${input} w-full pl-9`}
            placeholder="Search name, brand, category"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
        </div>
        <select className={input} value={category} onChange={(e) => { setCategory(e.target.value); setBrand(''); }} aria-label="Category">
          <option value="">All categories</option>
          {categories.map(([slug, name]) => (
            <option key={slug} value={slug}>{name}</option>
          ))}
        </select>
        <select className={input} value={brand} onChange={(e) => setBrand(e.target.value)} aria-label="Brand">
          <option value="">All brands</option>
          {brands.map(([slug, name]) => (
            <option key={slug} value={slug}>{name}</option>
          ))}
        </select>
        <select className={input} value={status} onChange={(e) => setStatus(e.target.value as '' | Status | 'suggest')} aria-label="Status">
          <option value="">Any status</option>
          <option value="action">Action needed</option>
          <option value="suggest">Warning: suggest hiding</option>
          <option value="warning">Warning</option>
          <option value="ok">OK</option>
        </select>
        <select className={input} value={visibility} onChange={(e) => setVisibility(e.target.value as '' | 'shown' | 'hidden')} aria-label="Visibility">
          <option value="">Shown and hidden</option>
          <option value="shown">Shown only</option>
          <option value="hidden">Hidden only</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {selectedList.length} selected · {filtered.length} of {rows.length} shown in list
        </span>
        <button className={`${btn} bg-gray-900 text-white dark:bg-white dark:text-gray-900`} disabled={saving || !selectedList.length} onClick={() => apply('show', selectedList)}>
          <Eye className="h-4 w-4" /> Show selected
        </button>
        <button className={`${btn} bg-red-600 text-white`} disabled={saving || !selectedList.length} onClick={() => apply('hide', selectedList)}>
          <EyeOff className="h-4 w-4" /> Hide selected
        </button>
        <button className={`${btn} border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200`} disabled={saving || !selectedList.length} onClick={() => apply('default', selectedList)}>
          <RotateCcw className="h-4 w-4" /> Reset to default
        </button>
        {data?.meta?.updatedAt && (
          <span className="ml-auto text-xs text-gray-500">
            Last change {new Date(data.meta.updatedAt).toLocaleString()}{data.meta.updatedBy ? ` by ${data.meta.updatedBy}` : ''} · storage: {data.storage}
          </span>
        )}
      </div>

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-2 text-left">
                <input type="checkbox" checked={allFilteredSelected} onChange={toggleAll} aria-label="Select all in list" />
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Product</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Category / Brand</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Website</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {loading ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-500">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-500">No products match.</td></tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.slug} className={selected.has(r.slug) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                  <td className="px-3 py-2 align-top">
                    <input type="checkbox" checked={selected.has(r.slug)} onChange={() => toggle(r.slug)} aria-label={`Select ${r.name}`} />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <div className="flex items-start gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.image} alt="" className="h-10 w-10 rounded object-contain bg-gray-100" loading="lazy" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{r.name}</div>
                        <div className="text-xs text-gray-500">{r.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top text-gray-700 dark:text-gray-300">
                    <div>{r.category}</div>
                    <div className="text-xs text-gray-500">{r.brand}</div>
                  </td>
                  <td className="px-3 py-2 align-top max-w-md">
                    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[r.status]}`}>
                      {r.status === 'ok' ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {STATUS_LABEL[r.status]}
                    </span>
                    {r.suggestHide && (
                      <span className="ml-1 inline-flex rounded border border-yellow-400 px-2 py-0.5 text-xs font-semibold text-yellow-800 dark:text-yellow-300">
                        Suggest hiding
                      </span>
                    )}
                    {r.reasons.map((reason, i) => (
                      <p key={i} className="mt-1 text-xs text-gray-600 dark:text-gray-400">{reason}</p>
                    ))}
                  </td>
                  <td className="px-3 py-2 align-top whitespace-nowrap">
                    <span className={r.hidden ? 'text-red-600 font-medium' : 'text-green-700 dark:text-green-400 font-medium'}>
                      {r.hidden ? 'Hidden' : 'Shown'}
                    </span>
                    <div className="text-xs text-gray-500">{r.override ? `admin set (${r.override})` : 'default'}</div>
                  </td>
                  <td className="px-3 py-2 align-top whitespace-nowrap">
                    <button
                      className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-50"
                      disabled={saving}
                      onClick={() => apply(r.hidden ? 'show' : 'hide', [r.slug])}
                    >
                      {r.hidden ? 'Show' : 'Hide'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
