-- ============================================================
-- DealSphere DM — Database Schema
-- Run this in Supabase: Dashboard -> SQL Editor -> New Query
-- ============================================================

-- 1. PROFILES (extends Supabase auth.users)
-- We can't add custom columns to auth.users directly, so we
-- keep a "profiles" table with the same id as auth.users.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  instagram_username text not null,
  role text not null default 'visitor' check (role in ('visitor', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. CONVERSATIONS (one per visitor)
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- 3. MESSAGES
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  message_type text not null default 'text' check (message_type in ('text', 'image', 'link')),
  content text,
  attachment_url text,
  attachment_name text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

-- 4. NOTIFICATIONS
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  message_id uuid not null references public.messages(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at);
create index if not exists idx_conversations_user on public.conversations(user_id);
create index if not exists idx_notifications_user on public.notifications(user_id, is_read);

-- ============================================================
-- AUTO-CREATE profile + conversation when a new user signs up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, instagram_username, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'instagram_username', ''),
    'visitor'
  );

  insert into public.conversations (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_conversations_updated_at on public.conversations;
create trigger set_conversations_updated_at before update on public.conversations
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- PROFILES policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- CONVERSATIONS policies
create policy "Users can view their own conversation"
  on public.conversations for select
  using (auth.uid() = user_id or public.is_admin());

-- MESSAGES policies
create policy "Users can view messages in their own conversation"
  on public.messages for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.user_id = auth.uid()
    )
  );

create policy "Users can send messages in their own conversation"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and (
      public.is_admin()
      or exists (
        select 1 from public.conversations c
        where c.id = messages.conversation_id and c.user_id = auth.uid()
      )
    )
  );

create policy "Users can mark messages as read in their own conversation"
  on public.messages for update
  using (
    public.is_admin()
    or exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.user_id = auth.uid()
    )
  );

-- NOTIFICATIONS policies
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id or public.is_admin());

create policy "System can insert notifications"
  on public.notifications for insert
  with check (true);

-- ============================================================
-- REALTIME
-- ============================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
