import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ChatWindow from '@/components/ChatWindow';
import LogoutButton from '@/components/LogoutButton';

export default async function ChatPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: conversation } = await supabase
    .from('conversations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!conversation) {
    // Should not happen (auto-created on signup), but guard anyway.
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
        <p className="text-navy/60">Something went wrong. Please try again.</p>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <h1 className="font-semibold text-navy">DealSphere</h1>
          <p className="text-xs text-navy/50">Private Conversation</p>
        </div>
        <LogoutButton />
      </header>

      <div className="flex-1 overflow-hidden">
        <ChatWindow conversationId={conversation.id} currentUserId={user.id} />
      </div>
    </main>
  );
}
