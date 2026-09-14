-- ============================================================
-- Run this AFTER a team member has signed up normally through
-- the website. Replace the email below with theirs, then run
-- this in the Supabase SQL Editor to make them an admin.
-- Repeat once per team member.
-- ============================================================
update public.profiles
set role = 'admin'
where email = 'teammate@example.com';
