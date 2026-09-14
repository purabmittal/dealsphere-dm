import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileForm from '@/components/ProfileForm';

export default async function ProfilePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  return (
    <main className="min-h-screen bg-white px-6 py-6">
      <div className="mx-auto max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/chat" className="text-navy/50">
            ←
          </Link>
          <h1 className="text-xl font-bold text-navy">Your Profile</h1>
        </div>

        <ProfileForm profile={profile} />
      </div>
    </main>
  );
}
