-- 010_multi_tenancy_v2.sql
-- Escopo: Refatorar o sistema para um modelo multi-tenant, limpando dados e dependências antigas.
-- 1. Remove todas as políticas de RLS antigas para quebrar as dependências.
-- 2. Limpa os dados das tabelas afetadas.
-- 3. Cria a tabela `clinicas` e `perfis`.
-- 4. Altera as tabelas `pacientes`, `profissionais`, `atendimentos` para adicionar `clinica_id` e remover `criado_por`.
-- 5. Cria a função auxiliar `get_current_clinica_id`.
-- 6. Implementa as novas políticas de RLS estritas baseadas em `clinica_id`.

BEGIN;

-- 1. Limpar políticas antigas PRIMEIRO para evitar erros de dependência.
DROP POLICY IF EXISTS "Pacientes - select owner or professional" ON public.pacientes;
DROP POLICY IF EXISTS "Pacientes - insert own" ON public.pacientes;
DROP POLICY IF EXISTS "Pacientes - update owner or professional" ON public.pacientes;
DROP POLICY IF EXISTS "Pacientes - delete owner or professional" ON public.pacientes;
DROP POLICY IF EXISTS "Pacientes - select own or admin" ON public.pacientes;

DROP POLICY IF EXISTS "Profissionais - select all authenticated" ON public.profissionais;
DROP POLICY IF EXISTS "Profissionais - update own or admin" ON public.profissionais;
DROP POLICY IF EXISTS "Profissionais - insert own" ON public.profissionais;
DROP POLICY IF EXISTS "Profissionais - select own or admin" ON public.profissionais;
DROP POLICY IF EXISTS "Permitir update para usuários autenticados" ON public.profissionais;

DROP POLICY IF EXISTS "Atendimentos - select allowed" ON public.atendimentos;
DROP POLICY IF EXISTS "Atendimentos - insert own" ON public.atendimentos;
DROP POLICY IF EXISTS "Atendimentos - update allowed" ON public.atendimentos;
DROP POLICY IF EXISTS "Atendimentos - delete allowed" ON public.atendimentos;
DROP POLICY IF EXISTS "Atendimentos - select own/paciente/profissional/admin" ON public.atendimentos;

-- Desabilitar RLS temporariamente para limpar os dados e a estrutura
ALTER TABLE public.atendimentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profissionais DISABLE ROW LEVEL SECURITY;


-- 2. Limpar dados existentes. A ordem importa por causa das foreign keys.
-- Se houverem FKS, TRUNCATE ... CASCADE lida com isso.
TRUNCATE TABLE public.atendimentos, public.pacientes, public.profissionais RESTART IDENTITY CASCADE;


-- 3. Tabela de Clínicas (Tenants)
CREATE TABLE IF NOT EXISTS public.clinicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.clinicas IS 'Representa uma clínica ou tenant no sistema.';


-- 4. Tabela de Perfis (associa usuários a clínicas e define papéis)
-- Dropar a tabela 'profiles' antiga se existir, para evitar confusão.
DROP TABLE IF EXISTS public.profiles;
CREATE TABLE public.perfis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clinica_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'profissional')),
    UNIQUE(user_id, clinica_id)
);
COMMENT ON TABLE public.perfis IS 'Associa usuários a clínicas e define seus papéis.';
CREATE INDEX IF NOT EXISTS idx_perfis_user_id ON public.perfis(user_id);
CREATE INDEX IF NOT EXISTS idx_perfis_clinica_id ON public.perfis(clinica_id);


-- 5. Adicionar `clinica_id` às tabelas principais e remover `criado_por`
-- A coluna `criado_por` tem dependências, então usamos CASCADE.
ALTER TABLE public.pacientes DROP COLUMN IF EXISTS criado_por CASCADE;
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS clinica_id UUID REFERENCES public.clinicas(id) ON DELETE CASCADE;
ALTER TABLE public.pacientes ALTER COLUMN clinica_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pacientes_clinica_id ON public.pacientes(clinica_id);

ALTER TABLE public.profissionais DROP COLUMN IF EXISTS criado_por CASCADE;
ALTER TABLE public.profissionais ADD COLUMN IF NOT EXISTS clinica_id UUID REFERENCES public.clinicas(id) ON DELETE CASCADE;
ALTER TABLE public.profissionais ALTER COLUMN clinica_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profissionais_clinica_id ON public.profissionais(clinica_id);

ALTER TABLE public.atendimentos DROP COLUMN IF EXISTS criado_por CASCADE;
ALTER TABLE public.atendimentos ADD COLUMN IF NOT EXISTS clinica_id UUID REFERENCES public.clinicas(id) ON DELETE CASCADE;
ALTER TABLE public.atendimentos ALTER COLUMN clinica_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_atendimentos_clinica_id ON public.atendimentos(clinica_id);


-- 6. Função auxiliar para obter a clínica do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_clinica_id()
RETURNS UUID AS $$
DECLARE
    clinica_uuid UUID;
BEGIN
    SELECT clinica_id INTO clinica_uuid
    FROM public.perfis
    WHERE user_id = auth.uid()
    LIMIT 1;
    RETURN clinica_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON FUNCTION public.get_current_clinica_id() IS 'Obtém a clinica_id do usuário autenticado para uso nas políticas RLS.';


-- 7. Re-habilitar e implementar Políticas RLS Estritas
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;

-- Políticas para PACIENTES
CREATE POLICY "Pacientes - Acesso baseado na clínica" ON public.pacientes
  FOR ALL USING (clinica_id = public.get_current_clinica_id())
  WITH CHECK (clinica_id = public.get_current_clinica_id());

-- Políticas para PROFISSIONAIS
CREATE POLICY "Profissionais - Acesso baseado na clínica" ON public.profissionais
  FOR ALL USING (clinica_id = public.get_current_clinica_id())
  WITH CHECK (clinica_id = public.get_current_clinica_id());

-- Políticas para ATENDIMENTOS
CREATE POLICY "Atendimentos - Acesso baseado na clínica" ON public.atendimentos
  FOR ALL USING (clinica_id = public.get_current_clinica_id())
  WITH CHECK (clinica_id = public.get_current_clinica_id());

-- Política para a tabela de Perfis: usuários só podem ver perfis da sua própria clínica.
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Perfis - Acesso baseado na clínica" ON public.perfis
  FOR SELECT USING (clinica_id = public.get_current_clinica_id());

-- Política para a tabela de Clínicas: um usuário pode ver os detalhes da sua própria clínica.
ALTER TABLE public.clinicas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clínicas - Acesso de membros" ON public.clinicas
  FOR SELECT USING (id = public.get_current_clinica_id());

COMMIT;