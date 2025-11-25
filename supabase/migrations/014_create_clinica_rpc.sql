-- 014_create_clinica_rpc.sql
-- Objetivo: permitir criação de clínica vinculada ao usuário autenticado via RPC segura.
-- Ajustes:
-- 1) Recria a policy de INSERT em public.clinicas restrita ao papel authenticated.
-- 2) Cria função create_clinica_with_profile(p_nome TEXT) que:
--    - exige auth.uid() não nulo
--    - cria a clínica
--    - cria (ou mantém) o perfil do usuário com role admin para a nova clínica
--    - retorna a linha da clínica

BEGIN;

-- Recria política de insert, restrita a authenticated
DROP POLICY IF EXISTS "Clínicas - insert autenticado" ON public.clinicas;
CREATE POLICY "Clínicas - insert autenticado" ON public.clinicas
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Função RPC para criar clínica + perfil atomico
CREATE OR REPLACE FUNCTION public.create_clinica_with_profile(p_nome TEXT)
RETURNS public.clinicas
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID;
  v_clinica public.clinicas;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  INSERT INTO public.clinicas (nome)
  VALUES (p_nome)
  RETURNING * INTO v_clinica;

  INSERT INTO public.perfis (user_id, clinica_id, role)
  VALUES (v_user, v_clinica.id, 'admin')
  ON CONFLICT (user_id, clinica_id) DO NOTHING;

  RETURN v_clinica;
END;
$$;

REVOKE ALL ON FUNCTION public.create_clinica_with_profile FROM public;
GRANT EXECUTE ON FUNCTION public.create_clinica_with_profile TO authenticated;

COMMIT;
