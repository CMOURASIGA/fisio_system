-- 013_fix_clinicas_insert_rls.sql
-- Objetivo: garantir que qualquer sessão autenticada consiga inserir em public.clinicas.
-- Ajuste: recria a policy de INSERT permitindo papel public, mas exigindo auth.uid() não nulo.

BEGIN;

DROP POLICY IF EXISTS "Clínicas - insert autenticado" ON public.clinicas;

CREATE POLICY "Clínicas - insert autenticado" ON public.clinicas
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() IS NOT NULL);

COMMIT;
