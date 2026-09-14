'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AdminNote } from '@/types/database';

export default function NotesPanel({
  clientId,
  adminId,
  initialNotes,
}: {
  clientId: string;
  adminId: string;
  initialNotes: AdminNote[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!text.trim()) return;
    setSaving(true);

    const { data, error } = await supabase
      .from('admin_notes')
      .insert({ client_id: clientId, admin_id: adminId, note: text.trim() })
      .select()
      .single();

    setSaving(false);

    if (!error && data) {
      setNotes((prev) => [data as AdminNote, ...prev]);
      setText('');
      router.refresh();
    }
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-navy/60">
        Internal Notes (never shown to client)
      </label>
      <div className="mb-2 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a note…"
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-navy focus:border-skyblue focus:outline-none"
        />
        <button
          onClick={handleAdd}
          disabled={saving || !text.trim()}
          className="rounded-xl bg-navy px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Add
        </button>
      </div>
      <div className="max-h-48 space-y-2 overflow-y-auto">
        {notes.map((n) => (
          <div key={n.id} className="rounded-lg bg-gray-50 p-2 text-xs text-navy/80">
            <p>{n.note}</p>
            <p className="mt-1 text-navy/40">{new Date(n.created_at).toLocaleString()}</p>
          </div>
        ))}
        {notes.length === 0 && <p className="text-xs text-navy/40">No notes yet.</p>}
      </div>
    </div>
  );
}
