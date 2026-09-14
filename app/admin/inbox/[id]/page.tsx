import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ChatWindow from '@/components/ChatWindow';
import Avatar from '@/components/Avatar';
import LabelSelect from '@/components/LabelSelect';
import NotesPanel from '@/components/NotesPanel';
import ArchiveButton from '@/components/ArchiveButton';
import MarkUnreadButton from '@/components/MarkUnreadButton';
import InfoDrawer from '@/components/InfoDrawer';

export default async function InboxConversationPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: conversation } = await supabase
    .from('conversations')
    .select(
      'id, label, user_id, profiles!inner(id, instagram_username, name, email, avatar_url, bio, created_at)'
    )
    .eq('id', params.id)
    .single();

  if (!conversation) notFound();

  const profile = (conversation as any).profiles;

  const { data: notes } = await supabase
    .from('admin_notes')
    .select('*')
    .eq('client_id', profile.id)
    .order('created_at', { ascending: false });

  return (
    <div className="flex flex-1 flex-col bg-white">
      <header className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/inbox" className="text-navy/50 sm:hidden">
            ←
          </Link>
          <Avatar url={profile.avatar_url} name={profile.name ?? profile.instagram_username} size={36} />
          <div>
            <h1 className="font-semibold text-navy">
              {profile.name || `@${profile.instagram_username}`}
            </h1>
            <p className="text-xs text-navy/50">@{profile.instagram_username}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MarkUnreadButton conversationId={conversation.id} clientId={profile.id} />
          <InfoDrawer>
            <ClientInfoContent
              profile={profile}
              conversationId={conversation.id}
              label={(conversation as any).label}
              adminId={user.id}
              notes={notes ?? []}
            />
          </InfoDrawer>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ChatWindow
          conversationId={conversation.id}
          currentUserId={user.id}
          emptyStateTitle="No messages yet."
          emptyStateSubtitle="Send the first message to this client."
        />
      </div>
    </div>
  );
}

function ClientInfoContent({
  profile,
  conversationId,
  label,
  adminId,
  notes,
}: {
  profile: any;
  conversationId: string;
  label: any;
  adminId: string;
  notes: any[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <Avatar url={profile.avatar_url} name={profile.name ?? profile.instagram_username} size={64} />
        <p className="font-semibold text-navy">{profile.name || `@${profile.instagram_username}`}</p>
        <p className="text-xs text-navy/50">@{profile.instagram_username}</p>
        <p className="text-xs text-navy/50">{profile.email}</p>
      </div>

      {profile.bio && <p className="text-sm text-navy/70">{profile.bio}</p>}

      <div className="text-xs text-navy/50">
        Joined {new Date(profile.created_at).toLocaleDateString()}
      </div>

      <LabelSelect conversationId={conversationId} initialLabel={label} />

      <NotesPanel clientId={profile.id} adminId={adminId} initialNotes={notes} />

      <ArchiveButton conversationId={conversationId} redirectTo="/admin/inbox" />
    </div>
  );
}
