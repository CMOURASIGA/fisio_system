-- 009_tighten_rls.sql
-- Escopo: isolar dados por usuario (multitenant) para profissionais, pacientes e atendimentos.
-- Ajusta politicas para que cada usuario autenticado veja apenas seus registros (criado_por) ou, opcionalmente, admin.

-- Profissionais: remover select amplo e restringir por criado_por ou admin
DROP POLICY IF EXISTS "Profissionais - select all authenticated" ON public.profissionais;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profissionais' AND policyname = 'Profissionais - select own or admin'
  ) THEN
    CREATE POLICY "Profissionais - select own or admin" ON public.profissionais
      FOR SELECT USING (
        criado_por = auth.uid()
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
      );
  END IF;
END
$$;

-- Profissionais: insert/update/delete permanecem restritos ao criado_por ou admin (já coberto nos arquivos anteriores)
-- Pacientes: garantir que somente dono (criado_por) ou admin veja/edite
DROP POLICY IF EXISTS "Pacientes - select owner or professional" ON public.pacientes;
DROP POLICY IF EXISTS "Pacientes - select owner or professional " ON public.pacientes;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pacientes' AND policyname = 'Pacientes - select own or admin'
  ) THEN
    CREATE POLICY "Pacientes - select own or admin" ON public.pacientes
      FOR SELECT USING (
        criado_por = auth.uid()
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
      );
  END IF;
END
$$;

-- Atendimentos: reforçar selecao apenas relacionada ao criador/paciente/profissional vinculado ou admin
DROP POLICY IF EXISTS "Atendimentos - select allowed" ON public.atendimentos;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'atendimentos' AND policyname = 'Atendimentos - select own/paciente/profissional/admin'
  ) THEN
    CREATE POLICY "Atendimentos - select own/paciente/profissional/admin" ON public.atendimentos
      FOR SELECT USING (
        criado_por = auth.uid()
        OR paciente_id IN (SELECT id FROM public.pacientes WHERE criado_por = auth.uid())
        OR profissional_id IN (SELECT id FROM public.profissionais WHERE criado_por = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
      );
  END IF;
END
$$;

-- Nota: estas politicas assumem um tenant por usuario. Se precisar compartilhar dados entre usuarios de um mesmo tenant,
-- crie uma coluna de tenant_id e ajuste as politicas para usar esse campo em vez de criado_por.
