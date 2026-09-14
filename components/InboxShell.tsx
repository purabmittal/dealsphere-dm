'use client';

import { usePathname } from 'next/navigation';
import InboxConversationList from './InboxConversationList';

export default function InboxShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDetailRoute = pathname !== '/admin/inbox';

  return (
    <div className="flex h-screen">
      <div className={isDetailRoute ? 'hidden sm:flex' : 'flex w-full sm:flex'}>
        <InboxConversationList />
      </div>
      <div className={isDetailRoute ? 'flex flex-1' : 'hidden flex-1 sm:flex'}>{children}</div>
    </div>
  );
}
