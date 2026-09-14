import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminHeader from '@/components/AdminHeader';
import ClientList from '@/components/ClientList';

export default async function AdminClientsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profiles } = await supabase
    .from('profiles')
    .select(
      'id, email, instagram_username, name, avatar_url, created_at, conversations(id, label, status)'
    )
    .eq('role', 'visitor')
    .order('created_at', { ascending: false });

  const { data: unreadRows } = await supabase
    .from('messages')
    .select('conversation_id')
    .is('read_at', null)
    .neq('sender_id', user.id);
  const unreadConversationIds = new Set((unreadRows ?? []).map((r) => r.conversation_id));

  const clients = (profiles ?? [])
    .map((p: any) => {
      const conversation = (p.conversations ?? []).find((c: any) => c.status === 'active');
      if (!conversation) return null;
      return {
        conversationId: conversation.id,
        name: p.name,
        instagram_username: p.instagram_username,
        email: p.email,
        avatar_url: p.avatar_url,
        created_at: p.created_at,
        label: conversation.label,
        unread: unreadConversationIds.has(conversation.id),
      };
    })
    .filter((c: any) => c !== null) as {
      conversationId: string;
      name: string | null;
      instagram_username: string;
      email: string;
      avatar_url: string | null;
      created_at: string;
      label: import('@/types/database').ClientLabel;
      unread: boolean;
    }[];

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <AdminHeader active="clients" />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h2 className="mb-3 font-semibold text-navy">All Clients</h2>
        <ClientList clients={clients} />
      </div>
    </main>
  );
}
