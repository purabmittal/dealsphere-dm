'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: `ds-${password}`,
    });

    setLoading(false);

    if (signInError) {
      setError('Incorrect email or password.');
      return;
    }

    router.push('/chat');
  }

  return (
    <main className="flex min-h-screen flex-col justify-center bg-white px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-bold text-navy">Log In</h1>
        <p className="mt-1 text-sm text-navy/60">Welcome back to DealSphere.</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-navy">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-navy focus:border-skyblue focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-navy">Password</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit password"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 tracking-widest text-navy focus:border-skyblue focus:outline-none"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-navy py-3 font-semibold text-white transition hover:bg-navy-light disabled:opacity-60"
          >
            {loading ? 'Logging in…' : 'LOGIN'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-navy/60">
          New here?{' '}
          <Link href="/signup" className="font-medium text-skyblue-dark">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
