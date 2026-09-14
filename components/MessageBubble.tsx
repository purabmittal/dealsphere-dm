import type { Message } from '@/types/database';

function isUrl(text: string) {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MessageBubble({
  message,
  isOwn,
}: {
  message: Message;
  isOwn: boolean;
}) {
  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
          isOwn
            ? 'rounded-br-sm bg-navy text-white'
            : 'rounded-bl-sm bg-gray-100 text-navy'
        }`}
      >
        {message.message_type === 'image' && message.attachment_url && (
          <a href={message.attachment_url} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.attachment_url}
              alt={message.attachment_name ?? 'Shared photo'}
              style={{ maxWidth: 240, maxHeight: 320 }}
              className="mb-1 w-full rounded-lg object-cover"
            />
          </a>
        )}

        {message.message_type === 'file' && message.attachment_url && (
          <a
            href={message.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`mb-1 flex items-center gap-2 rounded-lg p-2 ${
              isOwn ? 'bg-white/10' : 'bg-white'
            }`}
          >
            <span className="text-xl">📄</span>
            <span className="flex-1 overflow-hidden">
              <span className="block truncate text-sm font-medium">
                {message.attachment_name ?? 'File'}
              </span>
              <span className={`text-xs ${isOwn ? 'text-white/60' : 'text-navy/50'}`}>
                {formatFileSize(message.attachment_size)} · Tap to open
              </span>
            </span>
          </a>
        )}

        {message.content && message.message_type === 'link' ? (
          <a
            href={message.content}
            target="_blank"
            rel="noopener noreferrer"
            className={`block break-all underline ${isOwn ? 'text-skyblue-light' : 'text-skyblue-dark'}`}
          >
            {message.content}
          </a>
        ) : (
          message.content &&
          (isUrl(message.content) ? (
            <a
              href={message.content}
              target="_blank"
              rel="noopener noreferrer"
              className={`block break-all underline ${isOwn ? 'text-skyblue-light' : 'text-skyblue-dark'}`}
            >
              {message.content}
            </a>
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ))
        )}

        <div
          className={`mt-1 text-right text-[10px] ${
            isOwn ? 'text-white/60' : 'text-navy/40'
          }`}
        >
          {time}
          {isOwn && message.read_at ? ' · Read' : ''}
        </div>
      </div>
    </div>
  );
}
