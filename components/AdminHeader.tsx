import Link from 'next/link';
import LogoutButton from './LogoutButton';

export default function AdminHeader({
  active,
}: {
  active: 'dashboard' | 'clients' | 'archived' | 'settings';
}) {
  return (
    <header className="border-b border-gray-100 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div>
          <h1 className="font-semibold text-navy">DealSphere Admin</h1>
          <nav className="mt-1 flex gap-4 overflow-x-auto text-sm">
            <Link
              href="/admin"
              className={
                active === 'dashboard'
                  ? 'whitespace-nowrap font-medium text-skyblue-dark'
                  : 'whitespace-nowrap text-navy/50'
              }
            >
              Dashboard
            </Link>
            <Link
              href="/admin/clients"
              className={
                active === 'clients'
                  ? 'whitespace-nowrap font-medium text-skyblue-dark'
                  : 'whitespace-nowrap text-navy/50'
              }
            >
              All Clients
            </Link>
            <Link
              href="/admin/archived"
              className={
                active === 'archived'
                  ? 'whitespace-nowrap font-medium text-skyblue-dark'
                  : 'whitespace-nowrap text-navy/50'
              }
            >
              Archived
            </Link>
            <Link
              href="/admin/settings"
              className={
                active === 'settings'
                  ? 'whitespace-nowrap font-medium text-skyblue-dark'
                  : 'whitespace-nowrap text-navy/50'
              }
            >
              Settings
            </Link>
          </nav>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
