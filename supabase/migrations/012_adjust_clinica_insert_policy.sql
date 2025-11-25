-- 012_adjust_clinica_insert_policy.sql
-- Objetivo: garantir que usuários autenticados possam criar clínicas sem violar RLS.
-- Ajustes:
-- 1) Substituir a política de INSERT em public.clinicas para uma versão explícita TO authenticated e WITH CHECK true.

BEGIN;

DROP POLICY IF EXISTS "Clínicas - insert autenticado" ON public.clinicas;

CREATE POLICY "Clínicas - insert autenticado" ON public.clinicas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

COMMIT;
