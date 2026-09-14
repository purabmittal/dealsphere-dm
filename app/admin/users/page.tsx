import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminHeader } from '../page';

export default async function AdminUsersPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, instagram_username, created_at, conversations(id, updated_at)')
    .eq('role', 'visitor')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <AdminHeader active="users" />

      <div className="mx-auto max-w-4xl px-4 py-6">
        <h2 className="mb-3 font-semibold text-navy">All Visitors</h2>
        <div className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
          {(users ?? []).map((u: any) => {
            const conversationId = u.conversations?.[0]?.id;
            return (
              <Link
                key={u.id}
                href={conversationId ? `/admin/chat/${conversationId}` : '#'}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-navy">@{u.instagram_username}</p>
                  <p className="text-xs text-navy/50">{u.email}</p>
                </div>
                <span className="text-xs text-navy/40">
                  Joined {new Date(u.created_at).toLocaleDateString()}
                </span>
              </Link>
            );
          })}
          {(users ?? []).length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-navy/40">No visitors yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
