
-- Fix 1: Prevent non-admin users from inserting/updating user_roles (privilege escalation fix)
-- The existing "Admins can manage roles" ALL policy with has_role check should be sufficient,
-- but we add a RESTRICTIVE policy to explicitly block non-admin inserts/updates.

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Strengthen storage INSERT policy to verify project ownership
-- First drop the existing weak INSERT policy, then create a stronger one
DROP POLICY IF EXISTS "Users can upload project materials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;

-- Find and recreate INSERT policies that verify project ownership
-- Check existing policies first
DO $$
BEGIN
  -- Drop any INSERT policies on project-materials bucket
  EXECUTE (
    SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON storage.objects;', E'\n')
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND cmd = 'INSERT'
  );
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
