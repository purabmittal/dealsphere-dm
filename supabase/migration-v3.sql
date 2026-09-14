-- ============================================================
-- DealSphere DM — v3 Migration
-- Adds a view that powers the new WhatsApp-style admin inbox.
-- SAFE to run on your existing live database — read-only view,
-- adds nothing to existing tables.
-- ============================================================

create or replace view public.conversation_summaries as
select
  c.id as conversation_id,
  c.user_id,
  c.status,
  c.label,
  c.updated_at,
  p.name,
  p.instagram_username,
  p.email,
  p.avatar_url,
  lm.content as last_message_content,
  lm.message_type as last_message_type,
  lm.created_at as last_message_at,
  coalesce(uc.unread_count, 0) as unread_count
from public.conversations c
join public.profiles p on p.id = c.user_id
left join lateral (
  select content, message_type, created_at
  from public.messages m
  where m.conversation_id = c.id
  order by m.created_at desc
  limit 1
) lm on true
left join lateral (
  select count(*) as unread_count
  from public.messages m2
  where m2.conversation_id = c.id
    and m2.read_at is null
    and m2.sender_id = c.user_id
) uc on true;

grant select on public.conversation_summaries to authenticated;

select 'v3 migration complete' as result;
