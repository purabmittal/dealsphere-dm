'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import MessageBubble from './MessageBubble';
import Composer from './Composer';

export default function ChatWindow({
  conversationId,
  currentUserId,
  emptyStateTitle = 'Start a conversation with DealSphere.',
  emptyStateSubtitle = 'Share your idea, question or opportunity with our team.',
}: {
  conversationId: string;
  currentUserId: string;
  emptyStateTitle?: string;
  emptyStateSubtitle?: string;
}) {
  const supabase = createClient();
  const { messages, loading } = useRealtimeMessages(conversationId);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Mark incoming messages as read while this window is open
  useEffect(() => {
    const unread = messages.filter(
      (m) => m.sender_id !== currentUserId && !m.read_at
    );
    if (unread.length === 0) return;

    supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .in(
        'id',
        unread.map((m) => m.id)
      )
      .then(() => {});
  }, [messages, currentUserId]);

  async function sendText(text: string) {
    setSending(true);
    const urlPattern = /^(https?:\/\/[^\s]+)$/i;
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      message_type: urlPattern.test(text) ? 'link' : 'text',
      content: text,
    });
    setSending(false);
  }

  async function sendPhoto(file: File) {
    setSending(true);
    const path = `${conversationId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-photos')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      setSending(false);
      return;
    }

    const { data: signed } = await supabase.storage
      .from('chat-photos')
      .createSignedUrl(path, 60 * 60 * 24 * 7); // 7-day signed URL

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      message_type: 'image',
      attachment_url: signed?.signedUrl ?? null,
      attachment_name: file.name,
      attachment_size: file.size,
    });

    setSending(false);
  }

  async function sendFile(file: File) {
    setSending(true);
    const path = `${conversationId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-files')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      setSending(false);
      return;
    }

    const { data: signed } = await supabase.storage
      .from('chat-files')
      .createSignedUrl(path, 60 * 60 * 24 * 7); // 7-day signed URL

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      message_type: 'file',
      attachment_url: signed?.signedUrl ?? null,
      attachment_name: file.name,
      attachment_size: file.size,
    });

    setSending(false);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {loading ? (
          <p className="text-center text-sm text-navy/40">Loading…</p>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="font-medium text-navy">{emptyStateTitle}</p>
            <p className="mt-1 max-w-xs text-sm text-navy/50">{emptyStateSubtitle}</p>
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble key={m.id} message={m} isOwn={m.sender_id === currentUserId} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <Composer onSendText={sendText} onSendPhoto={sendPhoto} onSendFile={sendFile} sending={sending} />
    </div>
  );
}
