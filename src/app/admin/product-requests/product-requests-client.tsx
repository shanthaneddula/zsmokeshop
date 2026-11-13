'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/app/admin/components/AdminLayout';
import { PRODUCT_REQUEST_STATUSES, STORE_PHONE_DISPLAY, type ProductRequestStatus } from '@/lib/inbox-config';
import { defaultCustomerEmailTemplate, defaultManualTextMessage } from '@/lib/inbox-templates';
import type { ProductRequest } from '@/types/inbox';

function formatWhen(value: string): string {
  try {
    return new Date(value).toLocaleString('en-US', {
      timeZone: 'America/Chicago',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

export default function ProductRequestsClient() {
  const [items, setItems] = useState<ProductRequest[]>([]);
  const [status, setStatus] = useState<ProductRequestStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [textMessage, setTextMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const load = useCallback(async (nextStatus = status, nextQuery = query) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (nextStatus !== 'all') params.set('status', nextStatus);
      if (nextQuery.trim()) params.set('q', nextQuery.trim());
      const response = await fetch(`/api/admin/product-requests?${params.toString()}`, { cache: 'no-store' });
      const json = (await response.json()) as { success?: boolean; data?: ProductRequest[]; error?: string };
      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Failed to load requests');
      }
      setItems(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [query, status]);

  useEffect(() => {
    void load(status, query);
    // Re-fetch when the status filter changes. Search runs on button / Enter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) || null,
    [items, selectedId]
  );

  useEffect(() => {
    if (!selected) return;
    const email = defaultCustomerEmailTemplate(selected);
    setEmailSubject(email.subject);
    setEmailBody(email.body);
    setTextMessage(defaultManualTextMessage(selected));
    setCopied(false);
    // Refresh drafts when the selected request or its status changes, not on every note/timeline update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, selected?.status]);

  async function patch(id: string, body: Record<string, unknown>) {
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/product-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = (await response.json()) as { success?: boolean; data?: ProductRequest; error?: string };
      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Update failed');
      }
      setItems((current) => current.map((item) => (item.id === id ? json.data! : item)));
      setNote('');
      return json.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(textMessage);
      setCopied(true);
    } catch {
      setError('Could not copy the text. Select it and copy manually.');
    }
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-gray-900 dark:text-white">Product Requests</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Customer requests for items we may not carry. Closed requests and their photos are deleted after 90 days. Texts are sent manually from {STORE_PHONE_DISPLAY} — this page never sends SMS.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void load(status, query);
            }}
            placeholder="Search product, customer, phone…"
            className="flex-1 px-4 py-2 border-2 border-gray-200 bg-white"
          />
          <select
            value={status}
            onChange={(event) => {
              const next = event.target.value as ProductRequestStatus | 'all';
              setStatus(next);
              void load(next, query);
            }}
            className="px-4 py-2 border-2 border-gray-200 bg-white uppercase text-sm font-bold"
          >
            <option value="all">All</option>
            {PRODUCT_REQUEST_STATUSES.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
          <button type="button" onClick={() => void load(status, query)} className="px-4 py-2 bg-black text-white uppercase text-sm font-bold">
            Search
          </button>
        </div>
        {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-6">
          <div className="border-2 border-gray-200 bg-white divide-y">
            {loading && <p className="p-4 text-sm text-gray-500">Loading…</p>}
            {!loading && items.length === 0 && <p className="p-4 text-sm text-gray-500">No product requests.</p>}
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`w-full text-left p-4 hover:bg-gray-50 ${selectedId === item.id ? 'bg-gray-100' : ''}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-gray-900 truncate">{item.productName}</p>
                  <span className="text-[10px] uppercase tracking-wide font-bold text-gray-500">{item.status}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {item.customerName}
                  {item.brand ? ` · ${item.brand}` : ''}
                  {item.restrictedFlag ? ' · flagged' : ''}
                </p>
                <p className="text-xs text-gray-400 mt-1">{formatWhen(item.createdAt)}</p>
              </button>
            ))}
          </div>
          <div className="border-2 border-gray-200 bg-white p-4 sm:p-6 min-h-64">
            {!selected && <p className="text-sm text-gray-500">Select a request to manage it.</p>}
            {selected && (
              <div className="space-y-5">
                {selected.restrictedFlag && (
                  <p className="text-sm bg-amber-50 border border-amber-200 text-amber-900 p-3">
                    Flagged for review: this request mentions a hemp or CBD-related term. Confirm it is a legal THC-free item before sourcing.
                  </p>
                )}
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wide text-gray-900">{selected.productName}</h2>
                  {selected.brand && <p className="text-sm text-gray-600">{selected.brand}</p>}
                  {selected.details && <p className="mt-2 whitespace-pre-wrap text-gray-800">{selected.details}</p>}
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><span className="font-bold">Customer:</span> {selected.customerName}</p>
                  {selected.email && (
                    <p><span className="font-bold">Email:</span> <a className="underline" href={`mailto:${selected.email}`}>{selected.email}</a> {selected.emailConsent ? '(consented)' : '(no email consent)'}</p>
                  )}
                  {selected.phone && (
                    <p><span className="font-bold">Phone:</span> <a className="underline" href={`tel:${selected.phone}`}>{selected.phone}</a> {selected.textConsent ? '(consented to manual text)' : '(no text consent)'}</p>
                  )}
                  <p><span className="font-bold">Preference:</span> {selected.contactPreference}</p>
                  <p className="text-xs text-gray-400">{formatWhen(selected.createdAt)}</p>
                </div>
                {selected.images.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {selected.images.map((image) => (
                      <a key={image.pathname} href={image.url} target="_blank" rel="noreferrer" className="w-24 h-24 border border-gray-200 overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.url} alt="" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Status</label>
                  <select
                    value={selected.status}
                    disabled={saving}
                    onChange={(event) => void patch(selected.id, { status: event.target.value })}
                    className="px-3 py-2 border-2 border-gray-200 bg-white uppercase text-sm font-bold"
                  >
                    {PRODUCT_REQUEST_STATUSES.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 border-t-2 border-gray-100 pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">Email the customer</h3>
                  {selected.email && selected.emailConsent ? (
                    <>
                      <input value={emailSubject} onChange={(event) => setEmailSubject(event.target.value)} className="w-full px-3 py-2 border-2 border-gray-200" />
                      <textarea value={emailBody} onChange={(event) => setEmailBody(event.target.value)} rows={5} className="w-full px-3 py-2 border-2 border-gray-200" />
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void patch(selected.id, { action: 'email', subject: emailSubject, body: emailBody })}
                        className="px-3 py-2 bg-black text-white text-xs font-bold uppercase disabled:opacity-50"
                      >
                        Send email
                      </button>
                      {selected.lastEmailedAt && <p className="text-xs text-gray-400">Last emailed {formatWhen(selected.lastEmailedAt)}</p>}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No email consent on file.</p>
                  )}
                </div>

                <div className="space-y-2 border-t-2 border-gray-100 pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">Manual text from {STORE_PHONE_DISPLAY}</h3>
                  {selected.phone && selected.textConsent ? (
                    <>
                      <p className="text-sm">Send this yourself from the store phone to <a className="font-bold underline" href={`tel:${selected.phone}`}>{selected.phone}</a>. This site will not send a text.</p>
                      <textarea value={textMessage} onChange={(event) => { setTextMessage(event.target.value); setCopied(false); }} rows={4} className="w-full px-3 py-2 border-2 border-gray-200" />
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => void copyText()} className="px-3 py-2 border-2 border-gray-300 text-xs font-bold uppercase">
                          {copied ? 'Copied' : 'Copy message'}
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => void patch(selected.id, { action: 'mark-texted' })}
                          className="px-3 py-2 bg-black text-white text-xs font-bold uppercase disabled:opacity-50"
                        >
                          Mark texted
                        </button>
                      </div>
                      {selected.lastTextedAt && <p className="text-xs text-gray-400">Last marked texted {formatWhen(selected.lastTextedAt)}</p>}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No manual-text consent on file.</p>
                  )}
                </div>

                <div className="border-t-2 border-gray-100 pt-4 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">Notes</h3>
                  {selected.notes.map((itemNote) => (
                    <div key={itemNote.id} className="text-sm border-l-2 border-gray-300 pl-3">
                      <p className="text-xs text-gray-400">{itemNote.by} · {formatWhen(itemNote.at)}</p>
                      <p className="whitespace-pre-wrap">{itemNote.text}</p>
                    </div>
                  ))}
                  <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Add an internal note" className="w-full px-3 py-2 border-2 border-gray-200" />
                  <button type="button" disabled={saving || !note.trim()} onClick={() => void patch(selected.id, { note })} className="px-3 py-2 bg-black text-white text-xs font-bold uppercase disabled:opacity-50">
                    Add note
                  </button>
                </div>

                <div className="border-t-2 border-gray-100 pt-4 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">Timeline</h3>
                  <ol className="space-y-2">
                    {selected.timeline.slice().reverse().map((event) => (
                      <li key={event.id} className="text-sm">
                        <span className="text-[10px] uppercase font-bold tracking-wide text-gray-500">{event.type}</span>
                        {' · '}
                        <span className="text-xs text-gray-400">{event.by} · {formatWhen(event.at)}</span>
                        <p>{event.detail}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
