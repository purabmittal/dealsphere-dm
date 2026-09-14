'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RestoreButton({ conversationId }: { conversationId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRestore() {
    setLoading(true);
    await supabase
      .from('conversations')
      .update({ status: 'active', archived_at: null })
      .eq('id', conversationId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleRestore}
      disabled={loading}
      className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-navy disabled:opacity-50"
    >
      {loading ? 'Restoring…' : 'Restore'}
    </button>
  );
}
