-- 008_update_atendimentos_table.sql
-- Aligns the 'atendimentos' table with the frontend 'Atendimento' type.

-- Rename 'data' to 'data_hora' for clarity
ALTER TABLE public.atendimentos
RENAME COLUMN data TO data_hora;

-- Add columns that exist in the frontend type but not in the table
ALTER TABLE public.atendimentos
  ADD COLUMN IF NOT EXISTS local TEXT,
  ADD COLUMN IF NOT EXISTS tipo TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS observacoes TEXT,
  ADD COLUMN IF NOT EXISTS sinais_vitais JSONB,
  ADD COLUMN IF NOT EXISTS soap JSONB;

-- Drop old columns that are now replaced by JSONB fields
ALTER TABLE public.atendimentos
  DROP COLUMN IF EXISTS duracao_minutes,
  DROP COLUMN IF EXISTS anotacoes;

-- Make sure RLS is enabled
ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;
