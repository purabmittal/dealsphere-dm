import Link from 'next/link';
import LogoutButton from './LogoutButton';

export default function AdminHeader({ active }: { active: 'dashboard' | 'users' }) {
  return (
    <header className="border-b border-gray-100 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <div>
          <h1 className="font-semibold text-navy">DealSphere Admin</h1>
          <nav className="mt-1 flex gap-4 text-sm">
            <Link
              href="/admin"
              className={active === 'dashboard' ? 'font-medium text-skyblue-dark' : 'text-navy/50'}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className={active === 'users' ? 'font-medium text-skyblue-dark' : 'text-navy/50'}
            >
              Users
            </Link>
          </nav>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}


