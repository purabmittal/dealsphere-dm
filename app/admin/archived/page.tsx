import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import AdminHeader from '@/components/AdminHeader';
import Avatar from '@/components/Avatar';
import RestoreButton from '@/components/RestoreButton';

export default async function ArchivedPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: archived } = await supabase
    .from('conversations')
    .select('id, archived_at, profiles!inner(instagram_username, name, email, avatar_url)')
    .eq('status', 'archived')
    .order('archived_at', { ascending: false });

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <AdminHeader active="archived" />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h2 className="mb-3 font-semibold text-navy">Archived Conversations</h2>
        <div className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
          {(archived ?? []).map((c: any) => (
            <div key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <Link href={`/admin/chat/${c.id}`} className="flex items-center gap-3">
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
              </Link>
              <RestoreButton conversationId={c.id} />
            </div>
          ))}
          {(archived ?? []).length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-navy/40">
              No archived conversations.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
