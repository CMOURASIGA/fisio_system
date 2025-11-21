-- 003_ownership.sql
-- Add ownership columns and RLS policies to separate data per authenticated user and role

-- Add criado_por to pacientes and profissionais to record the owner/creator
alter table if exists public.pacientes
  add column if not exists criado_por uuid references auth.users on delete set null;

alter table if exists public.profissionais
  add column if not exists criado_por uuid references auth.users on delete set null;

-- Ensure indexes
create index if not exists idx_pacientes_criado_por on public.pacientes (criado_por);
create index if not exists idx_profissionais_criado_por on public.profissionais (criado_por);

-- RLS: pacientes
alter table public.pacientes enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pacientes' AND policyname = 'Pacientes - select owner or professional'
  ) THEN
    CREATE POLICY "Pacientes - select owner or professional" ON public.pacientes
      FOR SELECT USING (
        criado_por = auth.uid() OR
        exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'profissional') OR
        exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pacientes' AND policyname = 'Pacientes - insert own'
  ) THEN
    CREATE POLICY "Pacientes - insert own" ON public.pacientes
      FOR INSERT WITH CHECK ( criado_por = auth.uid() );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pacientes' AND policyname = 'Pacientes - update owner or professional'
  ) THEN
    CREATE POLICY "Pacientes - update owner or professional" ON public.pacientes
      FOR UPDATE USING (
        criado_por = auth.uid() OR
        exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'profissional') OR
        exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
      ) WITH CHECK (
        criado_por = auth.uid() OR
        exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'profissional') OR
        exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pacientes' AND policyname = 'Pacientes - delete owner or professional'
  ) THEN
    CREATE POLICY "Pacientes - delete owner or professional" ON public.pacientes
      FOR DELETE USING (
        criado_por = auth.uid() OR
        exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
      );
  END IF;
END
$$;

-- RLS: profissionais (only admin or the profissional can modify their record)
alter table public.profissionais enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profissionais' AND policyname = 'Profissionais - select all authenticated'
  ) THEN
    CREATE POLICY "Profissionais - select all authenticated" ON public.profissionais
      FOR SELECT USING (
        auth.role() = 'authenticated'
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profissionais' AND policyname = 'Profissionais - update own or admin'
  ) THEN
    CREATE POLICY "Profissionais - update own or admin" ON public.profissionais
      FOR UPDATE USING (
        criado_por = auth.uid() OR
        exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
      ) WITH CHECK (
        criado_por = auth.uid() OR
        exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profissionais' AND policyname = 'Profissionais - insert own'
  ) THEN
    CREATE POLICY "Profissionais - insert own" ON public.profissionais
      FOR INSERT WITH CHECK ( criado_por = auth.uid() );
  END IF;
END
$$;

-- RLS: atendimentos (allow patient owner, assigned professional or admin)
alter table public.atendimentos enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'atendimentos' AND policyname = 'Atendimentos - select allowed'
  ) THEN
    CREATE POLICY "Atendimentos - select allowed" ON public.atendimentos
      FOR SELECT USING (
        criado_por = auth.uid() OR
        paciente_id in (select id from public.pacientes where criado_por = auth.uid()) OR
        profissional_id in (select id from public.profissionais where criado_por = auth.uid()) OR
        exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'atendimentos' AND policyname = 'Atendimentos - insert own'
  ) THEN
    CREATE POLICY "Atendimentos - insert own" ON public.atendimentos
      FOR INSERT WITH CHECK ( criado_por = auth.uid() );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'atendimentos' AND policyname = 'Atendimentos - update allowed'
  ) THEN
    CREATE POLICY "Atendimentos - update allowed" ON public.atendimentos
      FOR UPDATE USING (
        criado_por = auth.uid() OR profissional_id in (select id from public.profissionais where criado_por = auth.uid())
      ) WITH CHECK (
        criado_por = auth.uid() OR profissional_id in (select id from public.profissionais where criado_por = auth.uid())
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'atendimentos' AND policyname = 'Atendimentos - delete allowed'
  ) THEN
    CREATE POLICY "Atendimentos - delete allowed" ON public.atendimentos
      FOR DELETE USING (
        criado_por = auth.uid() OR exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
      );
  END IF;
END
$$;

-- Note: adjust roles ('profissional','admin') names to match your app convention.
