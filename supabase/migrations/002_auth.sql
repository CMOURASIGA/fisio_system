-- Use CREATE OR REPLACE FUNCTION to be idempotent and DROP TRIGGER if exists before creating
create or replace function public.handle_auth_user_created()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, created_at)
  values (new.id,
          (new.raw_user_meta_data->>'full_name')::text,
          (new.raw_user_meta_data->>'avatar_url')::text,
          now())
  on conflict (id) do update set full_name = excluded.full_name, avatar_url = excluded.avatar_url;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_auth_user_created();

-- 2) Habilitar RLS e políticas básicas
alter table public.profiles enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Profiles - select own'
  ) THEN
    CREATE POLICY "Profiles - select own" ON public.profiles
      FOR SELECT USING ( auth.uid() = id );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Profiles - insert own'
  ) THEN
    CREATE POLICY "Profiles - insert own" ON public.profiles
      FOR INSERT WITH CHECK ( auth.uid() = id );
  END IF;
END
$$;

alter table public.pacientes enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pacientes' AND policyname = 'Pacientes - professionals or owner'
  ) THEN
    CREATE POLICY "Pacientes - professionals or owner" ON public.pacientes
      FOR ALL
      USING (
        -- allow read for any authenticated user, but restrict write to professionals (example)
        auth.role() = 'authenticated'
      )
      WITH CHECK (
        true
      );
  END IF;
END
$$;

alter table public.atendimentos enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'atendimentos' AND policyname = 'Atendimentos - own or professional'
  ) THEN
    CREATE POLICY "Atendimentos - own or professional" ON public.atendimentos
      FOR ALL
      USING (
        auth.uid() = criado_por OR auth.role() = 'authenticated'
      )
      WITH CHECK (
        auth.uid() = criado_por
      );
  END IF;
END
$$;

-- Observação: revise as políticas acima conforme as regras reais do seu produto.
