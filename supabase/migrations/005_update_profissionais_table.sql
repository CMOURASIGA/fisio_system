-- 005_update_profissionais_table.sql
-- Aligns the 'profissionais' table with the frontend 'Profissional' type.

-- Add 'crefito' column for professional registration number
alter table if exists public.profissionais
  add column if not exists crefito text;

-- Add 'funcao' column to store the user's role (e.g., Fisioterapeuta)
alter table if exists public.profissionais
  add column if not exists funcao text;
  
-- Add 'avatar_url' column for profile picture URL
alter table if exists public.profissionais
  add column if not exists avatar_url text;

-- Drop the old 'especialidade' column as 'funcao' is more appropriate
alter table if exists public.profissionais
  drop column if exists especialidade;
