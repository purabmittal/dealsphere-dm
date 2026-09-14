import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminHeader from '@/components/AdminHeader';
import Avatar from '@/components/Avatar';
import { CLIENT_LABELS } from '@/types/database';

export default async function AdminDashboard() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { count: totalClients } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'visitor');

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: newClients } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'visitor')
    .gte('created_at', sevenDaysAgo);

  const { data: unreadRows } = await supabase
    .from('messages')
    .select('conversation_id')
    .is('read_at', null)
    .neq('sender_id', user.id);
  const unreadConversations = new Set((unreadRows ?? []).map((r) => r.conversation_id)).size;

  const { count: activeConversations } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: archivedConversations } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'archived');

  const { data: recent } = await supabase
    .from('conversations')
    .select('id, updated_at, label, profiles!inner(instagram_username, name, email, avatar_url)')
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(8);

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <AdminHeader active="dashboard" />

      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard label="Total Clients" value={totalClients ?? 0} />
          <StatCard label="Unread" value={unreadConversations} />
          <StatCard label="Active" value={activeConversations ?? 0} />
          <StatCard label="New (7d)" value={newClients ?? 0} />
          <StatCard label="Archived" value={archivedConversations ?? 0} />
        </div>

        <h2 className="mb-3 mt-8 font-semibold text-navy">Recent Conversations</h2>
        <div className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
          {(recent ?? []).map((c: any) => {
            const labelDisplay =
              CLIENT_LABELS.find((l) => l.value === c.label)?.display ?? c.label;
            return (
              <Link
                key={c.id}
                href={`/admin/chat/${c.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    url={c.profiles.avatar_url}
                    name={c.profiles.name ?? c.profiles.instagram_username}
                    size={36}
                  />
                  <div>
                    <p className="font-medium text-navy">
                      {c.profiles.name || `@${c.profiles.instagram_username}`}
                    </p>
                    <p className="text-xs text-navy/50">{c.profiles.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-skyblue/10 px-2 py-0.5 text-[10px] font-medium text-skyblue-dark">
                    {labelDisplay}
                  </span>
                  <p className="mt-1 text-xs text-navy/40">
                    {new Date(c.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            );
          })}
          {(recent ?? []).length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-navy/40">
              No conversations yet.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-2xl font-bold text-navy">{value}</p>
      <p className="mt-1 text-xs text-navy/50">{label}</p>
    </div>
  );
}
