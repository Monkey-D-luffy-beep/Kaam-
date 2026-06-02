-- ============================================================
-- KAAM - Migration 003: Fix Profiles
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Allow users to insert their own profile (for resilient upsert in app code)
create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- 2. Backfill profiles for any auth users who signed up before migration 001
insert into public.profiles (id, email, full_name, avatar_url)
select
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name',
  au.raw_user_meta_data->>'avatar_url'
from auth.users au
left join public.profiles p on p.id = au.id
where p.id is null
on conflict (id) do nothing;
