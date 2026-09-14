import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import InboxShell from '@/components/InboxShell';

export default async function InboxLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return <InboxShell>{children}</InboxShell>;
}
