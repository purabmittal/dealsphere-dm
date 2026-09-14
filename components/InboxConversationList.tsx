'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Avatar from './Avatar';

type Summary = {
  conversation_id: string;
  status: 'active' | 'archived';
  label: string;
  updated_at: string;
  name: string | null;
  instagram_username: string;
  email: string;
  avatar_url: string | null;
  last_message_content: string | null;
  last_message_type: 'text' | 'image' | 'file' | 'link' | null;
  last_message_at: string | null;
  unread_count: number;
};

function lastMessagePreview(s: Summary) {
  if (!s.last_message_type) return 'No messages yet';
  if (s.last_message_type === 'image') return '📷 Photo';
  if (s.last_message_type === 'file') return `📎 ${s.last_message_content ?? 'Document'}`;
  if (s.last_message_type === 'link') return '🔗 Link';
  return s.last_message_content ?? '';
}

function relativeTime(iso: string | null) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function InboxConversationList() {
  const supabase = createClient();
  const pathname = usePathname();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'unread' | 'active' | 'archived'>('active');

  async function fetchSummaries() {
    const { data } = await supabase
      .from('conversation_summaries')
      .select('*')
      .order('last_message_at', { ascending: false, nullsFirst: false });
    setSummaries((data as Summary[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchSummaries();

    const channel = supabase
      .channel('inbox-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchSummaries();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        fetchSummaries();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return summaries.filter((s) => {
      const matchesQuery =
        !q ||
        (s.name ?? '').toLowerCase().includes(q) ||
        s.instagram_username.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);

      const matchesTab =
        tab === 'all'
          ? true
          : tab === 'unread'
          ? s.unread_count > 0
          : tab === 'active'
          ? s.status === 'active'
          : s.status === 'archived';

      return matchesQuery && matchesTab;
    });
  }, [summaries, query, tab]);

  return (
    <div className="flex h-full w-full flex-col border-r border-gray-100 bg-white sm:w-80 sm:shrink-0">
      <div className="border-b border-gray-100 px-4 py-3">
        <h1 className="font-semibold text-navy">DealSphere</h1>
        <p className="text-xs text-navy/50">Inbox</p>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search conversations"
          className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-navy focus:border-skyblue focus:outline-none"
        />
        <div className="mt-2 flex gap-2 overflow-x-auto text-xs">
          {(['all', 'unread', 'active', 'archived'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-full px-3 py-1 font-medium ${
                tab === t ? 'bg-navy text-white' : 'bg-gray-100 text-navy/60'
              }`}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="p-4 text-center text-sm text-navy/40">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-4 text-center text-sm text-navy/40">No conversations.</p>
        ) : (
          filtered.map((s) => {
            const isActive = pathname === `/admin/inbox/${s.conversation_id}`;
            return (
              <Link
                key={s.conversation_id}
                href={`/admin/inbox/${s.conversation_id}`}
                className={`flex items-center gap-3 border-b border-gray-50 px-4 py-3 ${
                  isActive ? 'bg-skyblue/10' : 'hover:bg-gray-50'
                }`}
              >
                <Avatar url={s.avatar_url} name={s.name ?? s.instagram_username} size={44} />
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="truncate font-medium text-navy">
                      {s.name || `@${s.instagram_username}`}
                    </p>
                    <span className="ml-2 shrink-0 text-[10px] text-navy/40">
                      {relativeTime(s.last_message_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="truncate text-xs text-navy/50">{lastMessagePreview(s)}</p>
                    {s.unread_count > 0 && (
                      <span className="ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-gold px-1.5 text-[10px] font-semibold text-navy-dark">
                        {s.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
