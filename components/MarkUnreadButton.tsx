'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function MarkUnreadButton({
  conversationId,
  clientId,
}: {
  conversationId: string;
  clientId: string;
}) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleMarkUnread() {
    setLoading(true);

    const { data: lastClientMessage } = await supabase
      .from('messages')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('sender_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastClientMessage) {
      await supabase.from('messages').update({ read_at: null }).eq('id', lastClientMessage.id);
    }

    setLoading(false);
  }

  return (
    <button
      onClick={handleMarkUnread}
      disabled={loading}
      className="text-sm font-medium text-navy/60 hover:text-navy disabled:opacity-50"
    >
      Mark unread
    </button>
  );
}
