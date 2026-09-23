-- Habilita RLS na tabela attendance (segurança a nível de linha)
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas caso existam para evitar conflitos
DROP POLICY IF EXISTS "Enable read access for all users" ON attendance;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON attendance;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON attendance;
DROP POLICY IF EXISTS "Enable insert for users" ON attendance;
DROP POLICY IF EXISTS "Enable delete for users" ON attendance;

-- 1. Permite que todos vejam a lista de presenças (SELECT)
CREATE POLICY "Enable read access for all users" 
ON attendance FOR SELECT 
USING (true);

-- 2. Permite que o usuário insira a PRÓPRIA presença (INSERT)
CREATE POLICY "Enable insert for users" 
ON attendance FOR INSERT 
WITH CHECK (
  auth.uid() = (SELECT auth_user_id FROM "user" WHERE id = user_id)
);

-- 3. Permite que o usuário cancele a PRÓPRIA presença (DELETE)
CREATE POLICY "Enable delete for users" 
ON attendance FOR DELETE 
USING (
  auth.uid() = (SELECT auth_user_id FROM "user" WHERE id = user_id)
);
