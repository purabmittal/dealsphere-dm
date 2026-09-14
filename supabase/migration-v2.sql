-- ============================================================
-- DealSphere DM — v2 Migration
-- SAFE to run on your existing live database.
-- Adds new columns/tables without touching existing data.
-- Run in Supabase: Dashboard -> SQL Editor -> New Query
-- ============================================================

-- 1. Extend profiles: name, avatar, bio, last_active_at
alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists last_active_at timestamptz;

-- 2. Extend conversations: status/label + archiving
alter table public.conversations add column if not exists status text not null default 'active';
alter table public.conversations add column if not exists label text not null default 'new_lead';
alter table public.conversations add column if not exists archived_at timestamptz;

-- Keep labels to a known safe set
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'conversations_label_check'
  ) then
    alter table public.conversations
      add constraint conversations_label_check
      check (label in ('new_lead', 'interested', 'follow_up', 'potential_partner', 'client', 'completed', 'not_interested'));
  end if;
end $$;

-- 3. Extend messages: file support + size, allow 'file' type
alter table public.messages add column if not exists attachment_size bigint;

do $$
begin
  alter table public.messages drop constraint if exists messages_message_type_check;
  alter table public.messages
    add constraint messages_message_type_check
    check (message_type in ('text', 'image', 'file', 'link'));
end $$;

-- 4. Admin notes (internal only — never exposed to clients)
create table if not exists public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  admin_id uuid not null references public.profiles(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_admin_notes_client on public.admin_notes(client_id, created_at);

alter table public.admin_notes enable row level security;

drop policy if exists "Only admins can view notes" on public.admin_notes;
create policy "Only admins can view notes"
  on public.admin_notes for select
  using (public.is_admin());

drop policy if exists "Only admins can add notes" on public.admin_notes;
create policy "Only admins can add notes"
  on public.admin_notes for insert
  with check (public.is_admin() and admin_id = auth.uid());

drop policy if exists "Only admins can edit notes" on public.admin_notes;
create policy "Only admins can edit notes"
  on public.admin_notes for update
  using (public.is_admin());

drop trigger if exists set_admin_notes_updated_at on public.admin_notes;
create trigger set_admin_notes_updated_at before update on public.admin_notes
  for each row execute procedure public.set_updated_at();

-- 5. Realtime for admin_notes not needed (internal, low-frequency) — skip.

select 'Migration complete' as result;
