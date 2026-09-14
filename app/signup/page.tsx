'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanInstagram = instagram.trim().replace(/^@/, '');
    const isSixDigits = /^[0-9]{6}$/.test(password);

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!cleanInstagram) {
      setError('Please enter your Instagram username.');
      return;
    }
    if (!isSixDigits) {
      setError('Password must be exactly 6 digits.');
      return;
    }

    setLoading(true);

    // Supabase requires a min password length; we pad the 6-digit
    // code internally so the user only ever sees/types 6 digits.
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: `ds-${password}`,
      options: {
        data: { instagram_username: cleanInstagram },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError('Something went wrong. Please try again.');
      return;
    }

    router.push('/chat');
  }

  return (
    <main className="flex min-h-screen flex-col justify-center bg-white px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-bold text-navy">Create Account</h1>
        <p className="mt-1 text-sm text-navy/60">
          Just a few details to start your private conversation.
        </p>

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
            <label className="mb-1 block text-sm font-medium text-navy">
              Instagram Username
            </label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@yourusername"
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
            {loading ? 'Creating account…' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-navy/60">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-skyblue-dark">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
