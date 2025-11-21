-- sync_profiles.sql
-- Run this in Supabase SQL Editor to sync existing auth.users into public.profiles

-- Optional: inspect available columns in auth.users
-- SELECT column_name FROM information_schema.columns WHERE table_schema = 'auth' AND table_name = 'users';

-- Idempotent sync using raw_user_meta_data (common in Supabase). Avoid referencing columns that may not exist.
INSERT INTO public.profiles (id, full_name, avatar_url, created_at)
SELECT
  u.id,
  COALESCE(
    NULLIF(u.raw_user_meta_data->>'full_name',''),
    NULLIF(u.raw_user_meta_data->>'name',''),
    u.email
  ) AS full_name,
  NULLIF(u.raw_user_meta_data->>'avatar_url','') AS avatar_url,
  now()
FROM auth.users u
ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      avatar_url = EXCLUDED.avatar_url;

-- Verify result
-- SELECT id, full_name, avatar_url, created_at FROM public.profiles LIMIT 50;
