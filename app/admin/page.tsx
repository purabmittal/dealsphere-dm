import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LogoutButton from '@/components/LogoutButton';

export default async function AdminDashboard() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'visitor');

  const { data: unreadRows } = await supabase
    .from('messages')
    .select('conversation_id')
    .is('read_at', null)
    .neq('sender_id', user.id);

  const unreadConversations = new Set((unreadRows ?? []).map((r) => r.conversation_id)).size;

  const { data: recent } = await supabase
    .from('conversations')
    .select('id, updated_at, profiles!inner(instagram_username, email)')
    .order('updated_at', { ascending: false })
    .limit(8);

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <AdminHeader active="dashboard" />

      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Total Users" value={totalUsers ?? 0} />
          <StatCard label="Unread Conversations" value={unreadConversations} />
          <StatCard label="Active Conversations" value={recent?.length ?? 0} />
        </div>

        <h2 className="mb-3 mt-8 font-semibold text-navy">Recent Conversations</h2>
        <div className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
          {(recent ?? []).map((c: any) => (
            <Link
              key={c.id}
              href={`/admin/chat/${c.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-navy">@{c.profiles.instagram_username}</p>
                <p className="text-xs text-navy/50">{c.profiles.email}</p>
              </div>
              <span className="text-xs text-navy/40">
                {new Date(c.updated_at).toLocaleDateString()}
              </span>
            </Link>
          ))}
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

export function AdminHeader({ active }: { active: 'dashboard' | 'users' }) {
  return (
    <header className="border-b border-gray-100 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <div>
          <h1 className="font-semibold text-navy">DealSphere Admin</h1>
          <nav className="mt-1 flex gap-4 text-sm">
            <Link
              href="/admin"
              className={active === 'dashboard' ? 'font-medium text-skyblue-dark' : 'text-navy/50'}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className={active === 'users' ? 'font-medium text-skyblue-dark' : 'text-navy/50'}
            >
              Users
            </Link>
          </nav>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
