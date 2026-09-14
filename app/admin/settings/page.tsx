import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminHeader from '@/components/AdminHeader';
import Avatar from '@/components/Avatar';

export default async function AdminSettingsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: admins } = await supabase
    .from('profiles')
    .select('id, email, name, avatar_url, instagram_username')
    .eq('role', 'admin')
    .order('created_at', { ascending: true });

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <AdminHeader active="settings" />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h2 className="mb-3 font-semibold text-navy">Team Members</h2>
        <div className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
          {(admins ?? []).map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar url={a.avatar_url} name={a.name ?? a.instagram_username} size={36} />
              <div>
                <p className="font-medium text-navy">{a.name || `@${a.instagram_username}`}</p>
                <p className="text-xs text-navy/50">{a.email}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-navy/50">
          To add a new team member: have them sign up on the site normally, then run this in
          Supabase's SQL Editor with their email — <code>update public.profiles set role =
          'admin' where email = '...';</code>
        </p>
      </div>
    </main>
  );
}
