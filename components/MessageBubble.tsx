import type { Message } from '@/types/database';

function isUrl(text: string) {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
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
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.attachment_url}
            alt={message.attachment_name ?? 'Shared photo'}
            className="mb-1 max-h-64 w-full rounded-lg object-cover"
          />
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
