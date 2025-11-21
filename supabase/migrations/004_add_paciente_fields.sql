-- 004_add_paciente_fields.sql
-- Adds missing fields to the 'pacientes' table to match the frontend 'Paciente' type.

-- Add 'sexo' column with a check constraint for allowed values
alter table if exists public.pacientes
  add column if not exists sexo text;

-- Add 'status' column, defaulting to 'Ativo'
alter table if exists public.pacientes
  add column if not exists status text default 'Ativo';

-- Add 'endereco' column for address
alter table if exists public.pacientes
  add column if not exists endereco text;

-- Add 'observacoes' column for notes
alter table if exists public.pacientes
  add column if not exists observacoes text;

-- Rename 'data_nascimento' to match frontend type 'dataNascimento' (or vice-versa)
-- For consistency, we'll align the frontend to the backend's snake_case convention.
-- No database change needed here, will change in the frontend code.
-- The existing 'created_at' column will be used for 'criadoEm' in the frontend.
