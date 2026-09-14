'use client';

import { useRef, useState } from 'react';

const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8 MB
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export default function Composer({
  onSendText,
  onSendPhoto,
  onSendFile,
  sending,
}: {
  onSendText: (text: string) => Promise<void>;
  onSendPhoto: (file: File) => Promise<void>;
  onSendFile: (file: File) => Promise<void>;
  sending: boolean;
}) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSend() {
    if (!text.trim()) return;
    await onSendText(text.trim());
    setText('');
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("We couldn't upload this photo. Please try again.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError('Photo is too large (max 8MB).');
      return;
    }

    await onSendPhoto(file);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError(null);

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Only PDF, DOC, and DOCX files are supported.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large (max 15MB).');
      return;
    }

    await onSendFile(file);
  }

  return (
    <div className="border-t border-gray-100 bg-white px-3 py-3">
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <div className="flex items-end gap-2">
        <input
          ref={photoInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={handlePhotoChange}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          disabled={sending}
          aria-label="Send photo"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg"
        >
          📷
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
          aria-label="Send file"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg"
        >
          📎
        </button>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          rows={1}
          className="max-h-28 flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-navy focus:border-skyblue focus:outline-none"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !text.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy text-lg text-white disabled:opacity-40"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
