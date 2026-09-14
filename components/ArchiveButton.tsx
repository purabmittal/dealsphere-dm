'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ArchiveButton({
  conversationId,
  redirectTo = '/admin/clients',
}: {
  conversationId: string;
  redirectTo?: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleArchive() {
    setLoading(true);
    await supabase
      .from('conversations')
      .update({ status: 'archived', archived_at: new Date().toISOString() })
      .eq('id', conversationId);
    setLoading(false);
    router.push(redirectTo);
  }

  return (
    <button
      onClick={handleArchive}
      disabled={loading}
      className="w-full rounded-xl border border-gray-200 py-2 text-sm font-medium text-navy disabled:opacity-50"
    >
      {loading ? 'Archiving…' : 'Archive Conversation'}
    </button>
  );
}
