-- 016_prontuario_evolucao.sql
-- Cria tabela de evoluções clínicas vinculada à avaliação/prontuário e paciente, com RLS por clínica.

BEGIN;

CREATE TABLE IF NOT EXISTS public.evolucoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avaliacao_id UUID REFERENCES public.avaliacoes(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    profissional_id UUID REFERENCES public.profissionais(id) ON DELETE SET NULL,
    clinica_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
    data_evolucao DATE NOT NULL DEFAULT CURRENT_DATE,
    hora_evolucao TIME,
    numero_sessao INTEGER,
    procedimentos TEXT,
    intercorrencias TEXT,
    evolucao_estado_saude TEXT,
    nome_fisioterapeuta TEXT,
    crefito_fisioterapeuta TEXT,
    nome_academico_estagiario TEXT,
    assinatura_digital_fisioterapeuta BOOLEAN DEFAULT FALSE,
    assinatura_digital_estagiario BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.evolucoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Evolucoes - acesso por clinica" ON public.evolucoes;

CREATE POLICY "Evolucoes - acesso por clinica" ON public.evolucoes
  FOR ALL
  USING (clinica_id = public.get_current_clinica_id())
  WITH CHECK (clinica_id = public.get_current_clinica_id());

COMMIT;
