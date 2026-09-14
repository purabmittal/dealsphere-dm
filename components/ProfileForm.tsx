'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';
import Avatar from './Avatar';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function ProfileForm({ profile }: { profile: Profile }) {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState(profile.name ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("We couldn't upload this photo. Please try again.");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setError('Photo is too large (max 5MB).');
      return;
    }

    setPendingFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleRemovePhoto() {
    setPendingFile(null);
    setAvatarPreview(null);
    setAvatarUrl(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    let finalAvatarUrl = avatarUrl;

    if (pendingFile) {
      const path = `${profile.id}/avatar-${Date.now()}-${pendingFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, pendingFile, { upsert: false });

      if (uploadError) {
        setError("We couldn't upload this photo. Please try again.");
        setSaving(false);
        return;
      }

      const { data: signed } = await supabase.storage
        .from('avatars')
        .createSignedUrl(path, 60 * 60 * 24 * 365); // 1 year

      finalAvatarUrl = signed?.signedUrl ?? null;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ name: name.trim() || null, bio: bio.trim() || null, avatar_url: finalAvatarUrl })
      .eq('id', profile.id);

    setSaving(false);

    if (updateError) {
      setError('Something went wrong. Please try again.');
      return;
    }

    setAvatarUrl(finalAvatarUrl);
    setPendingFile(null);
    setAvatarPreview(null);
    setSuccess(true);
    router.refresh();
  }

  const displayAvatar = avatarPreview ?? avatarUrl;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <Avatar url={displayAvatar} name={name || profile.instagram_username} size={72} />
        <div className="flex flex-col gap-2">
          <label className="cursor-pointer text-sm font-medium text-skyblue-dark">
            Change photo
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          {displayAvatar && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="text-left text-sm text-red-600"
            >
              Remove photo
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-navy">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-navy focus:border-skyblue focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-navy">Instagram Username</label>
        <input
          type="text"
          value={`@${profile.instagram_username}`}
          disabled
          className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-navy/60"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-navy">Short bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="A little about you or what you're looking for"
          className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-navy focus:border-skyblue focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Profile updated.</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-navy py-3 font-semibold text-white transition hover:bg-navy-light disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save Profile'}
      </button>
    </form>
  );
}
