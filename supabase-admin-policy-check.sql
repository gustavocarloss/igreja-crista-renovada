-- Remove política antiga que liberava INSERT geral (inclusive para usuários não autenticados)
DROP POLICY "Enable insert for authenticated users only" ON meeting;

-- Apenas admins podem criar eventos
CREATE POLICY "Admin users can insert meetings"
ON meeting
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "user" 
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  )
);

-- Apenas admins podem editar eventos
CREATE POLICY "Admin users can update meetings"
ON meeting
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM "user" 
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "user" 
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  )
);

-- Apenas admins podem excluir eventos
CREATE POLICY "Admin users can delete meetings"
ON meeting
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM "user" 
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  )
);