-- 011_fix_perfis_clinicas_policies.sql
-- Objetivo: permitir bootstrap de tenant/perfil para novos usuários e evitar dependência circular no RLS.
-- Ajustes:
-- 1) Permitir INSERT em clinicas e perfis por usuários autenticados.
-- 2) Corrigir política de SELECT em perfis para usar user_id (evita depender de get_current_clinica_id sem perfil).
-- 3) Ajustar política de SELECT em clinicas para verificar associação via perfis.

BEGIN;

-- 1) CLINICAS: remover política anterior de select e recriar + permitir insert
DROP POLICY IF EXISTS "Clínicas - Acesso de membros" ON public.clinicas;

CREATE POLICY "Clínicas - select por associação" ON public.clinicas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfis p
      WHERE p.user_id = auth.uid() AND p.clinica_id = public.clinicas.id
    )
  );

CREATE POLICY "Clínicas - insert autenticado" ON public.clinicas
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');


-- 2) PERFIS: remover política anterior e recriar select + permitir insert do próprio usuário
DROP POLICY IF EXISTS "Perfis - Acesso baseado na clínica" ON public.perfis;

CREATE POLICY "Perfis - select proprio" ON public.perfis
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Perfis - insert proprio" ON public.perfis
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

COMMIT;
