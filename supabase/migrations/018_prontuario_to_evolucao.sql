-- 018_prontuario_to_evolucao.sql
-- Cria tabela de evoluções em Terapia Ocupacional com RLS por clínica.

BEGIN;

CREATE TABLE IF NOT EXISTS public.evolucoes_to (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avaliacao_to_id UUID REFERENCES public.avaliacoes_to(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    profissional_id UUID REFERENCES public.profissionais(id) ON DELETE SET NULL,
    clinica_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
    data_evolucao DATE NOT NULL DEFAULT CURRENT_DATE,
    hora_evolucao TIME,
    numero_sessao INTEGER,
    procedimentos TEXT,
    intercorrencias TEXT,
    evolucao_estado_saude TEXT,
    nome_terapeuta_ocupacional TEXT,
    crefito_terapeuta_ocupacional TEXT,
    nome_academico_estagiario_to TEXT,
    assinatura_digital_terapeuta BOOLEAN DEFAULT FALSE,
    assinatura_digital_estagiario BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.evolucoes_to ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Evolucoes_TO - acesso por clinica" ON public.evolucoes_to;

CREATE POLICY "Evolucoes_TO - acesso por clinica" ON public.evolucoes_to
  FOR ALL
  USING (clinica_id = public.get_current_clinica_id())
  WITH CHECK (clinica_id = public.get_current_clinica_id());

COMMIT;
