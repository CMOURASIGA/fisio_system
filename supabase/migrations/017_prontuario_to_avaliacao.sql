-- 017_prontuario_to_avaliacao.sql
-- Cria tabela de prontuário terapêutico ocupacional (avaliação) com RLS por clínica.

BEGIN;

CREATE TABLE IF NOT EXISTS public.avaliacoes_to (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    profissional_id UUID REFERENCES public.profissionais(id) ON DELETE SET NULL,
    clinica_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
    nome_completo TEXT NOT NULL,
    idade INTEGER,
    naturalidade TEXT,
    estado_civil TEXT,
    genero TEXT,
    profissao TEXT,
    endereco_residencial TEXT,
    endereco_comercial TEXT,
    queixa_principal TEXT,
    historia_pregressa_e_atual_da_doenca TEXT,
    habitos_de_vida TEXT,
    tratamentos_realizados TEXT,
    antecedentes_pessoais_e_familiares TEXT,
    outros TEXT,
    exame_clinico_fisico_educacional_social TEXT,
    exames_complementares TEXT,
    diagnostico_terapeutico_ocupacional TEXT,
    prognostico_terapeutico_ocupacional TEXT,
    objetivos TEXT,
    qtd_atendimentos_provaveis TEXT,
    procedimentos TEXT,
    nome_terapeuta_ocupacional TEXT,
    crefito_terapeuta_ocupacional TEXT,
    nome_academico_estagiario_to TEXT,
    local TEXT,
    data_avaliacao DATE,
    assinatura_digital_terapeuta BOOLEAN DEFAULT FALSE,
    assinatura_digital_estagiario BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.avaliacoes_to ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Avaliacoes_TO - acesso por clinica" ON public.avaliacoes_to;

CREATE POLICY "Avaliacoes_TO - acesso por clinica" ON public.avaliacoes_to
  FOR ALL
  USING (clinica_id = public.get_current_clinica_id())
  WITH CHECK (clinica_id = public.get_current_clinica_id());

COMMIT;
