import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-navy px-6 text-center">
      <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold text-gold">
        DS
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        CONNECT WITH DEALSPHERE
      </h1>
      <p className="mt-3 max-w-sm text-skyblue-light">
        Our private space for conversations, ideas and opportunities.
      </p>

      <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/signup"
          className="w-full rounded-xl bg-gold py-3 text-center font-semibold text-navy-dark transition hover:bg-gold-light"
        >
          CREATE ACCOUNT
        </Link>
        <Link
          href="/login"
          className="w-full rounded-xl border border-white/20 py-3 text-center font-semibold text-white transition hover:bg-white/5"
        >
          LOGIN
        </Link>
      </div>

      <p className="mt-8 max-w-xs text-sm text-white/50">
        Create your account to start a private conversation with our team.
      </p>
    </main>
  );
}
