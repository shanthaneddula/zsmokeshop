'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/app/admin/components/AdminLayout';
import { CONTACT_STATUSES, type ContactStatus } from '@/lib/inbox-config';
import type { ContactMessage } from '@/types/inbox';

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

export default function MessagesClient() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [status, setStatus] = useState<ContactStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (nextStatus = status, nextQuery = query) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (nextStatus !== 'all') params.set('status', nextStatus);
      if (nextQuery.trim()) params.set('q', nextQuery.trim());
      const response = await fetch(`/api/admin/messages?${params.toString()}`, { cache: 'no-store' });
      const json = (await response.json()) as { success?: boolean; data?: ContactMessage[]; error?: string };
      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Failed to load messages');
      }
      setItems(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
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

  async function patch(id: string, body: Record<string, unknown>) {
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = (await response.json()) as { success?: boolean; data?: ContactMessage; error?: string };
      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Update failed');
      }
      setItems((current) => current.map((item) => (item.id === id ? json.data! : item)));
      setNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function openMessage(item: ContactMessage) {
    setSelectedId(item.id);
    if (item.status === 'new') {
      await patch(item.id, { status: 'read' });
    }
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-gray-900 dark:text-white">Messages</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Contact form submissions. Closed messages are deleted after 90 days.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void load(status, query);
            }}
            placeholder="Search name, email, subject…"
            className="flex-1 px-4 py-2 border-2 border-gray-200 bg-white"
          />
          <select
            value={status}
            onChange={(event) => {
              const next = event.target.value as ContactStatus | 'all';
              setStatus(next);
              void load(next, query);
            }}
            className="px-4 py-2 border-2 border-gray-200 bg-white uppercase text-sm font-bold"
          >
            <option value="all">All</option>
            {CONTACT_STATUSES.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void load(status, query)}
            className="px-4 py-2 bg-black text-white uppercase text-sm font-bold"
          >
            Search
          </button>
        </div>
        {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6">
          <div className="border-2 border-gray-200 bg-white divide-y">
            {loading && <p className="p-4 text-sm text-gray-500">Loading…</p>}
            {!loading && items.length === 0 && <p className="p-4 text-sm text-gray-500">No messages.</p>}
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void openMessage(item)}
                className={`w-full text-left p-4 hover:bg-gray-50 ${selectedId === item.id ? 'bg-gray-100' : ''}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-gray-900 truncate">{item.subject}</p>
                  <span className="text-[10px] uppercase tracking-wide font-bold text-gray-500">{item.status}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{item.name} · {item.email}</p>
                <p className="text-xs text-gray-400 mt-1">{formatWhen(item.createdAt)}</p>
              </button>
            ))}
          </div>
          <div className="border-2 border-gray-200 bg-white p-4 sm:p-6 min-h-64">
            {!selected && <p className="text-sm text-gray-500">Select a message to read it.</p>}
            {selected && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wide text-gray-900">{selected.subject}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selected.name} · <a className="underline" href={`mailto:${selected.email}`}>{selected.email}</a>
                    {selected.phone ? <> · <a className="underline" href={`tel:${selected.phone}`}>{selected.phone}</a></> : null}
                  </p>
                  <p className="text-xs text-gray-400">{formatWhen(selected.createdAt)} · {selected.status}</p>
                </div>
                <p className="whitespace-pre-wrap text-gray-800">{selected.message}</p>
                <div className="flex flex-wrap gap-2">
                  {selected.status !== 'closed' && (
                    <button type="button" disabled={saving} onClick={() => void patch(selected.id, { status: 'closed' })} className="px-3 py-2 bg-black text-white text-xs font-bold uppercase">
                      Close
                    </button>
                  )}
                  {selected.status === 'closed' && (
                    <button type="button" disabled={saving} onClick={() => void patch(selected.id, { status: 'read' })} className="px-3 py-2 border-2 border-gray-300 text-xs font-bold uppercase">
                      Reopen
                    </button>
                  )}
                  {selected.status === 'read' && (
                    <button type="button" disabled={saving} onClick={() => void patch(selected.id, { status: 'new' })} className="px-3 py-2 border-2 border-gray-300 text-xs font-bold uppercase">
                      Mark unread
                    </button>
                  )}
                </div>
                {selected.notes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">Notes</h3>
                    {selected.notes.map((itemNote) => (
                      <div key={itemNote.id} className="text-sm border-l-2 border-gray-300 pl-3">
                        <p className="text-xs text-gray-400">{itemNote.by} · {formatWhen(itemNote.at)}</p>
                        <p className="whitespace-pre-wrap">{itemNote.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={3}
                    placeholder="Add an internal note"
                    className="w-full px-3 py-2 border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    disabled={saving || !note.trim()}
                    onClick={() => void patch(selected.id, { note })}
                    className="mt-2 px-3 py-2 bg-black text-white text-xs font-bold uppercase disabled:opacity-50"
                  >
                    Add note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
