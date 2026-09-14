-- ============================================================
-- DealSphere DM — v2 Storage Migration
-- Run AFTER migration-v2.sql
-- ============================================================

-- Avatars bucket (private — served via short-lived signed URLs)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 5242880, array['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Chat files bucket (PDF/DOC/DOCX)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-files',
  'chat-files',
  false,
  15728640, -- 15 MB
  array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do nothing;

-- Avatars: a user can upload/view only inside their own folder ({user_id}/...)
-- Admins can view any avatar (needed for the admin client list/inbox).
drop policy if exists "Users upload their own avatar" on storage.objects;
create policy "Users upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users update their own avatar" on storage.objects;
create policy "Users update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Avatars viewable by owner or admin" on storage.objects;
create policy "Avatars viewable by owner or admin"
  on storage.objects for select
  using (
    bucket_id = 'avatars'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- Chat files: same folder-per-conversation rule as chat-photos
drop policy if exists "Users can upload files to their own conversation folder" on storage.objects;
create policy "Users can upload files to their own conversation folder"
  on storage.objects for insert
  with check (
    bucket_id = 'chat-files'
    and (
      public.is_admin()
      or exists (
        select 1 from public.conversations c
        where c.user_id = auth.uid()
          and c.id::text = (storage.foldername(name))[1]
      )
    )
  );

drop policy if exists "Users can view files in their own conversation folder" on storage.objects;
create policy "Users can view files in their own conversation folder"
  on storage.objects for select
  using (
    bucket_id = 'chat-files'
    and (
      public.is_admin()
      or exists (
        select 1 from public.conversations c
        where c.user_id = auth.uid()
          and c.id::text = (storage.foldername(name))[1]
      )
    )
  );

select 'Storage migration complete' as result;
