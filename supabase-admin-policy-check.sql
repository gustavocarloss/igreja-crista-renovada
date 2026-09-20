-- Enable RLS on the meeting table
ALTER TABLE meeting ENABLE ROW LEVEL SECURITY;

-- Policy for INSERT: Only users with role = 'admin' can insert
CREATE POLICY "Admin users can insert meetings"
ON meeting
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM "user" 
    WHERE auth_user_id = auth.uid() 
      AND role = 'admin'
  )
);

-- Policy for UPDATE: Only users with role = 'admin' can update
CREATE POLICY "Admin users can update meetings"
ON meeting
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 
    FROM "user" 
    WHERE auth_user_id = auth.uid() 
      AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM "user" 
    WHERE auth_user_id = auth.uid() 
      AND role = 'admin'
  )
);

-- Policy for DELETE: Only users with role = 'admin' can delete
CREATE POLICY "Admin users can delete meetings"
ON meeting
FOR DELETE
USING (
  EXISTS (
    SELECT 1 
    FROM "user" 
    WHERE auth_user_id = auth.uid() 
      AND role = 'admin'
  )
);
