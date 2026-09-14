'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CLIENT_LABELS, type ClientLabel } from '@/types/database';

export default function LabelSelect({
  conversationId,
  initialLabel,
}: {
  conversationId: string;
  initialLabel: ClientLabel;
}) {
  const supabase = createClient();
  const [label, setLabel] = useState(initialLabel);
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newLabel = e.target.value as ClientLabel;
    setLabel(newLabel);
    setSaving(true);
    await supabase.from('conversations').update({ label: newLabel }).eq('id', conversationId);
    setSaving(false);
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-navy/60">Status / Label</label>
      <select
        value={label}
        onChange={handleChange}
        disabled={saving}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-navy focus:border-skyblue focus:outline-none"
      >
        {CLIENT_LABELS.map((l) => (
          <option key={l.value} value={l.value}>
            {l.display}
          </option>
        ))}
      </select>
    </div>
  );
}
