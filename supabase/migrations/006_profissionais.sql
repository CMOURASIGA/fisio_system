-- Habilita a RLS na tabela (se ainda não estiver habilitada)
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;

-- Cria a política para permitir que usuários autenticados insiram novos profissionais
CREATE POLICY "Permitir inserção para usuários autenticados"
ON public.profissionais
FOR INSERT
TO authenticated
WITH CHECK (true);
