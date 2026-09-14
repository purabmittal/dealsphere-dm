import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ChatWindow from '@/components/ChatWindow';

// Note: the [userId] segment holds the CONVERSATION id (kept generic
// here to match the /admin/chat/:id link pattern used across admin pages).
export default async function AdminChatPage({ params }: { params: { userId: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: conversation } = await supabase
    .from('conversations')
    .select('id, profiles!inner(instagram_username, email)')
    .eq('id', params.userId)
    .single();

  if (!conversation) notFound();

  const profile = (conversation as any).profiles;

  return (
    <main className="flex h-screen flex-col bg-white">
      <header className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
        <Link href="/admin/users" className="text-navy/50">
          ←
        </Link>
        <div>
          <h1 className="font-semibold text-navy">@{profile.instagram_username}</h1>
          <p className="text-xs text-navy/50">{profile.email}</p>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ChatWindow
          conversationId={conversation.id}
          currentUserId={user.id}
          emptyStateTitle="No messages yet."
          emptyStateSubtitle="Send the first message to this visitor."
        />
      </div>
    </main>
  );
}
