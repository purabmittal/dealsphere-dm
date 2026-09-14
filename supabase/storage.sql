-- ============================================================
-- DealSphere DM — Storage setup
-- Run AFTER schema.sql, in Supabase SQL Editor
-- ============================================================

-- Create a private bucket for chat photos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-photos',
  'chat-photos',
  false,
  8388608, -- 8 MB
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Files are stored under a path like: {conversation_id}/{filename}
-- A visitor may only upload/read files inside their OWN conversation's folder.
-- Admins may read/upload to any conversation folder.

create policy "Users can upload photos to their own conversation folder"
  on storage.objects for insert
  with check (
    bucket_id = 'chat-photos'
    and (
      public.is_admin()
      or exists (
        select 1 from public.conversations c
        where c.user_id = auth.uid()
          and c.id::text = (storage.foldername(name))[1]
      )
    )
  );

create policy "Users can view photos in their own conversation folder"
  on storage.objects for select
  using (
    bucket_id = 'chat-photos'
    and (
      public.is_admin()
      or exists (
        select 1 from public.conversations c
        where c.user_id = auth.uid()
          and c.id::text = (storage.foldername(name))[1]
      )
    )
  );
