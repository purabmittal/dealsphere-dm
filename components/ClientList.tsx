'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Avatar from './Avatar';
import { CLIENT_LABELS, type ClientLabel } from '@/types/database';

type ClientRow = {
  conversationId: string;
  name: string | null;
  instagram_username: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  label: ClientLabel;
  unread: boolean;
};

export default function ClientList({ clients }: { clients: ClientRow[] }) {
  const [query, setQuery] = useState('');
  const [labelFilter, setLabelFilter] = useState<'all' | ClientLabel>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter((c) => {
      const matchesQuery =
        !q ||
        (c.name ?? '').toLowerCase().includes(q) ||
        c.instagram_username.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);
      const matchesLabel = labelFilter === 'all' || c.label === labelFilter;
      const matchesUnread = !unreadOnly || c.unread;
      return matchesQuery && matchesLabel && matchesUnread;
    });
  }, [clients, query, labelFilter, unreadOnly]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, Instagram, or email"
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-navy focus:border-skyblue focus:outline-none"
        />
        <select
          value={labelFilter}
          onChange={(e) => setLabelFilter(e.target.value as any)}
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-navy focus:border-skyblue focus:outline-none"
        >
          <option value="all">All Labels</option>
          {CLIENT_LABELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.display}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setUnreadOnly((v) => !v)}
          className={`rounded-xl border px-3 py-2.5 text-sm font-medium ${
            unreadOnly
              ? 'border-navy bg-navy text-white'
              : 'border-gray-200 text-navy'
          }`}
        >
          Unread only
        </button>
      </div>

      <div className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
        {filtered.map((c) => {
          const labelDisplay = CLIENT_LABELS.find((l) => l.value === c.label)?.display;
          return (
            <Link
              key={c.conversationId}
              href={`/admin/chat/${c.conversationId}`}
              className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Avatar url={c.avatar_url} name={c.name ?? c.instagram_username} size={40} />
                <div>
                  <p className="flex items-center gap-2 font-medium text-navy">
                    {c.name || `@${c.instagram_username}`}
                    {c.unread && <span className="h-2 w-2 rounded-full bg-gold" />}
                  </p>
                  <p className="text-xs text-navy/50">{c.email}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-skyblue/10 px-2 py-0.5 text-[10px] font-medium text-skyblue-dark">
                  {labelDisplay}
                </span>
                <p className="mt-1 text-xs text-navy/40">
                  Joined {new Date(c.created_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-navy/40">No clients match.</p>
        )}
      </div>
    </div>
  );
}
