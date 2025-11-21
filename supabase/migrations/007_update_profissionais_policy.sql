-- Drop the existing update policy
DROP POLICY IF EXISTS "Profissionais - update own or admin" ON public.profissionais;

-- Create a new policy to allow any authenticated user to update
CREATE POLICY "Permitir update para usuários autenticados"
ON public.profissionais
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
